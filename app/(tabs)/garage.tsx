// Lever: Endowed progress + Fitts's Law — a clear active-vehicle anchor and an
// edge-reachable add affordance keep the most frequent garage action one tap away.
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
import { radius, space, spring } from '@/src/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
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

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView
                contentContainerStyle={{
                    paddingTop: insets.top + space[3],
                    paddingBottom: insets.bottom + 120,
                    paddingHorizontal: space[5],
                }}
                showsVerticalScrollIndicator={false}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                    }}
                >
                    <View style={{ flex: 1, paddingRight: space[4] }}>
                        <Text variant="caption" tone="secondary">Garage</Text>
                        <Text variant="title" style={{ marginTop: 2 }}>
                            {count} {count === 1 ? 'vehicle' : 'vehicles'}
                        </Text>
                        {activeVehicle ? (
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: space[2],
                                    marginTop: space[2],
                                }}
                            >
                                <View
                                    style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: radius.pill,
                                        backgroundColor: colors.accent,
                                    }}
                                />
                                <Text variant="caption" tone="secondary" numberOfLines={1}>
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
                                width: 48,
                                height: 48,
                                borderRadius: radius.pill,
                                backgroundColor: colors.accent,
                                alignItems: 'center',
                                justifyContent: 'center',
                                shadowColor: colors.accent,
                                shadowOpacity: 0.28,
                                shadowRadius: 14,
                                shadowOffset: { width: 0, height: 6 },
                                elevation: 6,
                            },
                        ]}
                    >
                        <Ionicons name="add" size={26} color={colors.textOnAccent} />
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
                    <View style={{ gap: space[3], marginTop: space[6] }}>
                        {vehicles.map((v) => (
                            <VehicleCard
                                key={v.id}
                                vehicle={v}
                                active={v.id === activeId}
                                onPress={() => handleSelect(v.id)}
                            />
                        ))}

                        <Button
                            label="Add another vehicle"
                            onPress={goAdd}
                            variant="secondary"
                            size="lg"
                            fullWidth
                            leftIcon={<Ionicons name="add" size={20} color={colors.textPrimary} />}
                            style={{ marginTop: space[3] }}
                        />
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
