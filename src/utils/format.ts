import type { Currency, DistanceUnit, VolumeUnit } from '../types';

const CURRENCY_SYMBOLS: Record<Currency, string> = {
    PKR: 'Rs',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AED: 'AED',
    SAR: 'SAR',
    INR: '₹',
};

export function formatNumber(n: number, decimals = 1): string {
    if (!Number.isFinite(n)) return '—';
    return n.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

export function formatCurrency(amount: number, currency: Currency, decimals = 0): string {
    const symbol = CURRENCY_SYMBOLS[currency];
    return `${symbol} ${formatNumber(amount, decimals)}`;
}

export function formatDistance(km: number, unit: DistanceUnit): string {
    const value = unit === 'mi' ? km * 0.621371 : km;
    return `${formatNumber(value, 0)} ${unit}`;
}

export function formatVolume(liters: number, unit: VolumeUnit): string {
    const value = unit === 'gallon' ? liters * 0.264172 : liters;
    return `${formatNumber(value, 2)} ${unit === 'gallon' ? 'gal' : 'L'}`;
}

export function formatEfficiency(kmPerLiter: number, unit: DistanceUnit): string {
    if (kmPerLiter === 0) return '—';
    if (unit === 'mi') {
        const mpg = kmPerLiter * 2.35215;
        return `${formatNumber(mpg, 1)} mpg`;
    }
    return `${formatNumber(kmPerLiter, 1)} km/L`;
}

export function formatDate(timestamp: number, style: 'short' | 'long' = 'short'): string {
    const d = new Date(timestamp);
    if (style === 'short') {
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    return d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function formatRelativeDate(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp; // positive = past, negative = future
    const day = 86400000;

    // Future timestamps (e.g. a fill logged with a clock-skewed device)
    if (diff < 0) return 'Today';

    const days = Math.floor(diff / day);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
}