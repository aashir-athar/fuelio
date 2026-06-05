// Lever: peak-end + goal-gradient — a full lime progress bar and "you're in" framing
// turn the final setup step into an arrival, not a chore, lowering last-mile drop-off.
import { Card } from '@/src/components/primitives/Card';
import { Text } from '@/src/components/primitives/Text';
import { VehicleForm } from '@/src/components/sheets/VehicleForm';
import { IMAGES } from '@/src/constants/images';
import { useReduceMotion } from '@/src/hooks/useReduceMotion';
import { useTheme } from '@/src/theme/ThemeProvider';
import { accentGlow, duration, fontFamily, radius, space } from '@/src/theme/tokens';
import { Image } from 'expo-image';
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

    const enter = (delay: number) =>
        reduceMotion ? undefined : FadeInDown.delay(delay).duration(duration.slow);

    return (
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top + space[4] }}>
            {/* Top rail: wordmark + full step counter + completed lime progress bar */}
            <View style={{ paddingHorizontal: space[6], gap: space[4] }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                        <View
                            style={[
                                { width: 30, height: 30, borderRadius: radius.sm, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
                                accentGlow(colors.accent),
                            ]}
                        >
                            <Text style={{ fontFamily: fontFamily.display, fontSize: 18, lineHeight: 22, color: colors.textOnAccent }}>F</Text>
                        </View>
                        <Text variant="label" weight="semibold">FUELIO</Text>
                    </View>

                    <View
                        style={{
                            paddingHorizontal: space[3],
                            paddingVertical: space[1],
                            borderRadius: radius.pill,
                            backgroundColor: colors.accentMuted,
                        }}
                    >
                        <Text variant="micro" tone="accent" weight="semibold">FINAL STEP</Text>
                    </View>
                </View>

                <View style={{ height: 6, borderRadius: radius.pill, backgroundColor: colors.surfaceElevated, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: '100%', borderRadius: radius.pill, backgroundColor: colors.accent }} />
                </View>
            </View>

            {/* Hero header — big Manjari headline, lime image badge, confident framing */}
            <Animated.View
                entering={enter(0)}
                style={{ paddingHorizontal: space[6], paddingTop: space[6], flexDirection: 'row', alignItems: 'center', gap: space[5] }}
            >
                <Card
                    tone="lime"
                    padded={false}
                    radius={radius.lg}
                    style={[{ width: 84, height: 84, alignItems: 'center', justifyContent: 'center' }, accentGlow(colors.accent)]}
                >
                    <Image source={IMAGES.addVehicle} style={{ width: 60, height: 60 }} contentFit="contain" />
                </Card>
                <View style={{ flex: 1 }}>
                    <Text variant="micro" tone="accent" weight="semibold">YOU&apos;RE IN</Text>
                    <Text variant="title" style={{ marginTop: space[1] }}>
                        One last thing
                    </Text>
                </View>
            </Animated.View>

            <Animated.View entering={enter(80)} style={{ paddingHorizontal: space[6], paddingTop: space[3] }}>
                <Text variant="bodyLg" tone="secondary">
                    Add a vehicle and Fuelio starts tracking fuel economy and service from your very first fill. Add more anytime.
                </Text>
            </Animated.View>

            <Animated.View entering={enter(160)} style={{ flex: 1 }}>
                <VehicleForm submitLabel="Start tracking" onDone={onDone} />
            </Animated.View>
        </View>
    );
}
