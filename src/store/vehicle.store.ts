import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Vehicle } from '../types';
import { createId } from '../utils/id';
import { useFuelStore } from './fuel.store';
import { useServiceStore } from './service.store';
import { useSettingsStore } from './settings.store';
import { createAsyncStorage } from './storage';

interface VehicleState {
    vehicles: Vehicle[];
    addVehicle: (data: Omit<Vehicle, 'id' | 'createdAt'>) => Vehicle;
    updateVehicle: (id: string, patch: Partial<Vehicle>) => void;
    deleteVehicle: (id: string) => void;
    /** Recompute a vehicle's odometer as the highest reading across its fuel + service history. */
    syncOdometerFromHistory: (vehicleId: string) => void;
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
                // Cascade at the data layer (not the UI) so referential integrity can
                // never be skipped by a future caller: drop the vehicle's fuel + service
                // history first, then the vehicle, then repoint the active selection.
                useFuelStore.getState().deleteForVehicle(id);
                useServiceStore.getState().deleteForVehicle(id);
                set({ vehicles: get().vehicles.filter((v) => v.id !== id) });
                const settings = useSettingsStore.getState();
                if (settings.activeVehicleId === id) {
                    const remaining = get().vehicles;
                    settings.setActiveVehicleId(remaining[0]?.id ?? null);
                }
            },
            syncOdometerFromHistory: (vehicleId) => {
                const fuelMax = useFuelStore
                    .getState()
                    .entries.reduce((m, e) => (e.vehicleId === vehicleId ? Math.max(m, e.odometer) : m), 0);
                const serviceMax = useServiceStore
                    .getState()
                    .entries.reduce((m, e) => (e.vehicleId === vehicleId ? Math.max(m, e.odometer) : m), 0);
                const maxOdo = Math.max(fuelMax, serviceMax);
                if (maxOdo > 0) {
                    set({
                        vehicles: get().vehicles.map((v) =>
                            v.id === vehicleId ? { ...v, odometer: maxOdo } : v,
                        ),
                    });
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
