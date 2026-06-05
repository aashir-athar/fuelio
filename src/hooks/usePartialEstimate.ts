import { useMemo } from 'react';
import { useFuelStore } from '../store/fuel.store';
import { useVehicleStore } from '../store/vehicle.store';
import { estimatePartialEconomy, type PartialTankEstimate } from '../utils/fuelAlgorithm';

/**
 * Capacity-bounded economy ESTIMATE for partial-only logs (no full fills and no
 * recorded tank levels). Returns null when an exact window exists or data is too thin.
 */
export function usePartialEconomyEstimate(
  vehicleId: string | null | undefined,
): PartialTankEstimate | null {
  const entries = useFuelStore((s) => s.entries);
  const vehicles = useVehicleStore((s) => s.vehicles);

  return useMemo(() => {
    if (!vehicleId) return null;
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return null;
    return estimatePartialEconomy(entries, vehicleId, vehicle.tankCapacity ?? 0, vehicle.fuelType ?? 'petrol');
  }, [entries, vehicles, vehicleId]);
}
