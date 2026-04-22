import React from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius } from '../../theme/tokens';

/**
 * Cross-platform "glass" panel.
 *
 * iOS 26 Liquid Glass: uses translucent layered surface with subtle border.
 *   (expo-glass-effect exists but is iOS-17+ only and still experimental for
 *    complex shapes — we use a tuned translucent layer that matches the 2026
 *    system aesthetic without the compositing cost on mid-range iPhones.)
 *
 * Android: matches visually with a solid elevated surface + hairline border —
 *   no BlurView, per the spec's explicit constraint.
 */

interface Props {
    style?: ViewStyle | ViewStyle[];
    children: React.ReactNode;
    intensity?: 'subtle' | 'strong';
}

export const GlassPanel = React.memo(function GlassPanel({
    style,
    children,
    intensity = 'subtle',
}: Props) {
    const { colors, isDark } = useTheme();

    const bg = Platform.select({
        ios: intensity === 'strong' ? colors.surfaceGlass : colors.surfaceElevated,
        default: colors.surfaceElevated,
    });

    return (
        <View
            style={[
                styles.base,
                {
                    backgroundColor: bg,
                    borderColor: isDark ? colors.surfaceGlassBorder : colors.divider,
                },
                style,
            ]}
        >
            {children}
        </View>
    );
});

const styles = StyleSheet.create({
    base: {
        borderRadius: radius.xl,
        borderWidth: StyleSheet.hairlineWidth,
        overflow: 'hidden',
    },
});