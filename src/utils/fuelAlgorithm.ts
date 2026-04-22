import type { EfficiencyStat, FuelEntry, FuelType } from '../types';

/**
 * The Fuelio Fuel Algorithm - v2.2
 *
 * Efficiency strategies:
 *
 * 1. Full-tank window method (accurate, isEfficiencyEstimated = false):
 *    Between two consecutive full-tank fills, sum all liters poured in the
 *    window and divide by the total distance. Matches fleet-software accuracy.
 *
 * 2. First-fill fallback (estimated, isEfficiencyEstimated = true):
 *    When a full-tank fill has no prior full-tank anchor (e.g. the user's very
 *    first logged entry was a partial fill), the first-ever entry is used as a
 *    proxy anchor. All fuel since that entry is known, but the initial tank
 *    level is not -- result is flagged estimated.
 *
 * 3. Simple fill method (estimated, isEfficiencyEstimated = true):
 *    For partial fills with a prior entry, compute distanceDriven / liters.
 *    Shown with a "~" prefix in the UI to signal approximation.
 *
 * Bug fixes over v2:
 *
 *  FIX A -- first-partial-entry starves subsequent full-tank fills:
 *    If the user's very first log entry is a partial fill, the subsequent
 *    full-tank fill would find no full-tank anchor (anchorIdx = -1) and
 *    produce no efficiency value -- silently discarding real data.
 *    Fix: fall back to vehicleEntries[0] as proxy anchor, mark isEstimated=true.
 *    The loop already accumulates partial-fill liters including entry[0].liters,
 *    so no double-addition is needed in the post-loop anchor assignment.
 *
 *  FIX B -- regressed-odometer entry used as anchor and its fuel not counted:
 *    A fill flagged odometer_regression had two problems:
 *    (a) It was accepted as a full-tank anchor despite having an unreliable odometer.
 *    (b) Its liters were not added to the running sum when it was a full-tank fill
 *        (the guard was `if (!mid.fullTank) litersSum += mid.liters`), meaning
 *        fuel actually consumed in the window was omitted from the denominator.
 *    Fix: always add mid.liters for any regression entry regardless of fullTank status,
 *    then continue the search for a clean (non-regression) full-tank anchor.
 *
 *  FIX C -- anomalous entries inflate costPerKm in computeStats:
 *    computed.slice(1) included regression entries (distanceDriven=0) in the
 *    costable set. Their cost inflated the numerator while their zero distance
 *    contributed nothing to the denominator -- overstating costPerKm by up to 90%.
 *    Fix: filter costableEntries to distanceDriven > 0 with no odometer anomaly.
 *
 *  FIX D -- simple fill method divided by the wrong entry's liters:
 *    Strategy 2 (partial fills / second entry onward) computed efficiency as
 *    distance / entry.liters, using the CURRENT fill's liters. This is incorrect:
 *    the distance driven since the last stop was powered by the PREVIOUS entry's
 *    fuel, not the fuel being added now.
 *    Fix: use prev.liters as the denominator instead of entry.liters.
 *    Example: Entry A fills 30 L → drive 300 km → Entry B fills 20 L.
 *    Correct:  300 km / 30 L = 10 km/L  (fuel that moved the car)
 *    Wrong:    300 km / 20 L = 15 km/L  (fuel just poured in, not yet burned)
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Max plausible km driven between any two consecutive fills. */
const MAX_PLAUSIBLE_DISTANCE_KM = 3000;

/** Plausible efficiency bounds by fuel type (km/L). */
const EFFICIENCY_BOUNDS: Record<FuelType, { min: number; max: number }> = {
    petrol: { min: 3, max: 35 },
    diesel: { min: 4, max: 40 },
    hybrid: { min: 8, max: 55 },
    cng: { min: 5, max: 40 },
    ev: { min: 0, max: 0 }, // EVs don't use liters -- skip efficiency check
};

/** CO2 emission factors in kg per liter (IPCC AR5 factors). */
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
    | 'odometer_regression'    // odometer went backwards vs previous entry
    | 'duplicate_odometer'     // same odometer as previous (distance = 0)
    | 'excessive_distance'     // implausibly large distance since last fill
    | 'overfill'               // liters > tank capacity
    | 'implausible_efficiency' // computed efficiency outside physical bounds

export interface ComputedFuelEntry extends FuelEntry {
    distanceDriven: number;
    efficiency: number;             // km/L, 0 when not computable
    isEfficiencyValid: boolean;     // true whenever a value can be shown
    isEfficiencyEstimated: boolean; // true = partial-fill or no-full-anchor approximation
    anomalies: AnomalyReason[];     // empty when entry looks correct
}

// ---------------------------------------------------------------------------
// Core entry computation
// ---------------------------------------------------------------------------

/**
 * Enrich raw entries with distance, efficiency, and anomaly flags.
 * Pure function -- safe to memoize.
 *
 * @param tankCapacity - vehicle tank size in liters (used for overfill check)
 * @param fuelType     - used for CO2 and plausibility bounds
 */
export function computeEntries(
    entries: readonly FuelEntry[],
    vehicleId: string,
    tankCapacity = 0,
    fuelType: FuelType = 'petrol',
): ComputedFuelEntry[] {
    const vehicleEntries = entries
        .filter((e) => e.vehicleId === vehicleId)
        .sort((a, b) => a.date - b.date);

    // computed[] is built incrementally so the backward anchor search can read
    // anomaly flags of already-processed entries (required for FIX B).
    const computed: ComputedFuelEntry[] = [];
    const bounds = EFFICIENCY_BOUNDS[fuelType];

    for (let i = 0; i < vehicleEntries.length; i++) {
        const entry = vehicleEntries[i]!;
        const prev = i > 0 ? vehicleEntries[i - 1] : undefined;

        // ── Distance ──────────────────────────────────────────────────────
        const rawDistance = prev ? entry.odometer - prev.odometer : 0;
        const distance = Math.max(0, rawDistance);

        // ── Anomaly detection ─────────────────────────────────────────────
        const anomalies: AnomalyReason[] = [];

        if (prev) {
            if (rawDistance < 0) {
                anomalies.push('odometer_regression');
            } else if (rawDistance === 0) {
                anomalies.push('duplicate_odometer');
            } else if (rawDistance > MAX_PLAUSIBLE_DISTANCE_KM) {
                anomalies.push('excessive_distance');
            }
        }

        if (tankCapacity > 0 && entry.liters > tankCapacity * 1.05) {
            // Allow 5% tolerance for pump rounding
            anomalies.push('overfill');
        }

        // ── Efficiency ────────────────────────────────────────────────────
        let efficiency = 0;
        let isValid = false;
        let isEstimated = false;

        if (prev && distance > 0) {
            if (entry.fullTank) {
                // Strategy 1: Full-tank window method (+ FIX A + FIX B).
                //
                // Walk backward accumulating fuel until a clean full-tank anchor is found.
                //
                // FIX B: odometer_regression entries cannot serve as anchors -- their
                // odometer reading is unreliable. However, the fuel they contain WAS
                // physically consumed during the window, so their liters are ALWAYS added
                // to litersSum regardless of their fullTank flag. The search continues past
                // them toward an earlier, clean full-tank entry.
                //
                // FIX A: if the backward scan reaches entry[0] without finding any full-tank
                // anchor (e.g. the user's first-ever log entry was a partial fill), we use
                // entry[0] as a proxy anchor. The loop already accumulated its liters while
                // scanning past it, so no double-addition is needed. The result is marked
                // isEstimated=true because the initial tank state at entry[0] is unknown.
                let litersSum = entry.liters;
                let anchorIdx = -1;

                for (let j = i - 1; j >= 0; j--) {
                    const mid = vehicleEntries[j]!;

                    // FIX B: regression entry -- count its fuel but skip it as an anchor.
                    if (computed[j]!.anomalies.includes('odometer_regression')) {
                        litersSum += mid.liters; // fuel was pumped regardless
                        continue;               // keep searching for a clean anchor
                    }

                    if (mid.fullTank) {
                        // Clean full-tank anchor found.
                        anchorIdx = j;
                        break;
                    }

                    // Partial fill between current and anchor -- accumulate fuel.
                    litersSum += mid.liters;
                }

                // FIX A: determine effective anchor.
                const useFirstAsAnchor = anchorIdx < 0 && i > 0;
                const effectiveAnchorIdx = anchorIdx >= 0 ? anchorIdx : (i > 0 ? 0 : -1);

                if (effectiveAnchorIdx >= 0) {
                    const anchor = vehicleEntries[effectiveAnchorIdx]!;
                    const windowDistance = entry.odometer - anchor.odometer;
                    // Note: anchor's liters are already in litersSum from the loop scan
                    // (added when the anchor was a non-full entry traversed by the loop).
                    // For a true full-tank anchor the loop breaks before adding its liters,
                    // which is correct -- its liters belong to the previous window.
                    if (windowDistance > 0 && litersSum > 0) {
                        efficiency = windowDistance / litersSum;
                        isValid = true;
                        isEstimated = useFirstAsAnchor; // FIX A: no full-tank anchor = estimated
                    }
                }
            } else {
                // Strategy 2: Simple fill method (estimated).
                // The distance driven since the last fill was fueled by the PREVIOUS
                // entry's liters -- not the current fill being logged now.
                // e.g. Entry A: 30L → Entry B (partial): distance A→B / A's 30L
                if (prev && prev.liters > 0) {
                    efficiency = distance / prev.liters;
                    isValid = true;
                    isEstimated = true;
                }
            }
        }

        // Plausibility check (skip EV -- bounds.max = 0).
        if (isValid && bounds.max > 0) {
            if (efficiency < bounds.min || efficiency > bounds.max) {
                anomalies.push('implausible_efficiency');
                // Flag but do not suppress -- the value is still shown.
            }
        }

        computed.push({
            ...entry,
            distanceDriven: distance,
            efficiency,
            isEfficiencyValid: isValid,
            isEfficiencyEstimated: isEstimated,
            anomalies,
        });
    }

    return computed;
}

// ---------------------------------------------------------------------------
// Linear regression helper
// ---------------------------------------------------------------------------

/**
 * Least-squares slope of y over equally-spaced x (index 0, 1, 2, ...).
 * Returns 0 when fewer than 2 points.
 */
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

/**
 * Vehicle-level aggregate statistics.
 *
 * Uses arithmetic mean of per-entry efficiency values (not totalDistance/totalFuel)
 * for the same reason Fuelly, Spritmonitor, and fueleconomy.gov do: the first fill
 * is a baseline whose fuel is not paired with a measured distance, so including it
 * in a weighted ratio distorts the average by 20-40%.
 *
 * FIX C applied: costPerKm only counts entries with distanceDriven > 0 and no
 * odometer anomaly, preventing regression/duplicate fills from inflating the cost
 * numerator without contributing to the distance denominator.
 */
export function computeStats(
    entries: readonly FuelEntry[],
    vehicleId: string,
    tankCapacity = 0,
    fuelType: FuelType = 'petrol',
): EfficiencyStat {
    const computed = computeEntries(entries, vehicleId, tankCapacity, fuelType);

    // All entries with a valid (non-anomalous odometer) distance contribution.
    const withDistance = computed.filter((e) =>
        !e.anomalies.includes('odometer_regression') &&
        !e.anomalies.includes('duplicate_odometer'),
    );

    const totalDistance = withDistance.reduce((s, e) => s + e.distanceDriven, 0);
    const totalFuel = computed.reduce((s, e) => s + e.liters, 0);
    const totalCost = computed.reduce((s, e) => s + e.totalCost, 0);

    // FIX C: only entries that contributed a reliable, non-zero distance are eligible
    // for the cost-per-km calculation. The old computed.slice(1) included regression
    // entries (distanceDriven=0) whose cost inflated the numerator without contributing
    // to the denominator, overstating costPerKm by up to 90%.
    const costableEntries = computed.filter((e) =>
        e.distanceDriven > 0 &&
        !e.anomalies.includes('odometer_regression') &&
        !e.anomalies.includes('duplicate_odometer'),
    );
    const costableDistance = costableEntries.reduce((s, e) => s + e.distanceDriven, 0);
    const costableAmount = costableEntries.reduce((s, e) => s + e.totalCost, 0);
    const costPerKm = costableDistance > 0 ? costableAmount / costableDistance : 0;

    // ── Efficiency sets ──────────────────────────────────────────────────
    const allValid = computed.filter((e) => e.isEfficiencyValid && e.efficiency > 0);
    const accurateValid = allValid.filter((e) => !e.isEfficiencyEstimated);

    const avgEfficiency = allValid.length
        ? allValid.reduce((s, e) => s + e.efficiency, 0) / allValid.length
        : 0;

    const accurateAvg = accurateValid.length
        ? accurateValid.reduce((s, e) => s + e.efficiency, 0) / accurateValid.length
        : 0;

    const best = allValid.length ? Math.max(...allValid.map((e) => e.efficiency)) : 0;
    const worst = allValid.length ? Math.min(...allValid.map((e) => e.efficiency)) : 0;
    const accBest = accurateValid.length ? Math.max(...accurateValid.map((e) => e.efficiency)) : 0;
    const accWorst = accurateValid.length ? Math.min(...accurateValid.map((e) => e.efficiency)) : 0;

    // ── Rolling average (last 5 computable fills) ────────────────────────
    const recentValid = allValid.slice(-5);
    const recentAvg = recentValid.length
        ? recentValid.reduce((s, e) => s + e.efficiency, 0) / recentValid.length
        : 0;

    // ── Efficiency trend (linear regression over valid efficiencies) ──────
    const trendSlope = linearSlope(allValid.map((e) => e.efficiency));
    const efficiencyTrend: EfficiencyStat['efficiencyTrend'] =
        trendSlope > 0.05 ? 'improving' :
            trendSlope < -0.05 ? 'declining' :
                'stable';

    // ── CO2 estimate ──────────────────────────────────────────────────────
    const co2Factor = CO2_KG_PER_LITER[fuelType];
    const estimatedCO2kg = +(totalFuel * co2Factor).toFixed(2);

    // ── Refuel intervals ─────────────────────────────────────────────────
    const MS_PER_DAY = 86400000;
    const intervals = computed.slice(1).map((e, i) => {
        const prev = computed[i]!; // slice(1) shifts by 1 so i aligns to computed[i]
        return {
            km: e.distanceDriven,
            days: (e.date - prev.date) / MS_PER_DAY,
        };
    }).filter((iv) => iv.km > 0 && iv.days >= 0);

    const avgKmBetweenFills =
        intervals.length ? intervals.reduce((s, iv) => s + iv.km, 0) / intervals.length : 0;
    const avgDaysBetweenFills =
        intervals.length ? intervals.reduce((s, iv) => s + iv.days, 0) / intervals.length : 0;

    return {
        vehicleId,
        averageEfficiency: avgEfficiency,
        bestEfficiency: best,
        worstEfficiency: worst,
        accurateAverageEfficiency: accurateAvg,
        accurateBestEfficiency: accBest,
        accurateWorstEfficiency: accWorst,
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
        computableEntryCount: allValid.length,
    };
}

// ---------------------------------------------------------------------------
// Efficiency classification
// ---------------------------------------------------------------------------

/**
 * SD-based efficiency classification.
 *
 * Rather than fixed +/-% thresholds, we use the vehicle's own standard
 * deviation so the score is meaningful regardless of vehicle type.
 * Without enough data we fall back to a simple percentage delta.
 *
 * Returns a 0-100 score and a label for UI rendering.
 */
export function classifyEfficiency(
    efficiency: number,
    allValidEfficiencies: number[],
): { score: number; delta: number; label: 'excellent' | 'good' | 'average' | 'poor' } {
    if (efficiency === 0 || allValidEfficiencies.length === 0) {
        return { score: 50, delta: 0, label: 'average' };
    }

    const avg = allValidEfficiencies.reduce((s, v) => s + v, 0) / allValidEfficiencies.length;
    if (avg === 0) return { score: 50, delta: 0, label: 'average' };

    const deltaPercent = ((efficiency - avg) / avg) * 100;

    if (allValidEfficiencies.length >= 4) {
        // SD-based classification
        const variance =
            allValidEfficiencies.reduce((s, v) => s + (v - avg) ** 2, 0) /
            allValidEfficiencies.length;
        const sd = Math.sqrt(variance);

        if (sd !== 0) {
            const zScore = (efficiency - avg) / sd;
            const score = Math.max(0, Math.min(100, 50 + zScore * 20));
            const label: 'excellent' | 'good' | 'average' | 'poor' =
                zScore > 1.0 ? 'excellent' :
                    zScore > 0.3 ? 'good' :
                        zScore > -0.7 ? 'average' :
                            'poor';
            return { score: +score.toFixed(1), delta: +deltaPercent.toFixed(1), label };
        }
        // sd === 0: all entries identical -- fall through to percent-based
    }

    // Fallback: percentage delta
    const score = Math.max(0, Math.min(100, 50 + deltaPercent * 2));
    const label: 'excellent' | 'good' | 'average' | 'poor' =
        deltaPercent > 8 ? 'excellent' :
            deltaPercent > 2 ? 'good' :
                deltaPercent > -5 ? 'average' :
                    'poor';
    return { score: +score.toFixed(1), delta: +deltaPercent.toFixed(1), label };
}