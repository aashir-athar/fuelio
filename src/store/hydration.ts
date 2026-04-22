import { useEffect, useState } from 'react';
import { useFuelStore } from './fuel.store';
import { useServiceStore } from './service.store';
import { useSettingsStore } from './settings.store';
import { useVehicleStore } from './vehicle.store';

/**
 * Blocks the initial render until every persisted store has rehydrated.
 * Prevents the classic "zero state flash" on cold start.
 */
export function useStoreHydration(): boolean {
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        const stores = [useSettingsStore, useVehicleStore, useFuelStore, useServiceStore];
        let completed = 0;

        const unsubs = stores.map((store) => {
            const persistApi = store.persist;
            if (persistApi.hasHydrated()) {
                completed += 1;
                return () => { };
            }
            return persistApi.onFinishHydration(() => {
                completed += 1;
                if (completed === stores.length) setHydrated(true);
            });
        });

        if (completed === stores.length) setHydrated(true);
        return () => unsubs.forEach((fn) => fn());
    }, []);

    return hydrated;
}