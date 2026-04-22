import * as SystemUI from 'expo-system-ui';
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../store/settings.store';
import { darkColors, lightColors, type ColorTheme } from './colors';

type ThemePreference = 'system' | 'light' | 'dark';

type ThemeContextValue = {
    colors: ColorTheme;
    isDark: boolean;
    preference: ThemePreference;
    setPreference: (pref: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const system = useColorScheme();
    const preference = useSettingsStore((s) => s.themePreference);
    const setPreference = useSettingsStore((s) => s.setThemePreference);

    const isDark = preference === 'system' ? system !== 'light' : preference === 'dark';
    const colors = isDark ? darkColors : lightColors;

    useEffect(() => {
        // Keep native root matching theme — eliminates white flash during nav transitions
        SystemUI.setBackgroundColorAsync(colors.background).catch(() => { });
    }, [colors.background]);

    const value = useMemo<ThemeContextValue>(
        () => ({ colors, isDark, preference, setPreference }),
        [colors, isDark, preference, setPreference],
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}