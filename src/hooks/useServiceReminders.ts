import { useMemo } from 'react';
import { useServiceStore } from '../store/service.store';
import { useVehicleStore } from '../store/vehicle.store';
import type { ServiceType } from '../types';

export interface ServiceReminder {
  type: ServiceType;
  /** Canonical km at which this service is next due. */
  nextDueMileage: number;
  /** Canonical km remaining until due. Negative => overdue. */
  remaining: number;
  /** Odometer of the service log that established this reminder. */
  lastOdometer: number;
}

/**
 * Per-type service reminders for a vehicle.
 *
 * For each service type we keep the entry with the HIGHEST odometer that defines a
 * `nextDueMileage` (i.e. the most recent service of that type), then compute the
 * distance remaining against the vehicle's current odometer. This replaces the
 * earlier duplicated logic in Home + Service that incorrectly compared an odometer
 * reading against a next-due-mileage value.
 */
export function useServiceReminders(vehicleId: string | undefined): ServiceReminder[] {
  const entries = useServiceStore((s) => s.entries);
  const vehicles = useVehicleStore((s) => s.vehicles);

  return useMemo(() => {
    if (!vehicleId) return [];
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return [];

    const latestByType = new Map<ServiceType, { nextDueMileage: number; odometer: number }>();
    for (const e of entries) {
      if (e.vehicleId !== vehicleId) continue;
      if (e.nextDueMileage == null) continue;
      const existing = latestByType.get(e.type);
      if (!existing || e.odometer > existing.odometer) {
        latestByType.set(e.type, { nextDueMileage: e.nextDueMileage, odometer: e.odometer });
      }
    }

    const reminders: ServiceReminder[] = [];
    latestByType.forEach((v, type) => {
      reminders.push({
        type,
        nextDueMileage: v.nextDueMileage,
        remaining: v.nextDueMileage - vehicle.odometer,
        lastOdometer: v.odometer,
      });
    });
    return reminders.sort((a, b) => a.remaining - b.remaining);
  }, [entries, vehicles, vehicleId]);
}
