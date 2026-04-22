import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Currency, DistanceUnit, VolumeUnit } from '../types';
import { createAsyncStorage } from './storage';

type ThemePreference = 'system' | 'light' | 'dark';

interface SettingsState {
    hasCompletedOnboarding: boolean;
    themePreference: ThemePreference;
    distanceUnit: DistanceUnit;
    volumeUnit: VolumeUnit;
    currency: Currency;
    notificationsEnabled: boolean;
    activeVehicleId: string | null;

    completeOnboarding: () => void;
    setThemePreference: (p: ThemePreference) => void;
    setDistanceUnit: (u: DistanceUnit) => void;
    setVolumeUnit: (u: VolumeUnit) => void;
    setCurrency: (c: Currency) => void;
    setNotificationsEnabled: (v: boolean) => void;
    setActiveVehicleId: (id: string | null) => void;
    reset: () => void;
}

const DEFAULTS = {
    hasCompletedOnboarding: false,
    themePreference: 'system' as ThemePreference,
    distanceUnit: 'km' as DistanceUnit,
    volumeUnit: 'liter' as VolumeUnit,
    currency: 'USD' as Currency,
    notificationsEnabled: true,
    activeVehicleId: null,
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            ...DEFAULTS,
            completeOnboarding: () => set({ hasCompletedOnboarding: true }),
            setThemePreference: (p) => set({ themePreference: p }),
            setDistanceUnit: (u) => set({ distanceUnit: u }),
            setVolumeUnit: (u) => set({ volumeUnit: u }),
            setCurrency: (c) => set({ currency: c }),
            setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),
            setActiveVehicleId: (id) => set({ activeVehicleId: id }),
            reset: () => set(DEFAULTS),
        }),
        {
            name: 'fuelio.settings',
            storage: createAsyncStorage(),
            version: 1,
        },
    ),
);