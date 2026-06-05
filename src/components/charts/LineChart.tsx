import React, { useMemo } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import { useTheme } from '../../theme/ThemeProvider';
import { duration, space } from '../../theme/tokens';
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
    const reduceMotion = useReduceMotion();
    const [width, setWidth] = React.useState(0);
    const progress = useSharedValue(reduceMotion ? 1 : 0);

    const lineColor = color ?? colors.accent;
    const maxValue = Math.max(...data.map((d) => d.value), 1);
    const minValue = Math.min(...data.map((d) => d.value), 0);
    const range = Math.max(maxValue - minValue, 1);

    // Inset the plot so dots near the top/bottom edges are never clipped.
    const inset = 6;
    const plotHeight = height - inset * 2;

    const yFor = React.useCallback(
        (value: number) => inset + plotHeight - ((value - minValue) / range) * plotHeight,
        [inset, plotHeight, minValue, range],
    );

    React.useEffect(() => {
        if (reduceMotion) {
            progress.value = 1;
            return;
        }
        progress.value = 0;
        progress.value = withTiming(1, { duration: duration.xslow });
    }, [data, progress, reduceMotion]);

    const segments = useMemo(() => {
        if (width === 0 || data.length < 2) return [];
        const step = width / (data.length - 1);
        const lines: { x: number; y: number; angle: number; length: number }[] = [];
        for (let i = 0; i < data.length - 1; i++) {
            const a = data[i]!;
            const b = data[i + 1]!;
            const ax = i * step;
            const ay = yFor(a.value);
            const bx = (i + 1) * step;
            const by = yFor(b.value);
            const dx = bx - ax;
            const dy = by - ay;
            const length = Math.hypot(dx, dy);
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
            lines.push({ x: ax, y: ay, angle, length });
        }
        return lines;
    }, [data, width, yFor]);

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
        <View style={{ height: height + 40 }}>
            <View onLayout={onLayout} style={{ height, position: 'relative', overflow: 'hidden' }}>
                {/* Horizontal gridlines */}
                {[0, 0.5, 1].map((ratio) => (
                    <View
                        key={ratio}
                        pointerEvents="none"
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: inset + plotHeight * ratio,
                            height: 1,
                            backgroundColor: colors.divider,
                            opacity: ratio === 1 ? 0.7 : 0.35,
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
                            const y = yFor(d.value);
                            return (
                                <View
                                    key={i}
                                    style={{
                                        position: 'absolute',
                                        left: x - 5,
                                        top: y - 5,
                                        width: 10,
                                        height: 10,
                                        borderRadius: 5,
                                        backgroundColor: colors.surface,
                                        borderWidth: 2.5,
                                        borderColor: lineColor,
                                    }}
                                />
                            );
                        })}
                    </View>
                </Animated.View>
            </View>
            {/* X labels */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: space[3] }}>
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
