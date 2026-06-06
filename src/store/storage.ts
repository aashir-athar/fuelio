import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PersistStorage, StorageValue } from 'zustand/middleware';

/**
 * Zustand PersistStorage adapter for AsyncStorage.
 * Keeps JSON on disk, hydrates on boot.
 */
export function createAsyncStorage<T>(): PersistStorage<T> {
    return {
        getItem: async (name) => {
            // Captured outside the try so the catch can attempt a recovery copy of
            // whatever raw value failed to parse.
            let raw: string | null = null;
            try {
                raw = await AsyncStorage.getItem(name);
                if (!raw) return null;
                return JSON.parse(raw) as StorageValue<T>;
            } catch {
                // Corrupt / unreadable blob (interrupted write, tampering, disk error).
                // Self-heal: drop the bad key and fall back to defaults instead of
                // throwing inside rehydrate (which would otherwise hang the splash).
                // Best-effort: preserve the corrupt value at `<name>.corrupt` first so
                // there is a manual recovery path. Never let recovery work throw.
                try {
                    if (raw != null) {
                        await AsyncStorage.setItem(`${name}.corrupt`, raw);
                    }
                } catch {
                    // ignore — recovery copy is best-effort only
                }
                try {
                    await AsyncStorage.removeItem(name);
                } catch {
                    // ignore — nothing more we can do; defaults will be used
                }
                return null;
            }
        },
        setItem: async (name, value) => {
            try {
                await AsyncStorage.setItem(name, JSON.stringify(value));
            } catch {
                // Quota / disk failure — fail soft; in-memory state stays correct.
            }
        },
        removeItem: async (name) => {
            try {
                await AsyncStorage.removeItem(name);
            } catch {
                // ignore
            }
        },
    };
}