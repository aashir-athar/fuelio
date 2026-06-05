// Lever: peak-end recognition — each row leads with the volume "fingerprint" and
// closes on the trustworthy economy figure, so scanning the log feels effortless.
import React, { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import { useSettingsStore } from '../../store/settings.store';
import { useTheme } from '../../theme/ThemeProvider';
import { duration, radius, space } from '../../theme/tokens';
import { formatCurrency, formatDistance, formatEfficiency, formatRelativeDate, formatVolume } from '../../utils/format';
import type { ComputedFuelEntry } from '../../utils/fuelAlgorithm';
import { Text } from '../primitives/Text';

interface Props {
    entry: ComputedFuelEntry;
    onPress?: () => void;
}

export const FuelEntryRow = React.memo(function FuelEntryRow({ entry, onPress }: Props) {
    const { colors } = useTheme();
    const distanceUnit = useSettingsStore((s) => s.distanceUnit);
    const volumeUnit = useSettingsStore((s) => s.volumeUnit);
    const currency = useSettingsStore((s) => s.currency);
    const reduceMotion = useReduceMotion();

    const hasAnomaly = entry.anomalies.length > 0;
    const showEconomy = entry.isEfficiencyValid && !hasAnomaly;

    const economyColor = !showEconomy
        ? colors.textMuted
        : entry.efficiency > 14
            ? colors.success
            : entry.efficiency > 10
                ? colors.accent
                : colors.warning;

    const press = useSharedValue(0);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: 1 - press.value * 0.015 }],
        backgroundColor: press.value > 0.5 ? colors.surfaceElevated : colors.surface,
    }));

    const onPressIn = useCallback(() => {
        press.value = reduceMotion ? 1 : withTiming(1, { duration: duration.instant });
    }, [press, reduceMotion]);

    const onPressOut = useCallback(() => {
        press.value = reduceMotion ? 0 : withTiming(0, { duration: duration.fast });
    }, [press, reduceMotion]);

    const economyText = showEconomy ? formatEfficiency(entry.efficiency, distanceUnit) : '—';
    const a11yLabel =
        `${formatCurrency(entry.totalCost, currency, 2)}, ` +
        `${formatVolume(entry.liters, volumeUnit)}, ` +
        `${formatRelativeDate(entry.date)}, ` +
        `${entry.fullTank ? 'full tank' : 'partial fill'}` +
        (showEconomy ? `, ${economyText}` : '') +
        (hasAnomaly ? ', needs review' : '');

    return (
        <Pressable
            onPress={onPress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            accessibilityRole="button"
            accessibilityLabel={a11yLabel}
            accessibilityHint="Opens this fill-up to edit"
        >
            <Animated.View
                style={[
                    {
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: space[4],
                        paddingVertical: space[3],
                        paddingHorizontal: space[4],
                        borderRadius: radius.lg,
                        borderWidth: 1,
                        borderColor: hasAnomaly ? colors.warning : colors.divider,
                    },
                    animatedStyle,
                ]}
            >
                <View
                    style={{
                        width: 52,
                        height: 52,
                        borderRadius: radius.md,
                        backgroundColor: colors.accentSoft,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: space[1],
                    }}
                >
                    <Text variant="bodyLg" weight="bold" tone="accent" numberOfLines={1}>
                        {formatVolume(entry.liters, volumeUnit)}
                    </Text>
                </View>

                <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="body" weight="semibold" numberOfLines={1}>
                        {formatCurrency(entry.totalCost, currency, 2)}
                    </Text>
                    <Text variant="caption" tone="secondary" numberOfLines={1}>
                        {formatRelativeDate(entry.date)} · {formatDistance(entry.odometer, distanceUnit)}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: 2 }}>
                        <Tag
                            label={entry.fullTank ? 'Full' : 'Partial'}
                            color={entry.fullTank ? colors.accent : colors.textMuted}
                            tinted={entry.fullTank}
                            tintColor={colors.accentSoft}
                            borderColor={colors.divider}
                        />
                        {hasAnomaly ? (
                            <Tag
                                label={anomalyLabel(entry.anomalies[0]!)}
                                color={colors.warning}
                                tinted
                                tintColor={colors.surfaceElevated}
                                borderColor={colors.warning}
                                dot
                            />
                        ) : null}
                    </View>
                </View>

                <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Text variant="body" weight="semibold" style={{ color: economyColor }}>
                        {economyText}
                    </Text>
                    <Text variant="micro" tone="muted">
                        {showEconomy ? 'measured' : 'no reading'}
                    </Text>
                </View>
            </Animated.View>
        </Pressable>
    );
});

interface TagProps {
    label: string;
    color: string;
    tinted: boolean;
    tintColor: string;
    borderColor: string;
    dot?: boolean;
}

const Tag = React.memo(function Tag({ label, color, tinted, tintColor, borderColor, dot = false }: TagProps) {
    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: space[1],
                paddingHorizontal: space[2],
                paddingVertical: 3,
                borderRadius: radius.pill,
                backgroundColor: tinted ? tintColor : 'transparent',
                borderWidth: 1,
                borderColor,
            }}
        >
            {dot ? (
                <View style={{ width: 5, height: 5, borderRadius: radius.pill, backgroundColor: color }} />
            ) : null}
            <Text variant="micro" weight="semibold" style={{ color }}>
                {label}
            </Text>
        </View>
    );
});

function anomalyLabel(reason: ComputedFuelEntry['anomalies'][number]): string {
    switch (reason) {
        case 'odometer_regression': return 'Odometer back';
        case 'duplicate_odometer': return 'Same odometer';
        case 'excessive_distance': return 'Big distance';
        case 'overfill': return 'Over capacity';
        case 'implausible_efficiency': return 'Odd economy';
    }
}
