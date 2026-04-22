import React, { useCallback, useState } from 'react';
import { LayoutChangeEvent, Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useHaptics } from '../../hooks/useHaptics';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, space, spring } from '../../theme/tokens';
import { Text } from './Text';

interface Props<T extends string> {
    options: readonly { value: T; label: string }[];
    value: T;
    onChange: (v: T) => void;
}

export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
    const { colors } = useTheme();
    const haptic = useHaptics();
    const activeIdx = options.findIndex((o) => o.value === value);
    const idxShared = useSharedValue(activeIdx);
    const [containerWidth, setContainerWidth] = useState(0);

    React.useEffect(() => {
        idxShared.value = withSpring(activeIdx, spring.smooth);
    }, [activeIdx, idxShared]);

    const slotWidth = (containerWidth - space[1] * 2) / options.length;

    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: idxShared.value * slotWidth }],
        width: slotWidth,
    }));

    const handleLayout = useCallback((e: LayoutChangeEvent) => {
        setContainerWidth(e.nativeEvent.layout.width);
    }, []);

    const handle = useCallback(
        (v: T) => {
            haptic('selection');
            onChange(v);
        },
        [haptic, onChange],
    );

    return (
        <View
            onLayout={handleLayout}
            style={{
                flexDirection: 'row',
                backgroundColor: colors.surfaceElevated,
                borderRadius: radius.pill,
                padding: space[1],
                position: 'relative',
            }}
        >
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        top: space[1],
                        bottom: space[1],
                        left: space[1],
                        borderRadius: radius.pill,
                        backgroundColor: colors.accent,
                    },
                    indicatorStyle,
                ]}
            />
            {options.map((opt) => (
                <Pressable
                    key={opt.value}
                    onPress={() => handle(opt.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: opt.value === value }}
                    style={{
                        flex: 1,
                        paddingVertical: space[2],
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                    }}
                >
                    <Text
                        variant="label"
                        tone={opt.value === value ? 'onAccent' : 'secondary'}
                        weight="semibold"
                    >
                        {opt.label}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
}