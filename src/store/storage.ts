import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PersistStorage, StorageValue } from 'zustand/middleware';

/**
 * Zustand PersistStorage adapter for AsyncStorage.
 * Keeps JSON on disk, hydrates on boot.
 */
export function createAsyncStorage<T>(): PersistStorage<T> {
    return {
        getItem: async (name) => {
            const raw = await AsyncStorage.getItem(name);
            return raw ? (JSON.parse(raw) as StorageValue<T>) : null;
        },
        setItem: async (name, value) => {
            await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
            await AsyncStorage.removeItem(name);
        },
    };
}