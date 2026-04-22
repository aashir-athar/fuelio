/**
 * Design tokens: spacing, radii, typography, motion.
 * Tied to an 8-point baseline grid with 4pt intermediates.
 */

export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 40,
  9: 48,
  10: 64,
} as const;

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const font = {
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 32,
    display: 44,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
  letter: {
    tight: -0.6,
    normal: 0,
    wide: 0.4,
  },
} as const;

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 14,
  },
  accent: {
    shadowColor: '#B6F24D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;

/**
 * Spring presets tuned for 2026 motion language.
 * - snappy: button press feedback (120ms perceived)
 * - smooth: layout transitions
 * - soft: playful appearance
 */
export const spring = {
  snappy: { damping: 18, stiffness: 320, mass: 0.7 },
  smooth: { damping: 22, stiffness: 220, mass: 1 },
  soft: { damping: 14, stiffness: 120, mass: 1 },
} as const;

export const duration = {
  instant: 120,
  fast: 180,
  normal: 260,
  slow: 420,
  xslow: 620,
} as const;