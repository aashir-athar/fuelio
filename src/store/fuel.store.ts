import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FuelEntry } from '../types';
import { createId } from '../utils/id';
import { createAsyncStorage } from './storage';
import { useVehicleStore } from './vehicle.store';

interface FuelState {
  entries: FuelEntry[];
  addEntry: (data: Omit<FuelEntry, 'id' | 'totalCost'>) => FuelEntry;
  updateEntry: (id: string, patch: Partial<FuelEntry>) => void;
  deleteEntry: (id: string) => void;
  deleteForVehicle: (vehicleId: string) => void;
  reset: () => void;
}

export const useFuelStore = create<FuelState>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (data) => {
        // Sanitize: clamp to valid domain before storage.
        // liters and pricePerLiter must be positive finite numbers.
        const liters = Number.isFinite(data.liters) && data.liters > 0 ? data.liters : 0;
        const pricePerLiter = Number.isFinite(data.pricePerLiter) && data.pricePerLiter >= 0
          ? data.pricePerLiter
          : 0;
        const odometer = Number.isFinite(data.odometer) && data.odometer >= 0
          ? data.odometer
          : 0;
        // Round totalCost to 2 decimal places using a multiply-round-divide approach
        // to avoid floating-point errors (e.g. 0.1*0.2 = 0.020000000000000004).
        const totalCost = Math.round(liters * pricePerLiter * 100) / 100;
        const entry: FuelEntry = {
          ...data,
          liters,
          pricePerLiter,
          odometer,
          id: createId('fuel'),
          totalCost,
        };
        set({ entries: [...get().entries, entry] });
        // Side effect: bump vehicle odometer if newer
        const vehicleStore = useVehicleStore.getState();
        const vehicle = vehicleStore.vehicles.find((v) => v.id === data.vehicleId);
        if (vehicle && odometer > vehicle.odometer) {
          vehicleStore.updateVehicle(data.vehicleId, { odometer });
        }
        return entry;
      },
      updateEntry: (id, patch) =>
        set({
          entries: get().entries.map((e) => {
            if (e.id !== id) return e;
            const next = { ...e, ...patch };
            // Sanitize patched values
            const liters = Number.isFinite(next.liters) && next.liters > 0 ? next.liters : e.liters;
            const pricePerLiter = Number.isFinite(next.pricePerLiter) && next.pricePerLiter >= 0
              ? next.pricePerLiter
              : e.pricePerLiter;
            const odometer = Number.isFinite(next.odometer) && next.odometer >= 0
              ? next.odometer
              : e.odometer;
            return {
              ...next,
              liters,
              pricePerLiter,
              odometer,
              totalCost: Math.round(liters * pricePerLiter * 100) / 100,
            };
          }),
        }),
      deleteEntry: (id) =>
        set({ entries: get().entries.filter((e) => e.id !== id) }),
      deleteForVehicle: (vehicleId) =>
        set({ entries: get().entries.filter((e) => e.vehicleId !== vehicleId) }),
      reset: () => set({ entries: [] }),
    }),
    {
      name: 'fuelio.fuel',
      storage: createAsyncStorage(),
      version: 1,
    },
  ),
);