import React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, space, spring } from '../../theme/tokens';
import { Text } from '../primitives/Text';

interface Props {
    data: { label: string; value: number }[];
    height?: number;
    color?: string;
    formatValue?: (v: number) => string;
}

const AnimatedBar = React.memo(function AnimatedBar({
    ratio,
    label,
    valueLabel,
    delay,
    color,
    height,
    reduceMotion,
}: {
    ratio: number;
    label: string;
    valueLabel?: string;
    delay: number;
    color: string;
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
        opacity: 0.45 + Math.min(progress.value, 1) * 0.55,
    }));

    return (
        <View style={{ flex: 1, alignItems: 'center', gap: space[2] }}>
            {valueLabel ? (
                <Text variant="micro" tone="secondary" numberOfLines={1}>{valueLabel}</Text>
            ) : null}
            <View style={{ flex: 1, width: '62%', justifyContent: 'flex-end', minHeight: 2 }}>
                <Animated.View
                    style={[
                        animStyle,
                        {
                            backgroundColor: color,
                            borderTopLeftRadius: radius.sm,
                            borderTopRightRadius: radius.sm,
                            borderBottomLeftRadius: radius.xs,
                            borderBottomRightRadius: radius.xs,
                            minHeight: 3,
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

    if (data.length === 0) {
        return (
            <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
                <Text tone="muted" variant="caption">No data yet</Text>
            </View>
        );
    }

    const plotHeight = height - 48;

    return (
        <View>
            <View style={{ height, position: 'relative' }}>
                {/* Baseline gridlines */}
                {[0, 0.5, 1].map((ratio) => (
                    <View
                        key={ratio}
                        pointerEvents="none"
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 22 + plotHeight * ratio,
                            height: 1,
                            backgroundColor: colors.divider,
                            opacity: ratio === 0 ? 0.7 : 0.35,
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
                                delay={i * 45}
                                color={barColor}
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
