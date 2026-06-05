import React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import { useTheme } from '../../theme/ThemeProvider';
import { fontFamily, radius, space, spring } from '../../theme/tokens';
import { Text } from '../primitives/Text';

interface Props {
    data: { label: string; value: number }[];
    height?: number;
    color?: string;
    formatValue?: (v: number) => string;
}


const AXIS_HEIGHT = 22;

const AnimatedBar = React.memo(function AnimatedBar({
    ratio,
    label,
    valueLabel,
    isPeak,
    delay,
    barColor,
    trackColor,
    peakLabelColor,
    height,
    reduceMotion,
}: {
    ratio: number;
    label: string;
    valueLabel?: string;
    isPeak: boolean;
    delay: number;
    barColor: string;
    trackColor: string;
    peakLabelColor: string;
    height: number;
    reduceMotion: boolean;
}) {
    const progress = useSharedValue(reduceMotion ? ratio : 0);
    React.useEffect(() => {
        if (reduceMotion) {
            progress.value = ratio;
            return;
        }
        progress.value = withDelay(delay, withSpring(ratio, spring.smooth));
    }, [delay, progress, ratio, reduceMotion]);

    const animStyle = useAnimatedStyle(() => ({
        height: Math.max(progress.value, 0) * height,
    }));

    return (
        <View style={{ flex: 1, alignItems: 'center', gap: space[2] }}>
            {valueLabel ? (
                <Text
                    variant="micro"
                    tone={isPeak ? 'primary' : 'muted'}
                    numberOfLines={1}
                    style={isPeak ? { color: peakLabelColor } : undefined}
                >
                    {valueLabel}
                </Text>
            ) : null}
            <View style={{ flex: 1, width: '58%', justifyContent: 'flex-end', minHeight: 2 }}>
                {/* Faint full-height track so every column reads as a slot, not just the filled bar */}
                <View
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        borderRadius: radius.sm,
                        backgroundColor: trackColor,
                    }}
                />
                <Animated.View
                    style={[
                        animStyle,
                        {
                            backgroundColor: barColor,
                            borderTopLeftRadius: radius.sm,
                            borderTopRightRadius: radius.sm,
                            borderBottomLeftRadius: radius.xs,
                            borderBottomRightRadius: radius.xs,
                            minHeight: 3,
                            opacity: isPeak ? 1 : 0.42,
                        },
                    ]}
                />
            </View>
            <Text variant="micro" tone="muted" numberOfLines={1}>{label}</Text>
        </View>
    );
});

export const BarChart = React.memo(function BarChart({
    data, height = 160, color, formatValue,
}: Props) {
    const { colors } = useTheme();
    const reduceMotion = useReduceMotion();
    const barColor = color ?? colors.accent;
    const maxValue = Math.max(...data.map((d) => d.value), 1);
    const peakIndex = data.reduce((best, d, i) => (d.value > (data[best]?.value ?? -Infinity) ? i : best), 0);

    if (data.length === 0) {
        return (
            <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
                <Text tone="muted" variant="caption">No data yet</Text>
            </View>
        );
    }

    const plotHeight = height - 48;
    const peakValueLabel = formatValue ? formatValue(maxValue) : `${maxValue}`;

    return (
        <View>
            {/* Peak summary — the one confident number above the columns */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: space[4] }}>
                <View>
                    <Text variant="micro" tone="muted">PEAK</Text>
                    <Text
                        numberOfLines={1}
                        style={{ fontFamily: fontFamily.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.8, color: colors.accent, marginTop: space[1] }}
                    >
                        {peakValueLabel}
                    </Text>
                </View>
                <Text variant="micro" tone="muted">{data.length} PERIODS</Text>
            </View>

            <View style={{ height, position: 'relative' }}>
                {/* Baseline gridlines — bottom axis solid, mids hairline */}
                {[0, 0.5, 1].map((ratio) => (
                    <View
                        key={ratio}
                        pointerEvents="none"
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: AXIS_HEIGHT + plotHeight * ratio,
                            height: 1,
                            backgroundColor: colors.divider,
                            opacity: ratio === 0 ? 0.9 : 0.3,
                        }}
                    />
                ))}
                <View style={{ height, flexDirection: 'row', gap: space[3], alignItems: 'stretch' }}>
                    {data.map((d, i) => {
                        const safeRatio = maxValue > 0 ? Math.max(d.value / maxValue, 0) : 0;
                        return (
                            <AnimatedBar
                                key={`${d.label}-${i}`}
                                ratio={Math.min(safeRatio, 1)}
                                label={d.label}
                                valueLabel={formatValue ? formatValue(d.value) : undefined}
                                isPeak={i === peakIndex}
                                delay={i * 55}
                                barColor={barColor}
                                trackColor={colors.divider}
                                peakLabelColor={colors.textPrimary}
                                height={plotHeight}
                                reduceMotion={reduceMotion}
                            />
                        );
                    })}
                </View>
            </View>
        </View>
    );
});
