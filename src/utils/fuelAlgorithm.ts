import type { EfficiencyStat, FuelEntry, FuelType } from '../types';

/**
 * The Fuelio Fuel Algorithm — v3 (full-to-full window method).
 *
 * Fuel economy can only be measured between two FULL-tank fills. This is the
 * methodology used by Fuelly, Spritmonitor and fleet software, and it is the only
 * statistically honest one:
 *
 *   • A FULL fill marks a known tank level (brim-full).
 *   • Any PARTIAL fills after it do NOT get their own economy — their fuel is
 *     "banked" and rolls forward into the next window.
 *   • The next FULL fill CLOSES the window. The fuel added across the whole window
 *     (banked partials + the closing fill) exactly equals the fuel burned over the
 *     window's distance, because the tank went full → full:
 *
 *        economy(km/L) = (odoClose − odoAnchor) / (Σ partials in window + closingFill)
 *
 *   • The very first fill (or any fill before the first full one) only establishes
 *     a baseline — no economy is produced, and its fuel is not attributed to a window.
 *
 * Design choices vs. the v2 algorithm this replaces:
 *   1. Entries are sorted by ODOMETER (date as tiebreak), not by date — odometer is
 *      the physically monotonic axis, so legitimately back-dated fills are no longer
 *      misflagged as odometer regressions and silently dropped.
 *   2. PARTIAL fills never fabricate a per-fill economy number (the old
 *      `distance / prevLiters` estimate was physically meaningless and polluted the
 *      headline average). They bank into the open window instead.
 *   3. `averageEfficiency` is DISTANCE-WEIGHTED (Σ window distance / Σ window fuel),
 *      not a mean-of-ratios — short windows no longer over-weight the average.
 *   4. Anomalous windows (excessive distance, implausible economy, overfill) are
 *      excluded from every aggregate, not merely flagged.
 *   5. EVs short-circuit volumetric economy entirely (km/L is meaningless for them);
 *      distance, cost and intervals still compute.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Max plausible km driven between any two consecutive fills. */
const MAX_PLAUSIBLE_DISTANCE_KM = 3000;

/** Max plausible days between fills (older gaps are treated as outliers). */
const MAX_PLAUSIBLE_INTERVAL_DAYS = 365;

/** Plausible efficiency bounds by fuel type (km/L). */
const EFFICIENCY_BOUNDS: Record<FuelType, { min: number; max: number }> = {
    petrol: { min: 3, max: 35 },
    diesel: { min: 4, max: 40 },
    hybrid: { min: 8, max: 55 },
    cng: { min: 5, max: 40 },
    ev: { min: 0, max: 0 }, // EVs don't use litres — volumetric economy is skipped entirely
};

/** CO2 emission factors in kg per litre (IPCC AR5 / DEFRA). */
const CO2_KG_PER_LITER: Record<FuelType, number> = {
    petrol: 2.31,
    diesel: 2.68,
    hybrid: 2.31, // petrol engine in hybrid
    cng: 1.63,
    ev: 0,
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AnomalyReason =
    | 'odometer_regression'    // odometer went backwards vs the previous entry
    | 'duplicate_odometer'     // same odometer as the previous entry (distance = 0)
    | 'excessive_distance'     // implausibly large distance since the last fill
    | 'overfill'               // litres > tank capacity (+ tolerance)
    | 'implausible_efficiency'; // computed window economy outside physical bounds

export interface ComputedFuelEntry extends FuelEntry {
    /** km since the previous entry (clamped ≥ 0). */
    distanceDriven: number;
    /** km/L for the window this fill CLOSES; 0 for partials / non-closing fills. */
    efficiency: number;
    /** true only for a measured full-to-full closing fill. */
    isEfficiencyValid: boolean;
    /** Retained for API compatibility. v3 never fabricates estimates, so always false. */
    isEfficiencyEstimated: boolean;
    anomalies: AnomalyReason[];
    /** km spanned by the window this fill closes (0 if it closes none). */
    windowDistance: number;
    /** litres of fuel attributed to the window this fill closes (0 if none). */
    windowFuel: number;
    /** true if this fill closed an exact measurement window (a FULL tank to FULL tank). */
    isFullTankClosing: boolean;
}

// ---------------------------------------------------------------------------
// Core entry computation
// ---------------------------------------------------------------------------

/**
 * Enrich raw entries with per-entry distance, full-to-full window economy, and
 * anomaly flags. Pure function — safe to memoize.
 *
 * @param tankCapacity vehicle tank size in litres (overfill check; 0 = unknown)
 * @param fuelType     CO2 factor + plausibility bounds; 'ev' skips economy
 */
export function computeEntries(
    entries: readonly FuelEntry[],
    vehicleId: string,
    tankCapacity = 0,
    fuelType: FuelType = 'petrol',
): ComputedFuelEntry[] {
    const isEV = fuelType === 'ev';
    const bounds = EFFICIENCY_BOUNDS[fuelType];

    // Sort by odometer (physical axis), date as tiebreak. Guarantees non-negative
    // distances for correctly-entered data regardless of log/date order.
    const vehicleEntries = entries
        .filter((e) => e.vehicleId === vehicleId)
        .slice()
        .sort((a, b) => a.odometer - b.odometer || a.date - b.date);

    const computed: ComputedFuelEntry[] = [];

    // Forward window accumulator.
    let anchorOdo: number | null = null; // odometer of the last full-tank anchor
    let carryFuel = 0;                    // banked partial-fill litres since the anchor

    for (let i = 0; i < vehicleEntries.length; i++) {
        const entry = vehicleEntries[i]!;
        const prev = i > 0 ? vehicleEntries[i - 1]! : undefined;

        const rawDistance = prev ? entry.odometer - prev.odometer : 0;
        const distance = Math.max(0, rawDistance);

        // ── Anomaly detection ──────────────────────────────────────────────
        const anomalies: AnomalyReason[] = [];
        if (prev) {
            if (rawDistance < 0) anomalies.push('odometer_regression');
            else if (rawDistance === 0) anomalies.push('duplicate_odometer');
            else if (rawDistance > MAX_PLAUSIBLE_DISTANCE_KM) anomalies.push('excessive_distance');
        }
        if (tankCapacity > 0 && entry.liters > tankCapacity * 1.05) {
            anomalies.push('overfill'); // 5% tolerance for pump rounding
        }

        // ── Window economy (full-tank to full-tank) ──────────────────────────
        // A FULL fill is the ONLY measurement anchor: filled to the top, the tank
        // level is known to be exactly the capacity WITHOUT trusting a fuel gauge
        // (which can be inaccurate). Between two full fills the fuel burned equals
        // the fuel added in between — the banked partial fills plus this fill — so
        // economy = distance / burned, with no gauge reading anywhere in the math.
        // Partial fills simply bank their litres until the next full tank closes a
        // window. (Economy for partial-only logs is handled by estimatePartialEconomy,
        // purely from odometer distance and litres.)
        const isAnchor = !isEV && entry.fullTank;

        let efficiency = 0;
        let isValid = false;
        let windowDistance = 0;
        let windowFuel = 0; // fuel BURNED across the window (the economy denominator)
        let isFullTankClosing = false;

        if (!isEV) {
            if (isAnchor) {
                if (anchorOdo !== null) {
                    // burned = banked partial fills + this full fill, across the window.
                    windowFuel = carryFuel + entry.liters;
                    windowDistance = entry.odometer - anchorOdo;
                    if (windowFuel > 0 && windowDistance > 0) {
                        efficiency = windowDistance / windowFuel;
                        isValid = true;
                        isFullTankClosing = true;
                        if (efficiency < bounds.min || efficiency > bounds.max) {
                            anomalies.push('implausible_efficiency');
                        }
                    }
                }
                // This full fill opens the next window; the fuel just added belonged to
                // the window that just closed, so the next window starts empty.
                anchorOdo = entry.odometer;
                carryFuel = 0;
            } else {
                // Partial fill: bank its fuel for the next full-tank anchor.
                // (Fills before the first anchor are pre-baseline and get discarded when
                // that first anchor resets the accumulator — they can't be measured.)
                carryFuel += entry.liters;
            }
        }

        computed.push({
            ...entry,
            distanceDriven: distance,
            efficiency,
            isEfficiencyValid: isValid,
            isEfficiencyEstimated: false,
            anomalies,
            windowDistance,
            windowFuel,
            isFullTankClosing,
        });
    }

    return computed;
}

// ---------------------------------------------------------------------------
// Linear regression helper
// ---------------------------------------------------------------------------

/** Least-squares slope of y over equally-spaced x (0,1,2,…). 0 for < 2 points. */
function linearSlope(values: number[]): number {
    const n = values.length;
    if (n < 2) return 0;
    const meanX = (n - 1) / 2;
    const meanY = values.reduce((s, v) => s + v, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
        const dx = i - meanX;
        num += dx * (values[i]! - meanY);
        den += dx * dx;
    }
    return den === 0 ? 0 : num / den;
}

// ---------------------------------------------------------------------------
// Stats computation
// ---------------------------------------------------------------------------

const isAnomalousDistance = (e: ComputedFuelEntry): boolean =>
    e.anomalies.includes('odometer_regression') ||
    e.anomalies.includes('duplicate_odometer') ||
    e.anomalies.includes('excessive_distance');

/**
 * Vehicle-level aggregate statistics, all derived from measured full-to-full
 * windows (efficiency) and clean distance contributions (distance/cost).
 */
export function computeStats(
    entries: readonly FuelEntry[],
    vehicleId: string,
    tankCapacity = 0,
    fuelType: FuelType = 'petrol',
): EfficiencyStat {
    return computeStatsFromEntries(
        computeEntries(entries, vehicleId, tankCapacity, fuelType),
        vehicleId,
        fuelType,
    );
}

/**
 * Aggregate stats from already-computed entries. Lets a caller run computeEntries
 * once and derive both the enriched list and the stats from it, avoiding a second
 * full O(n) pass (perf win for per-vehicle cards on low-end devices).
 */
export function computeStatsFromEntries(
    computed: ComputedFuelEntry[],
    vehicleId: string,
    fuelType: FuelType = 'petrol',
): EfficiencyStat {

    // ── Distance & cost (clean contributions only) ─────────────────────────
    const cleanDistance = computed.filter((e) => e.distanceDriven > 0 && !isAnomalousDistance(e));
    const totalDistance = cleanDistance.reduce((s, e) => s + e.distanceDriven, 0);
    const totalFuel = computed.reduce((s, e) => s + e.liters, 0);
    const totalCost = computed.reduce((s, e) => s + e.totalCost, 0);

    const costableAmount = cleanDistance.reduce((s, e) => s + e.totalCost, 0);
    const costPerKm = totalDistance > 0 ? costableAmount / totalDistance : 0;

    // ── Measured efficiency windows (the only trustworthy economy set) ──────
    const measured = computed.filter((e) =>
        e.isFullTankClosing &&
        e.isEfficiencyValid &&
        e.windowFuel > 0 &&
        e.windowDistance > 0 &&
        !e.anomalies.includes('excessive_distance') &&
        !e.anomalies.includes('implausible_efficiency') &&
        !e.anomalies.includes('overfill'),
    );

    // Distance-weighted average — Σ window distance / Σ window fuel.
    const sumWD = measured.reduce((s, e) => s + e.windowDistance, 0);
    const sumWF = measured.reduce((s, e) => s + e.windowFuel, 0);
    const averageEfficiency = sumWF > 0 ? sumWD / sumWF : 0;

    const effs = measured.map((e) => e.efficiency);
    const best = effs.length ? Math.max(...effs) : 0;
    const worst = effs.length ? Math.min(...effs) : 0;

    // Recent: last up-to-5 measured windows, distance-weighted.
    const recent = measured.slice(-5);
    const recentWD = recent.reduce((s, e) => s + e.windowDistance, 0);
    const recentWF = recent.reduce((s, e) => s + e.windowFuel, 0);
    const recentAvg = recentWF > 0 ? recentWD / recentWF : 0;

    // Trend over measured window economies (odometer order), relative stable band.
    const trendSlope = linearSlope(effs);
    const stableBand = Math.max(0.05, averageEfficiency * 0.01);
    const efficiencyTrend: EfficiencyStat['efficiencyTrend'] =
        trendSlope > stableBand ? 'improving' :
            trendSlope < -stableBand ? 'declining' :
                'stable';

    // ── CO2 ────────────────────────────────────────────────────────────────
    const estimatedCO2kg = +(totalFuel * CO2_KG_PER_LITER[fuelType]).toFixed(2);

    // ── Refuel intervals (clean + bounded) ─────────────────────────────────
    const MS_PER_DAY = 86400000;
    const intervals = computed
        .slice(1)
        .map((e, i) => ({
            km: e.distanceDriven,
            days: (e.date - computed[i]!.date) / MS_PER_DAY,
            anomalous: isAnomalousDistance(e),
        }))
        .filter((iv) => !iv.anomalous && iv.km > 0 && iv.days >= 0 && iv.days <= MAX_PLAUSIBLE_INTERVAL_DAYS);
    const avgKmBetweenFills =
        intervals.length ? intervals.reduce((s, iv) => s + iv.km, 0) / intervals.length : 0;
    const avgDaysBetweenFills =
        intervals.length ? intervals.reduce((s, iv) => s + iv.days, 0) / intervals.length : 0;

    return {
        vehicleId,
        averageEfficiency,
        bestEfficiency: best,
        worstEfficiency: worst,
        // v3: every counted window is a clean measurement, so the "accurate" set equals the main set.
        accurateAverageEfficiency: averageEfficiency,
        accurateBestEfficiency: best,
        accurateWorstEfficiency: worst,
        recentAverageEfficiency: recentAvg,
        efficiencyTrend,
        efficiencyTrendSlope: +trendSlope.toFixed(4),
        totalDistance,
        totalFuel,
        totalCost,
        costPerKm: +costPerKm.toFixed(4),
        estimatedCO2kg,
        avgKmBetweenFills: +avgKmBetweenFills.toFixed(1),
        avgDaysBetweenFills: +avgDaysBetweenFills.toFixed(1),
        entryCount: computed.length,
        computableEntryCount: measured.length,
    };
}

// ---------------------------------------------------------------------------
// Efficiency classification (per-fill badge vs the vehicle's own baseline)
// ---------------------------------------------------------------------------

export type EfficiencyLabel = 'excellent' | 'good' | 'average' | 'poor';

/**
 * Score one window economy against the vehicle's own distribution. Uses a z-score
 * once there are enough samples (so the bands adapt to the vehicle), falling back
 * to a percentage delta for sparse data. Bands are contiguous and non-overlapping.
 */
export function classifyEfficiency(
    efficiency: number,
    measuredEfficiencies: number[],
): { score: number; delta: number; label: EfficiencyLabel } {
    if (efficiency <= 0 || measuredEfficiencies.length === 0) {
        return { score: 50, delta: 0, label: 'average' };
    }

    const avg = measuredEfficiencies.reduce((s, v) => s + v, 0) / measuredEfficiencies.length;
    if (avg <= 0) return { score: 50, delta: 0, label: 'average' };

    const deltaPercent = ((efficiency - avg) / avg) * 100;

    if (measuredEfficiencies.length >= 4) {
        const variance =
            measuredEfficiencies.reduce((s, v) => s + (v - avg) ** 2, 0) / measuredEfficiencies.length;
        const sd = Math.sqrt(variance);
        if (sd > 0) {
            const z = (efficiency - avg) / sd;
            const score = Math.max(0, Math.min(100, 50 + z * 20));
            const label: EfficiencyLabel =
                z >= 1.0 ? 'excellent' : z >= 0.3 ? 'good' : z >= -0.7 ? 'average' : 'poor';
            return { score: +score.toFixed(1), delta: +deltaPercent.toFixed(1), label };
        }
    }

    // Sparse-data fallback: contiguous percentage bands (no gaps/overlap).
    const score = Math.max(0, Math.min(100, 50 + deltaPercent * 2));
    const label: EfficiencyLabel =
        deltaPercent >= 8 ? 'excellent' : deltaPercent >= 2 ? 'good' : deltaPercent >= -5 ? 'average' : 'poor';
    return { score: +score.toFixed(1), delta: +deltaPercent.toFixed(1), label };
}

// ---------------------------------------------------------------------------
// Partial-tank economy ESTIMATE (fallback when no exact window exists)
// ---------------------------------------------------------------------------

export interface PartialTankEstimate {
    vehicleId: string;
    economyCentral: number; // km/L best estimate = distance / fuel-added-after-first
    economyMin: number;     // km/L guaranteed lower bound (from tank capacity)
    economyMax: number;     // km/L guaranteed upper bound
    relHalfWidth: number;   // (max - min) / (2 * central); shrinks ~ 1/distance
    confidence: number;     // 0..100, rises with distance + anchor fills, floors at bias
    confidenceLabel: 'low' | 'moderate' | 'high';
    spanDistance: number;   // km
    spanFuel: number;       // L added after the first fill
    fillCount: number;
}

const PARTIAL_MIN_DISTANCE_KM = 300;
const PARTIAL_TOL_MAX = 0.5;          // ±50% relative uncertainty => confidence 0
const PARTIAL_FILL_NOISE_REL = 0.01;  // ~1% per-fill pump/slosh/temperature noise
const PARTIAL_BIAS_FLOOR = 0.02;      // irreducible systematic floor (odometer/meter bias)

const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));

/**
 * Honest economy ESTIMATE for partial-only logs (no full fills and no recorded tank
 * levels). From the fuel-balance identity burned = fuelAdded + (levelStart − levelEnd),
 * with each unknown endpoint level bounded by [0, capacity], the economy is a provable
 * interval whose relative width shrinks ~ 1/distance. The endpoint anchors are the
 * span's OWN first and last fills (their post-fill level lies in [f, C]) — using an
 * arbitrary large interior fill would break the guarantee.
 *
 * Returns null when an exact window already exists (the precise path owns the number),
 * for EVs, without a tank capacity, or when the data is too thin to be meaningful.
 */
export function estimatePartialEconomy(
    entries: readonly FuelEntry[],
    vehicleId: string,
    tankCapacity = 0,
    fuelType: FuelType = 'petrol',
): PartialTankEstimate | null {
    if (fuelType === 'ev' || tankCapacity <= 0) return null;

    const computed = computeEntries(entries, vehicleId, tankCapacity, fuelType);
    if (computed.some((e) => e.isFullTankClosing && e.isEfficiencyValid)) return null;

    const span = computed.filter((e) => !e.anomalies.includes('overfill'));
    if (span.length < 2) return null;

    const first = span[0]!;
    const last = span[span.length - 1]!;
    const C = tankCapacity;
    const bounds = EFFICIENCY_BOUNDS[fuelType];

    // Distance = sum of the per-leg distances for non-anomalous legs only (skip the
    // first leg, which has no prior fill). Anomalous legs (regression/duplicate/
    // excessive) contribute neither their distance nor the fuel that crossed them.
    let distance = 0;
    for (let i = 1; i < span.length; i++) {
        if (!isAnomalousDistance(span[i]!)) distance += span[i]!.distanceDriven;
    }
    if (distance < PARTIAL_MIN_DISTANCE_KM) return null;

    // Fuel added back after the first fill (the first fill is the opening residual marker).
    let fuelAfterFirst = 0;
    for (let i = 1; i < span.length; i++) fuelAfterFirst += span[i]!.liters;
    if (fuelAfterFirst <= 1e-6) return null;

    // Endpoint anchors: the first/last fills' own volumes bound the endpoint levels.
    const fStart = first.liters;
    const fEnd = last.liters;
    const EPS = 1e-6;

    // Clamp the burn interval to physical bounds so a small fill into a big tank
    // (fuelAfterFirst + fStart < C) can't collapse burnedLo to EPS and blow the
    // economyMax/relHalfWidth up to "999999". The burn can never be less than the
    // most-efficient case (distance / bounds.max) nor more than the least-efficient
    // (distance / bounds.min). The fuel-balance endpoint bounds still apply on top,
    // so genuine endpoint fills — not the interior — drive the interval.
    const burnFloor = bounds.max > 0 ? distance / bounds.max : EPS;   // can't burn less than the most-efficient case
    const burnCeil = bounds.min > 0 ? distance / bounds.min : (fuelAfterFirst + C);
    const burnedLo = Math.max(burnFloor, fuelAfterFirst + fStart - C, EPS); // best case (fewest litres burned)
    const burnedHi = Math.max(burnedLo, Math.min(burnCeil, fuelAfterFirst + C - fEnd)); // worst case (most burned)

    const economyCentral = distance / fuelAfterFirst;
    const economyMax = distance / burnedLo; // guaranteed upper bound, clamped to plausibility
    const economyMin = distance / burnedHi; // guaranteed lower bound, clamped to plausibility

    const fillsAfterFirst = span.length - 1;
    const sigmaEndpoint = Math.sqrt(((C - fStart) ** 2 + (C - fEnd) ** 2) / 12);
    const sigmaRel = Math.sqrt(
        (sigmaEndpoint / fuelAfterFirst) ** 2 +              // endpoint/capacity term ~ 1/F
        PARTIAL_FILL_NOISE_REL ** 2 / Math.max(1, fillsAfterFirst) + // per-fill noise ~ 1/√N
        PARTIAL_BIAS_FLOOR ** 2,                            // systematic floor
    );
    const confidence = Math.round(100 * clamp01(1 - sigmaRel / PARTIAL_TOL_MAX));
    const confidenceLabel = confidence >= 80 ? 'high' : confidence >= 50 ? 'moderate' : 'low';

    return {
        vehicleId,
        economyCentral: +economyCentral.toFixed(2),
        economyMin: +economyMin.toFixed(2),
        economyMax: +economyMax.toFixed(2),
        relHalfWidth: +((economyMax - economyMin) / (2 * economyCentral)).toFixed(3),
        confidence,
        confidenceLabel,
        spanDistance: Math.round(distance),
        spanFuel: +fuelAfterFirst.toFixed(2),
        fillCount: fillsAfterFirst,
    };
}
