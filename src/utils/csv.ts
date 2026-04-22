import type { FuelEntry, ServiceEntry, Vehicle } from '../types';

function escape(v: unknown): string {
    const s = String(v ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

export function vehiclesToCsv(vehicles: readonly Vehicle[]): string {
    const header = 'id,nickname,make,model,year,fuelType,tankCapacity,odometer,licensePlate';
    const rows = vehicles.map((v) =>
        [v.id, v.nickname, v.make, v.model, v.year, v.fuelType, v.tankCapacity, v.odometer, v.licensePlate]
            .map(escape)
            .join(','),
    );
    return [header, ...rows].join('\n');
}

export function fuelEntriesToCsv(entries: readonly FuelEntry[]): string {
    const header = 'id,vehicleId,date,liters,pricePerLiter,odometer,fullTank,totalCost,notes';
    const rows = entries.map((e) =>
        [
            e.id,
            e.vehicleId,
            new Date(e.date).toISOString(),
            e.liters,
            e.pricePerLiter,
            e.odometer,
            e.fullTank,
            e.totalCost,
            e.notes ?? '',
        ]
            .map(escape)
            .join(','),
    );
    return [header, ...rows].join('\n');
}

export function serviceEntriesToCsv(entries: readonly ServiceEntry[]): string {
    const header = 'id,vehicleId,type,date,odometer,cost,oilGrade,oilType,nextDueMileage,notes';
    const rows = entries.map((e) =>
        [
            e.id,
            e.vehicleId,
            e.type,
            new Date(e.date).toISOString(),
            e.odometer,
            e.cost,
            e.oilGrade ?? '',
            e.oilType ?? '',
            e.nextDueMileage ?? '',
            e.notes ?? '',
        ]
            .map(escape)
            .join(','),
    );
    return [header, ...rows].join('\n');
}