/**
 * Validation harness for the v3 fuel algorithm (full-to-full window method).
 * Pure logic, no React Native — run with:  node --test scripts/fuel-algorithm.test.mjs
 *
 * Node 24 strips the TypeScript types from the imported .ts module at load time.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { classifyEfficiency, computeEntries, computeStats, estimatePartialEconomy } from '../src/utils/fuelAlgorithm.ts';

let seq = 0;
/** Build a FuelEntry. odo in km, liters in L, price per L, level = tank fraction after fill (0..1). */
const fill = (odometer, liters, fullTank, { price = 1, date = ++seq * 86400000, level } = {}) => ({
  id: `f${++seq}`,
  vehicleId: 'v1',
  date,
  liters,
  pricePerLiter: price,
  odometer,
  fullTank,
  tankLevelAfter: level,
  totalCost: Math.round(liters * price * 100) / 100,
});

const approx = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps;

// ── 1. Simple full → full, no partials ──────────────────────────────────────
test('full-to-full window: 500 km on 50 L = 10 km/L', () => {
  const e = [fill(1000, 40, true), fill(1500, 50, true)];
  const s = computeStats(e, 'v1', 60, 'petrol');
  assert.ok(approx(s.averageEfficiency, 10), `got ${s.averageEfficiency}`);
  assert.equal(s.computableEntryCount, 1); // first fill is baseline only
});

// ── 2. Partial fill banks into the next full window ─────────────────────────
test('full → partial → full: partials are summed into the window', () => {
  const e = [fill(1000, 40, true), fill(1300, 20, false), fill(1600, 30, true)];
  const s = computeStats(e, 'v1', 60, 'petrol');
  // window distance 600 km, window fuel 20 + 30 = 50 L => 12 km/L
  assert.ok(approx(s.averageEfficiency, 12), `got ${s.averageEfficiency}`);
  const c = computeEntries(e, 'v1', 60, 'petrol');
  assert.equal(c[1].isEfficiencyValid, false); // the partial gets NO economy of its own
  assert.equal(c[2].isFullTankClosing, true);
});

// ── 3. Average is DISTANCE-WEIGHTED, not a mean of ratios ────────────────────
test('average is distance-weighted (Σdist/Σfuel), not mean-of-ratios', () => {
  // W1: 100 km / 20 L = 5 km/L ; W2: 1000 km / 50 L = 20 km/L
  const e = [fill(0, 40, true), fill(100, 20, true), fill(1100, 50, true)];
  const s = computeStats(e, 'v1', 60, 'petrol');
  const weighted = 1100 / 70;       // = 15.714…  (correct)
  const meanOfRatios = (5 + 20) / 2; // = 12.5     (the old, wrong way)
  assert.ok(approx(s.averageEfficiency, weighted), `got ${s.averageEfficiency}, want ${weighted}`);
  assert.ok(!approx(s.averageEfficiency, meanOfRatios));
  assert.ok(approx(s.bestEfficiency, 20));
  assert.ok(approx(s.worstEfficiency, 5));
});

// ── 4. Odometer-primary sort fixes back-dated entries ───────────────────────
test('back-dated entry (later date, higher odometer) is NOT a false regression', () => {
  const e = [
    fill(1000, 40, true, { date: 3_000_000_000 }), // logged later in time
    fill(1500, 50, true, { date: 1_000_000_000 }), // earlier date but higher odometer
  ];
  const c = computeEntries(e, 'v1', 60, 'petrol');
  for (const entry of c) assert.ok(!entry.anomalies.includes('odometer_regression'));
  const s = computeStats(e, 'v1', 60, 'petrol');
  assert.ok(approx(s.averageEfficiency, 10), `got ${s.averageEfficiency}`);
});

// ── 5. Single entry / baseline only ─────────────────────────────────────────
test('single fill yields no economy', () => {
  const s = computeStats([fill(1000, 40, true)], 'v1', 60, 'petrol');
  assert.equal(s.averageEfficiency, 0);
  assert.equal(s.computableEntryCount, 0);
});

// ── 6. EV: no volumetric economy, but distance still computed ───────────────
test('EV produces no km/L but keeps distance and zero CO2', () => {
  const e = [fill(0, 40, true), fill(500, 50, true)];
  const s = computeStats(e, 'v1', 60, 'ev');
  assert.equal(s.averageEfficiency, 0);
  assert.equal(s.computableEntryCount, 0);
  assert.equal(s.estimatedCO2kg, 0);
  assert.equal(s.totalDistance, 500);
});

// ── 7. Excessive distance window is excluded from aggregates ────────────────
test('excessive distance (>3000 km) window excluded', () => {
  const e = [fill(1000, 40, true), fill(5000, 50, true)]; // 4000 km jump
  const c = computeEntries(e, 'v1', 60, 'petrol');
  assert.ok(c[1].anomalies.includes('excessive_distance'));
  const s = computeStats(e, 'v1', 60, 'petrol');
  assert.equal(s.computableEntryCount, 0);
  assert.equal(s.averageEfficiency, 0);
});

// ── 8. Implausible economy excluded ─────────────────────────────────────────
test('implausible economy (100 km/L petrol) excluded', () => {
  const e = [fill(1000, 40, true), fill(1100, 1, true)]; // 100 km on 1 L
  const c = computeEntries(e, 'v1', 60, 'petrol');
  assert.ok(c[1].anomalies.includes('implausible_efficiency'));
  const s = computeStats(e, 'v1', 60, 'petrol');
  assert.equal(s.computableEntryCount, 0);
});

// ── 9. cost per km uses clean distance only ─────────────────────────────────
test('costPerKm = clean cost / clean distance', () => {
  const e = [fill(1000, 40, true, { price: 1 }), fill(1500, 50, true, { price: 1 })];
  const s = computeStats(e, 'v1', 60, 'petrol');
  // only the 2nd entry has distance (500 km), cost 50 => 0.10 /km
  assert.ok(approx(s.costPerKm, 0.1), `got ${s.costPerKm}`);
});

// ── 10. duplicate odometer = no window, no crash ────────────────────────────
test('duplicate odometer yields no economy', () => {
  const e = [fill(1000, 40, true), fill(1000, 30, true)];
  const c = computeEntries(e, 'v1', 60, 'petrol');
  assert.ok(c[1].anomalies.includes('duplicate_odometer'));
  const s = computeStats(e, 'v1', 60, 'petrol');
  assert.equal(s.computableEntryCount, 0);
});

// ── 11. CO2 + totals ────────────────────────────────────────────────────────
test('CO2 and totals', () => {
  const e = [fill(0, 40, true), fill(500, 50, true)];
  const s = computeStats(e, 'v1', 60, 'petrol');
  assert.equal(s.totalFuel, 90);
  assert.ok(approx(s.estimatedCO2kg, +(90 * 2.31).toFixed(2)));
});

// ── 12. Trend detection ─────────────────────────────────────────────────────
test('improving economy is detected as a trend', () => {
  const e = [
    fill(0, 50, true),
    fill(500, 50, true),   // 10
    fill(1100, 50, true),  // 12
    fill(1800, 50, true),  // 14
    fill(2600, 50, true),  // 16
  ];
  const s = computeStats(e, 'v1', 80, 'petrol');
  assert.equal(s.efficiencyTrend, 'improving');
});

// ── 13. classifyEfficiency bands are contiguous ─────────────────────────────
test('classifyEfficiency labels a clearly-better fill as good/excellent', () => {
  const base = [10, 10, 10, 10];
  assert.equal(classifyEfficiency(10, base).label, 'average');
  assert.ok(['good', 'excellent'].includes(classifyEfficiency(13, base).label));
  assert.equal(classifyEfficiency(6, base).label, 'poor');
});

// ── 14. A recorded tank level turns a partial fill into an EXACT measurement ──
test('tank level makes a partial fill an exact measurement', () => {
  // C=50. Full at odo 0 (level 50). Partial at odo 500: add 30 L, tank now 0.8 => 40 L.
  // burned = 50 - 40 + 30 = 40 over 500 km => 12.5 km/L.
  const e = [fill(0, 40, true), fill(500, 30, false, { level: 0.8 })];
  const s = computeStats(e, 'v1', 50, 'petrol');
  assert.ok(approx(s.averageEfficiency, 12.5), `got ${s.averageEfficiency}`);
  assert.equal(s.computableEntryCount, 1);
});

// ── 15. Partial-ONLY (never fills full) still gets exact economy via levels ───
test('partial-only with tank levels yields exact economy', () => {
  // C=50. odo 0: add 20, level 0.5 (=25). odo 400: add 30, level 0.7 (=35).
  // burned = 25 - 35 + 30 = 20 over 400 km => 20 km/L.
  const e = [fill(0, 20, false, { level: 0.5 }), fill(400, 30, false, { level: 0.7 })];
  const s = computeStats(e, 'v1', 50, 'petrol');
  assert.ok(approx(s.averageEfficiency, 20), `got ${s.averageEfficiency}`);
  assert.equal(s.computableEntryCount, 1);
});

// ── 16. estimatePartialEconomy defers to the exact path when a window exists ──
test('estimatePartialEconomy returns null when an exact window exists', () => {
  const e = [fill(0, 40, true), fill(500, 50, true)];
  assert.equal(estimatePartialEconomy(e, 'v1', 60, 'petrol'), null);
});

// ── 17. estimatePartialEconomy brackets the true economy (partial-only) ───────
test('estimatePartialEconomy brackets the true economy and centers on it', () => {
  // True 12 km/L, C=50. Each leg: drive 240 km, burn 20 L, refill 20 L (partial, no level).
  const e = [];
  let odo = 0;
  for (let k = 0; k < 12; k++) { e.push(fill(odo, 20, false)); odo += 240; }
  const est = estimatePartialEconomy(e, 'v1', 50, 'petrol');
  assert.ok(est, 'estimate should be produced');
  assert.ok(est.economyMin <= 12 && 12 <= est.economyMax, `12 not in [${est.economyMin}, ${est.economyMax}]`);
  assert.ok(approx(est.economyCentral, 12, 0.01), `central ${est.economyCentral}`);
});

// ── 18. estimatePartialEconomy anchors on the ENDPOINT fills, not an interior one
test('estimatePartialEconomy uses first/last fill volumes as anchors (verifier fix)', () => {
  // first=2 L splash, big 45 L interior, last=20 L. C=50. If it (wrongly) used the
  // 45 L interior as an anchor the bounds would differ.
  const e = [fill(0, 2, false), fill(600, 45, false), fill(1800, 20, false)];
  const est = estimatePartialEconomy(e, 'v1', 50, 'petrol');
  assert.ok(est);
  const D = 1800, fuelAfterFirst = 45 + 20; // 65
  const burnedLo = Math.max(1e-6, fuelAfterFirst + 2 - 50); // fStart = first.liters = 2 -> 17
  const burnedHi = fuelAfterFirst + 50 - 20;                // fEnd = last.liters = 20 -> 95
  assert.ok(approx(est.economyMax, D / burnedLo, 0.05), `max ${est.economyMax} vs ${D / burnedLo}`);
  assert.ok(approx(est.economyMin, D / burnedHi, 0.05), `min ${est.economyMin} vs ${D / burnedHi}`);
});
