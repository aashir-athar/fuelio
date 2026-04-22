import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Vehicle } from '../types';
import { createId } from '../utils/id';
import { useSettingsStore } from './settings.store';
import { createAsyncStorage } from './storage';

interface VehicleState {
    vehicles: Vehicle[];
    addVehicle: (data: Omit<Vehicle, 'id' | 'createdAt'>) => Vehicle;
    updateVehicle: (id: string, patch: Partial<Vehicle>) => void;
    deleteVehicle: (id: string) => void;
    reset: () => void;
}

export const useVehicleStore = create<VehicleState>()(
    persist(
        (set, get) => ({
            vehicles: [],
            addVehicle: (data) => {
                const vehicle: Vehicle = {
                    ...data,
                    id: createId('veh'),
                    createdAt: Date.now(),
                };
                set({ vehicles: [...get().vehicles, vehicle] });
                // Auto-select as active if it's the first vehicle
                if (get().vehicles.length === 1) {
                    useSettingsStore.getState().setActiveVehicleId(vehicle.id);
                }
                return vehicle;
            },
            updateVehicle: (id, patch) =>
                set({
                    vehicles: get().vehicles.map((v) => (v.id === id ? { ...v, ...patch } : v)),
                }),
            deleteVehicle: (id) => {
                set({ vehicles: get().vehicles.filter((v) => v.id !== id) });
                const settings = useSettingsStore.getState();
                if (settings.activeVehicleId === id) {
                    const remaining = get().vehicles;
                    settings.setActiveVehicleId(remaining.length ? (remaining[0]?.id ?? null) : null);
                }
            },
            reset: () => set({ vehicles: [] }),
        }),
        {
            name: 'fuelio.vehicles',
            storage: createAsyncStorage(),
            version: 1,
        },
    ),
);