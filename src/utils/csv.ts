import type { FuelEntry, ServiceEntry, Vehicle } from '../types';

/** RFC 4180 line ending. */
const EOL = '\r\n';

/**
 * Escape one CSV field.
 *  1. CSV-injection guard: a leading =, +, -, @, tab or CR makes Excel/Sheets
 *     treat the cell as a formula. Prefix such values with a single quote so they
 *     render as literal text. (Applies to user free-text: nicknames, plates, notes.)
 *  2. RFC 4180 quoting: wrap in double quotes and double any internal quotes when
 *     the value contains a comma, quote, CR or LF.
 */
function escape(v: unknown): string {
    let s = String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s)) {
        s = `'${s}`;
    }
    if (/[",\r\n]/.test(s)) {
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
    return [header, ...rows].join(EOL);
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
    return [header, ...rows].join(EOL);
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
    return [header, ...rows].join(EOL);
}