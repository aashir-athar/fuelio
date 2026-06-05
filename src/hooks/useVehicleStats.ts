import { useMemo } from 'react';
import { useFuelStore } from '../store/fuel.store';
import { useVehicleStore } from '../store/vehicle.store';
import { computeEntries, computeStatsFromEntries } from '../utils/fuelAlgorithm';

export function useVehicleStats(vehicleId: string | null | undefined) {
  const entries = useFuelStore((s) => s.entries);
  const vehicles = useVehicleStore((s) => s.vehicles);

  return useMemo(() => {
    if (!vehicleId) return null;
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    const tankCapacity = vehicle?.tankCapacity ?? 0;
    const fuelType = vehicle?.fuelType ?? 'petrol';
    // Single pass: enrich entries once, then derive stats from them.
    const computed = computeEntries(entries, vehicleId, tankCapacity, fuelType);
    return {
      entries: computed,
      stats: computeStatsFromEntries(computed, vehicleId, fuelType),
    };
  }, [entries, vehicles, vehicleId]);
}