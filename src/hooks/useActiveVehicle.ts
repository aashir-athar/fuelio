import { useMemo } from 'react';
import { useSettingsStore } from '../store/settings.store';
import { useVehicleStore } from '../store/vehicle.store';

export function useActiveVehicle() {
    const activeId = useSettingsStore((s) => s.activeVehicleId);
    const vehicles = useVehicleStore((s) => s.vehicles);

    return useMemo(() => {
        if (!activeId) return vehicles[0] ?? null;
        return vehicles.find((v) => v.id === activeId) ?? vehicles[0] ?? null;
    }, [activeId, vehicles]);
}