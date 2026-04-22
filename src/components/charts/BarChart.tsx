import React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
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
    delay,
    color,
    height,
    maxValue,
    formatValue,
}: {
    ratio: number;
    label: string;
    delay: number;
    color: string;
    height: number;
    maxValue: number;
    formatValue?: (v: number) => string;
}) {
    const progress = useSharedValue(0);
    React.useEffect(() => {
        progress.value = withDelay(delay, withSpring(ratio, spring.smooth));
    }, [delay, progress, ratio]);

    const animStyle = useAnimatedStyle(() => ({ height: progress.value * height }));

    return (
        <View style={{ flex: 1, alignItems: 'center', gap: space[2] }}>
            <View style={{ flex: 1, width: '70%', justifyContent: 'flex-end' }}>
                <Animated.View
                    style={[
                        animStyle,
                        {
                            backgroundColor: color,
                            borderRadius: radius.sm,
                        },
                    ]}
                />
            </View>
            <Text variant="micro" tone="secondary" numberOfLines={1}>{label}</Text>
        </View>
    );
});

export const BarChart = React.memo(function BarChart({
    data, height = 160, color, formatValue,
}: Props) {
    const { colors } = useTheme();
    const barColor = color ?? colors.accent;
    const maxValue = Math.max(...data.map((d) => d.value), 1);

    if (data.length === 0) {
        return (
            <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
                <Text tone="muted" variant="caption">No data yet</Text>
            </View>
        );
    }

    return (
        <View>
            <View style={{ height, flexDirection: 'row', gap: space[2] }}>
                {data.map((d, i) => (
                    <AnimatedBar
                        key={`${d.label}-${i}`}
                        ratio={d.value / maxValue}
                        label={d.label}
                        delay={i * 40}
                        color={barColor}
                        height={height - 20}
                        maxValue={maxValue}
                        formatValue={formatValue}
                    />
                ))}
            </View>
        </View>
    );
});