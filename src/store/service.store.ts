import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ServiceEntry } from '../types';
import { createId } from '../utils/id';
import { createAsyncStorage } from './storage';
import { useVehicleStore } from './vehicle.store';

interface ServiceState {
  entries: ServiceEntry[];
  addEntry: (data: Omit<ServiceEntry, 'id' | 'completed'>) => ServiceEntry;
  updateEntry: (id: string, patch: Partial<ServiceEntry>) => void;
  deleteEntry: (id: string) => void;
  deleteForVehicle: (vehicleId: string) => void;
  reset: () => void;
}

export const useServiceStore = create<ServiceState>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (data) => {
        // Sanitize at the boundary (mirrors fuel.store) so no caller can persist
        // NaN/negative odometer or cost.
        const odometer = Number.isFinite(data.odometer) && data.odometer >= 0 ? data.odometer : 0;
        const cost = Number.isFinite(data.cost) && data.cost >= 0 ? data.cost : 0;
        const entry: ServiceEntry = { ...data, odometer, cost, id: createId('svc'), completed: true };
        set({ entries: [...get().entries, entry] });
        useVehicleStore.getState().syncOdometerFromHistory(entry.vehicleId);
        return entry;
      },
      updateEntry: (id, patch) => {
        set({
          entries: get().entries.map((e) => {
            if (e.id !== id) return e;
            const next = { ...e, ...patch };
            const odometer = Number.isFinite(next.odometer) && next.odometer >= 0 ? next.odometer : e.odometer;
            const cost = Number.isFinite(next.cost) && next.cost >= 0 ? next.cost : e.cost;
            return { ...next, odometer, cost };
          }),
        });
        const entry = get().entries.find((e) => e.id === id);
        if (entry) useVehicleStore.getState().syncOdometerFromHistory(entry.vehicleId);
      },
      deleteEntry: (id) => {
        const entry = get().entries.find((e) => e.id === id);
        set({ entries: get().entries.filter((e) => e.id !== id) });
        if (entry) useVehicleStore.getState().syncOdometerFromHistory(entry.vehicleId);
      },
      deleteForVehicle: (vehicleId) =>
        set({ entries: get().entries.filter((e) => e.vehicleId !== vehicleId) }),
      reset: () => set({ entries: [] }),
    }),
    {
      name: 'fuelio.service',
      storage: createAsyncStorage(),
      version: 1,
      // No-op migration seam: future schema bumps (version > 1) reshape `state` here.
      migrate: (state, _version) => state as ServiceState,
    },
  ),
);
