import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ServiceEntry } from '../types';
import { createId } from '../utils/id';
import { createAsyncStorage } from './storage';

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
        const entry: ServiceEntry = { ...data, id: createId('svc'), completed: true };
        set({ entries: [...get().entries, entry] });
        return entry;
      },
      updateEntry: (id, patch) =>
        set({
          entries: get().entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        }),
      deleteEntry: (id) =>
        set({ entries: get().entries.filter((e) => e.id !== id) }),
      deleteForVehicle: (vehicleId) =>
        set({ entries: get().entries.filter((e) => e.vehicleId !== vehicleId) }),
      reset: () => set({ entries: [] }),
    }),
    {
      name: 'fuelio.service',
      storage: createAsyncStorage(),
      version: 1,
    },
  ),
);