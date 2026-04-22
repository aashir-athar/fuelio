import React, { useCallback } from 'react';
import { Pressable, type ViewStyle } from 'react-native';
import { useHaptics } from '../../hooks/useHaptics';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, space } from '../../theme/tokens';
import { Text } from './Text';

interface Props {
    label: string;
    selected?: boolean;
    onPress?: () => void;
    style?: ViewStyle;
}

export const Chip = React.memo(function Chip({ label, selected = false, onPress, style }: Props) {
    const { colors } = useTheme();
    const haptic = useHaptics();

    const handle = useCallback(() => {
        haptic('selection');
        onPress?.();
    }, [haptic, onPress]);

    return (
        <Pressable
            onPress={handle}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[
                {
                    paddingHorizontal: space[4],
                    paddingVertical: space[2],
                    borderRadius: radius.pill,
                    backgroundColor: selected ? colors.accent : colors.surfaceElevated,
                    borderWidth: 1,
                    borderColor: selected ? colors.accent : colors.divider,
                },
                style,
            ]}
        >
            <Text
                variant="label"
                tone={selected ? 'onAccent' : 'secondary'}
                weight="semibold"
            >
                {label}
            </Text>
        </Pressable>
    );
});