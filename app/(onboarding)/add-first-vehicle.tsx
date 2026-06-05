// Lever: peak-end + commitment — framing this as the final, single step ("you're
// almost in") lowers setup friction and makes finishing feel like an arrival.
import { Text } from '@/src/components/primitives/Text';
import { VehicleForm } from '@/src/components/sheets/VehicleForm';
import { useReduceMotion } from '@/src/hooks/useReduceMotion';
import { useTheme } from '@/src/theme/ThemeProvider';
import { duration, radius, space } from '@/src/theme/tokens';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddFirstVehicleScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const reduceMotion = useReduceMotion();

    const onDone = useCallback(() => router.replace('/(tabs)'), [router]);

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: colors.background,
                paddingTop: insets.top + space[3],
            }}
        >
            <Animated.View
                entering={reduceMotion ? undefined : FadeInDown.duration(duration.normal)}
                style={{ paddingHorizontal: space[6], paddingBottom: space[2], gap: space[2] }}
            >
                <View
                    style={{
                        alignSelf: 'flex-start',
                        paddingHorizontal: space[3],
                        paddingVertical: space[1],
                        borderRadius: radius.pill,
                        backgroundColor: colors.accentSoft,
                    }}
                >
                    <Text variant="micro" tone="accent" weight="semibold">
                        LAST STEP
                    </Text>
                </View>
                <Text variant="caption" tone="secondary">
                    Add one vehicle to start tracking fuel and service. You can add more anytime.
                </Text>
            </Animated.View>

            <VehicleForm submitLabel="Add my first vehicle" onDone={onDone} />
        </View>
    );
}
