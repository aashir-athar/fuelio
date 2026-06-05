import { useEffect, useState } from 'react';
import { useFuelStore } from './fuel.store';
import { useServiceStore } from './service.store';
import { useSettingsStore } from './settings.store';
import { useVehicleStore } from './vehicle.store';

/**
 * Blocks the initial render until every persisted store has rehydrated.
 * Prevents the classic "zero state flash" on cold start.
 */
/** Hard ceiling on how long the splash may block waiting for AsyncStorage. */
const HYDRATION_TIMEOUT_MS = 4000;

export function useStoreHydration(): boolean {
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        const stores = [useSettingsStore, useVehicleStore, useFuelStore, useServiceStore];
        let completed = 0;
        let cancelled = false;

        const finish = () => {
            if (!cancelled) {
                cancelled = true;
                setHydrated(true);
            }
        };

        const bump = () => {
            completed += 1;
            if (completed >= stores.length) finish();
        };

        const unsubs = stores.map((store) => {
            const persistApi = store.persist;
            if (persistApi.hasHydrated()) {
                completed += 1;
                return () => { };
            }
            return persistApi.onFinishHydration(bump);
        });

        if (completed >= stores.length) finish();

        // Safety net: if any store fails to report (corrupt blob, missing persist
        // middleware), proceed with whatever has loaded rather than hang forever.
        const timeout = setTimeout(finish, HYDRATION_TIMEOUT_MS);

        return () => {
            cancelled = true;
            clearTimeout(timeout);
            unsubs.forEach((fn) => fn());
        };
    }, []);

    return hydrated;
}