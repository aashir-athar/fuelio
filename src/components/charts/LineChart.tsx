import React, { useMemo } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '../../theme/ThemeProvider';
import { space } from '../../theme/tokens';
import { Text } from '../primitives/Text';

interface Props {
    data: { label: string; value: number }[];
    height?: number;
    color?: string;
    formatValue?: (v: number) => string;
}

/**
 * Lightweight line chart built from plain Views.
 * - Zero native deps
 * - Worklet-friendly animated sweep
 * - Automatic y-axis normalization
 */
export const LineChart = React.memo(function LineChart({
    data, height = 180, color, formatValue,
}: Props) {
    const { colors } = useTheme();
    const [width, setWidth] = React.useState(0);
    const progress = useSharedValue(0);

    const lineColor = color ?? colors.accent;
    const maxValue = Math.max(...data.map((d) => d.value), 1);
    const minValue = Math.min(...data.map((d) => d.value), 0);
    const range = Math.max(maxValue - minValue, 1);

    React.useEffect(() => {
        progress.value = 0;
        progress.value = withTiming(1, { duration: 700 });
    }, [data, progress]);

    const segments = useMemo(() => {
        if (width === 0 || data.length < 2) return [];
        const step = width / (data.length - 1);
        const lines: { x: number; y: number; angle: number; length: number }[] = [];
        for (let i = 0; i < data.length - 1; i++) {
            const a = data[i]!;
            const b = data[i + 1]!;
            const ax = i * step;
            const ay = height - ((a.value - minValue) / range) * height;
            const bx = (i + 1) * step;
            const by = height - ((b.value - minValue) / range) * height;
            const dx = bx - ax;
            const dy = by - ay;
            const length = Math.hypot(dx, dy);
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
            lines.push({ x: ax, y: ay, angle, length });
        }
        return lines;
    }, [data, width, height, minValue, range]);

    const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

    const sweepStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

    if (data.length < 2) {
        return (
            <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
                <Text tone="muted" variant="caption">Not enough data</Text>
            </View>
        );
    }

    return (
        <View style={{ height: height + 32 }}>
            <View onLayout={onLayout} style={{ height, position: 'relative', overflow: 'hidden' }}>
                {/* Baseline gridlines */}
                {[0.25, 0.5, 0.75].map((ratio) => (
                    <View
                        key={ratio}
                        style={{
                            position: 'absolute',
                            left: 0, right: 0,
                            top: height * ratio,
                            height: 1,
                            backgroundColor: colors.divider,
                            opacity: 0.5,
                        }}
                    />
                ))}
                {/* Animated sweep mask */}
                <Animated.View
                    style={[{ position: 'absolute', left: 0, top: 0, bottom: 0, overflow: 'hidden' }, sweepStyle]}
                >
                    <View style={{ width, height }}>
                        {/* Line segments */}
                        {segments.map((s, i) => (
                            <View
                                key={i}
                                style={{
                                    position: 'absolute',
                                    left: s.x,
                                    top: s.y - 1.25,
                                    width: s.length,
                                    height: 2.5,
                                    borderRadius: 2,
                                    backgroundColor: lineColor,
                                    transform: [{ rotateZ: `${s.angle}deg` }],
                                    transformOrigin: 'left center',
                                }}
                            />
                        ))}
                        {/* Point dots */}
                        {data.map((d, i) => {
                            const step = width / (data.length - 1);
                            const x = i * step;
                            const y = height - ((d.value - minValue) / range) * height;
                            return (
                                <View
                                    key={i}
                                    style={{
                                        position: 'absolute',
                                        left: x - 4,
                                        top: y - 4,
                                        width: 8,
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: colors.surface,
                                        borderWidth: 2,
                                        borderColor: lineColor,
                                    }}
                                />
                            );
                        })}
                    </View>
                </Animated.View>
            </View>
            {/* X labels */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: space[2] }}>
                <Text variant="micro" tone="muted">{data[0]?.label}</Text>
                {data.length > 2 ? (
                    <Text variant="micro" tone="muted">{data[Math.floor(data.length / 2)]?.label}</Text>
                ) : null}
                <Text variant="micro" tone="muted">{data[data.length - 1]?.label}</Text>
            </View>
            {/* Value annotations */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: space[1] }}>
                <Text variant="micro" tone="secondary">
                    Min {formatValue ? formatValue(minValue) : minValue.toFixed(1)}
                </Text>
                <Text variant="micro" tone="secondary">
                    Max {formatValue ? formatValue(maxValue) : maxValue.toFixed(1)}
                </Text>
            </View>
        </View>
    );
});