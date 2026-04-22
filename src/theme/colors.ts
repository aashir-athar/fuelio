/**
 * Fuelio Color System
 * Dual-mode tokens mapped to the brand palette.
 * Single source of truth for every color used in the app.
 */

export type ColorTheme = {
    // Surfaces
    background: string;
    surface: string;
    surfaceElevated: string;
    surfaceGlass: string;
    surfaceGlassBorder: string;

    // Brand
    accent: string;
    accentMuted: string;
    accentSoft: string;
    secondary: string;
    gold: string;

    // Semantic
    success: string;
    warning: string;
    danger: string;

    // Text
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textOnAccent: string;

    // Structure
    divider: string;
    inputBackground: string;
    scrim: string;

    // Gradients
    gradientStart: string;
    gradientEnd: string;
};

export const darkColors: ColorTheme = {
    background: '#0D1117',
    surface: '#161B27',
    surfaceElevated: '#1E2433',
    surfaceGlass: 'rgba(30, 36, 51, 0.72)',
    surfaceGlassBorder: 'rgba(182, 242, 77, 0.08)',

    accent: '#B6F24D',
    accentMuted: 'rgba(182, 242, 77, 0.16)',
    accentSoft: 'rgba(182, 242, 77, 0.08)',
    secondary: '#4DAFFF',
    gold: '#F5C842',

    success: '#3DDC84',
    warning: '#FF9F1C',
    danger: '#FF4757',

    textPrimary: '#F0F4FF',
    textSecondary: '#8A94A8',
    textMuted: '#4A5168',
    textOnAccent: '#0D1117',

    divider: '#252B3D',
    inputBackground: '#161B27',
    scrim: 'rgba(0, 0, 0, 0.55)',

    gradientStart: '#161B27',
    gradientEnd: '#0D1117',
};

export const lightColors: ColorTheme = {
    background: '#F4F6FB',
    surface: '#FFFFFF',
    surfaceElevated: '#EEF1F8',
    surfaceGlass: 'rgba(255, 255, 255, 0.72)',
    surfaceGlassBorder: 'rgba(141, 200, 39, 0.18)',

    accent: '#8DC827',
    accentMuted: 'rgba(141, 200, 39, 0.16)',
    accentSoft: 'rgba(141, 200, 39, 0.08)',
    secondary: '#2E8FE0',
    gold: '#E0A81F',

    success: '#2BB673',
    warning: '#E88A0E',
    danger: '#E33B4A',

    textPrimary: '#0D1117',
    textSecondary: '#4A5168',
    textMuted: '#8A94A8',
    textOnAccent: '#0D1117',

    divider: '#E2E6EF',
    inputBackground: '#FFFFFF',
    scrim: 'rgba(13, 17, 23, 0.45)',

    gradientStart: '#EEF1F8',
    gradientEnd: '#F4F6FB',
};