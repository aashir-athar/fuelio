/**
 * Unit conversion — single source of truth.
 *
 * CANONICAL STORAGE CONTRACT: every value persisted in the stores is in
 * canonical units — distance in KILOMETRES, volume in LITRES, price as
 * price-per-LITRE. The user's chosen `distanceUnit` / `volumeUnit` only ever
 * affect what is shown on screen and what a form field is labelled.
 *
 * Input flow:   user types in display unit  ->  displayTo*()  ->  store (canonical)
 * Output flow:  store (canonical)           ->  *ToDisplay()  ->  screen
 *
 * format.ts handles the output (canonical -> display) side; this module owns
 * the constants and the input (display -> canonical) side so the two can never
 * drift apart.
 */
import type { DistanceUnit, VolumeUnit } from '../types';

/** Exact conversion factors (international definitions). */
export const KM_PER_MILE = 1.609344;
export const LITRES_PER_GALLON = 3.785411784; // US gallon

// ─── Distance: canonical = km ────────────────────────────────────────────────
export const kmToDisplay = (km: number, unit: DistanceUnit): number =>
  unit === 'mi' ? km / KM_PER_MILE : km;

export const displayToKm = (value: number, unit: DistanceUnit): number =>
  unit === 'mi' ? value * KM_PER_MILE : value;

// ─── Volume: canonical = litres ──────────────────────────────────────────────
export const litresToDisplay = (litres: number, unit: VolumeUnit): number =>
  unit === 'gallon' ? litres / LITRES_PER_GALLON : litres;

export const displayToLitres = (value: number, unit: VolumeUnit): number =>
  unit === 'gallon' ? value * LITRES_PER_GALLON : value;

// ─── Price: canonical = price per litre ──────────────────────────────────────
// A "price per gallon" the user types is larger than price per litre.
export const pricePerLitreToDisplay = (perLitre: number, unit: VolumeUnit): number =>
  unit === 'gallon' ? perLitre * LITRES_PER_GALLON : perLitre;

export const displayToPricePerLitre = (perDisplay: number, unit: VolumeUnit): number =>
  unit === 'gallon' ? perDisplay / LITRES_PER_GALLON : perDisplay;

// ─── Labels ──────────────────────────────────────────────────────────────────
export const distanceUnitLabel = (unit: DistanceUnit): string => (unit === 'mi' ? 'mi' : 'km');
export const volumeUnitLabel = (unit: VolumeUnit): string => (unit === 'gallon' ? 'gal' : 'L');
export const efficiencyUnitLabel = (distanceUnit: DistanceUnit, volumeUnit: VolumeUnit): string =>
  distanceUnit === 'mi' && volumeUnit === 'gallon' ? 'mpg' : `${distanceUnitLabel(distanceUnit)}/${volumeUnitLabel(volumeUnit)}`;
