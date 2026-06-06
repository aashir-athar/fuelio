// Lever: Endowed progress + Fitts's Law — a bold garage headline anchors the count,
// and an edge-reachable lime add affordance keeps the most frequent action one tap away.
import { VehicleCard } from '@/src/components/cards/VehicleCard';
import { Button } from '@/src/components/primitives/Button';
import { EmptyState } from '@/src/components/primitives/EmptyState';
import { Text } from '@/src/components/primitives/Text';
import { IMAGES } from '@/src/constants/images';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useReduceMotion } from '@/src/hooks/useReduceMotion';
import { useSettingsStore } from '@/src/store/settings.store';
import { useVehicleStore } from '@/src/store/vehicle.store';
import { useTheme } from '@/src/theme/ThemeProvider';
import { accentGlow, fontFamily, radius, space, spring } from '@/src/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function GarageScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const vehicles = useVehicleStore((s) => s.vehicles);
    const activeId = useSettingsStore((s) => s.activeVehicleId);
    const setActive = useSettingsStore((s) => s.setActiveVehicleId);
    const haptic = useHaptics();
    const reduceMotion = useReduceMotion();

    const addScale = useSharedValue(1);
    const addStyle = useAnimatedStyle(() => ({ transform: [{ scale: addScale.value }] }));

    const handleAddIn = useCallback(() => {
        if (!reduceMotion) addScale.value = withSpring(0.92, spring.snappy);
    }, [addScale, reduceMotion]);

    const handleAddOut = useCallback(() => {
        if (!reduceMotion) addScale.value = withSpring(1, spring.snappy);
    }, [addScale, reduceMotion]);

    const goAdd = useCallback(() => router.push('/modal/add-vehicle'), [router]);

    const handleSelect = useCallback(
        (id: string) => {
            haptic('selection');
            setActive(id);
        },
        [haptic, setActive],
    );

    const count = vehicles.length;
    const activeVehicle = vehicles.find((v) => v.id === activeId) ?? null;

    const enter = (delay: number) => (reduceMotion ? undefined : FadeInDown.duration(380).delay(delay));

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView
                contentContainerStyle={{
                    paddingTop: insets.top + space[4],
                    paddingBottom: insets.bottom + 130,
                    paddingHorizontal: space[5],
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header — big rounded garage headline + count */}
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: space[6],
                    }}
                >
                    <View style={{ flex: 1, paddingRight: space[4] }}>
                        <Text variant="micro" tone="secondary">GARAGE</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space[3], marginTop: space[1] }}>
                            <Text style={{ fontFamily: fontFamily.display, fontSize: 56, lineHeight: 58, letterSpacing: -1.5, color: colors.textPrimary }}>
                                {count}
                            </Text>
                            <Text variant="bodyLg" tone="secondary" weight="semibold">
                                {count === 1 ? 'vehicle' : 'vehicles'}
                            </Text>
                        </View>
                        {activeVehicle ? (
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: space[2],
                                    marginTop: space[3],
                                    alignSelf: 'flex-start',
                                    paddingHorizontal: space[3],
                                    paddingVertical: space[2],
                                    borderRadius: radius.pill,
                                    backgroundColor: colors.surfaceElevated,
                                }}
                            >
                                <View
                                    style={{
                                        width: 7,
                                        height: 7,
                                        borderRadius: radius.pill,
                                        backgroundColor: colors.accent,
                                    }}
                                />
                                <Text variant="micro" tone="secondary" weight="semibold" numberOfLines={1}>
                                    Tracking {activeVehicle.nickname}
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    <AnimatedPressable
                        onPress={goAdd}
                        onPressIn={handleAddIn}
                        onPressOut={handleAddOut}
                        accessibilityRole="button"
                        accessibilityLabel="Add vehicle"
                        accessibilityHint="Opens the new vehicle form"
                        hitSlop={8}
                        style={[
                            addStyle,
                            {
                                width: 56,
                                height: 56,
                                borderRadius: radius.pill,
                                backgroundColor: colors.accent,
                                alignItems: 'center',
                                justifyContent: 'center',
                            },
                            accentGlow(colors.accent),
                        ]}
                    >
                        <Ionicons name="add" size={28} color={colors.textOnAccent} />
                    </AnimatedPressable>
                </View>

                {count === 0 ? (
                    <View style={{ marginTop: space[6] }}>
                        <EmptyState
                            image={IMAGES.addVehicle}
                            title="No vehicles yet"
                            subtitle="Add your first vehicle to start tracking fuel and maintenance."
                            ctaLabel="Add vehicle"
                            onCta={goAdd}
                        />
                    </View>
                ) : (
                    <View style={{ gap: space[3] }}>
                        {vehicles.map((v, i) => (
                            <Animated.View key={v.id} entering={enter(i * 70)}>
                                <VehicleCard
                                    vehicle={v}
                                    active={v.id === activeId}
                                    onPress={() => handleSelect(v.id)}
                                />
                            </Animated.View>
                        ))}

                        <Animated.View entering={enter(vehicles.length * 70)}>
                            <Button
                                label="Add another vehicle"
                                onPress={goAdd}
                                variant="primary"
                                size="lg"
                                fullWidth
                                leftIcon={<Ionicons name="add" size={20} color={colors.textOnAccent} />}
                                style={{ marginTop: space[3] }}
                            />
                        </Animated.View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
