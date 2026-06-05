/**
 * Core domain types — single source of truth for the entire app.
 */

export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'cng' | 'ev';
export type DistanceUnit = 'km' | 'mi';
export type VolumeUnit = 'liter' | 'gallon';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'PKR' | 'AED' | 'SAR' | 'INR';

export interface Vehicle {
    id: string;
    nickname: string;
    make: string;
    model: string;
    year: number;
    fuelType: FuelType;
    tankCapacity: number; // in liters
    vin?: string;
    licensePlate?: string;
    odometer: number;
    photoUri?: string;
    createdAt: number;
    color?: string;
}

export interface FuelEntry {
    id: string;
    vehicleId: string;
    date: number;
    liters: number;
    pricePerLiter: number;
    odometer: number;
    fullTank: boolean;
    /**
     * Optional tank fill level (0..1 fraction of capacity) just AFTER this fill.
     * When set on a partial fill, it turns that fill into an exact measurement point
     * (a full fill is implicitly 1.0). Lets partial-only drivers get exact economy.
     */
    tankLevelAfter?: number;
    notes?: string;
    receiptUri?: string;
    // Computed — stored to avoid recalculation on every render
    distanceDriven?: number;
    efficiency?: number; // km/l
    totalCost: number;
}

export type ServiceType =
    | 'oil-change'
    | 'tire-rotation'
    | 'brake'
    | 'battery'
    | 'air-filter'
    | 'timing-belt'
    | 'alignment'
    | 'coolant'
    | 'other';

export type OilGrade =
    | '0W-20'
    | '0W-30'
    | '5W-20'
    | '5W-30'
    | '5W-40'
    | '10W-30'
    | '10W-40'
    | '15W-40'
    | '20W-50';

export type OilType = 'fully-synthetic' | 'semi-synthetic' | 'mineral';

export interface ServiceEntry {
    id: string;
    vehicleId: string;
    type: ServiceType;
    date: number;
    odometer: number;
    cost: number;
    notes?: string;
    photoUri?: string;
    // Oil-change specific
    oilGrade?: OilGrade;
    oilType?: OilType;
    oilQuantity?: number; // liters
    // Reminder
    nextDueMileage?: number;
    nextDueDate?: number;
    completed: boolean;
}

export type TimeRange = 'week' | 'month' | 'year' | 'all';

export interface EfficiencyStat {
    vehicleId: string;
    // Distance-weighted average over full-to-full windows: Σ(window distance) / Σ(window fuel).
    // Statistically correct — short windows do not over-weight the result.
    averageEfficiency: number;
    bestEfficiency: number;
    worstEfficiency: number;
    // Retained for API compatibility. In v3 every counted window is a clean measurement,
    // so these mirror the main stats.
    accurateAverageEfficiency: number;
    accurateBestEfficiency: number;
    accurateWorstEfficiency: number;
    // Rolling average of last 5 computable fills (recent performance)
    recentAverageEfficiency: number;
    // Trend direction derived from linear regression over valid entries
    efficiencyTrend: 'improving' | 'declining' | 'stable';
    efficiencyTrendSlope: number; // km/L per fill, signed
    totalDistance: number;
    totalFuel: number;
    totalCost: number;
    // Cost per distance over clean entries only (excludes zero-distance and odometer-anomaly fills).
    costPerKm: number;
    // Environmental
    estimatedCO2kg: number;
    // Refuel intervals
    avgKmBetweenFills: number;
    avgDaysBetweenFills: number;
    // Data quality
    entryCount: number;
    computableEntryCount: number; // entries where efficiency could be calculated
}