import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { IMAGES } from '../../constants/images';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import { useVehicleStats } from '../../hooks/useVehicleStats';
import { useSettingsStore } from '../../store/settings.store';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, space, spring } from '../../theme/tokens';
import type { Vehicle } from '../../types';
import { formatDistance, formatEfficiency } from '../../utils/format';
import { Avatar } from '../primitives/Avatar';
import { Card } from '../primitives/Card';
import { Text } from '../primitives/Text';

interface Props {
    vehicle: Vehicle;
    active?: boolean;
    onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const VehicleCard = React.memo(function VehicleCard({ vehicle, active = false, onPress }: Props) {
    const { colors } = useTheme();
    const router = useRouter();
    const stats = useVehicleStats(vehicle.id);
    const distanceUnit = useSettingsStore((s) => s.distanceUnit);
    const reduceMotion = useReduceMotion();

    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    const hasEconomy = !!stats && stats.stats.averageEfficiency > 0;
    const economy = stats ? formatEfficiency(stats.stats.averageEfficiency, distanceUnit) : '—';

    const handlePressIn = useCallback(() => {
        if (onPress && !reduceMotion) scale.value = withSpring(0.98, spring.snappy);
    }, [onPress, reduceMotion, scale]);

    const handlePressOut = useCallback(() => {
        if (!reduceMotion) scale.value = withSpring(1, spring.snappy);
    }, [reduceMotion, scale]);

    const handleEdit = useCallback(() => {
        router.push(`/modal/edit-vehicle?id=${vehicle.id}`);
    }, [router, vehicle.id]);

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            accessibilityRole="button"
            accessibilityLabel={vehicle.nickname}
            style={animStyle}
        >
            <Card
                elevated
                style={{
                    borderWidth: active ? 1.5 : 0,
                    borderColor: active ? colors.accent : 'transparent',
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[4] }}>
                    <Avatar source={IMAGES.addVehicle} size={60} tinted={active} />
                    <View style={{ flex: 1, gap: 2 }}>
                        <Text variant="heading" numberOfLines={1}>{vehicle.nickname}</Text>
                        <Text variant="caption" tone="secondary" numberOfLines={1}>
                            {vehicle.year} · {vehicle.make} {vehicle.model}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: space[2] }}>
                        {active ? (
                            <View
                                style={{
                                    paddingHorizontal: space[3],
                                    paddingVertical: space[1],
                                    backgroundColor: colors.accentMuted,
                                    borderRadius: radius.pill,
                                }}
                            >
                                <Text variant="micro" tone="accent" weight="bold">ACTIVE</Text>
                            </View>
                        ) : null}
                        <Pressable
                            onPress={handleEdit}
                            accessibilityRole="button"
                            accessibilityLabel={`Edit ${vehicle.nickname}`}
                            hitSlop={10}
                            style={({ pressed }) => ({
                                width: 44,
                                height: 44,
                                borderRadius: radius.md,
                                backgroundColor: colors.surface,
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: pressed ? 0.6 : 1,
                            })}
                        >
                            <Ionicons name="pencil" size={17} color={colors.textSecondary} />
                        </Pressable>
                    </View>
                </View>

                <View
                    style={{
                        flexDirection: 'row',
                        marginTop: space[4],
                        paddingTop: space[4],
                        borderTopWidth: 1,
                        borderTopColor: colors.divider,
                        gap: space[4],
                    }}
                >
                    <View style={{ flex: 1, gap: space[1] }}>
                        <Text variant="micro" tone="muted">ODOMETER</Text>
                        <Text variant="bodyLg" weight="semibold">
                            {formatDistance(vehicle.odometer, distanceUnit)}
                        </Text>
                    </View>
                    <View
                        style={{
                            width: 1,
                            alignSelf: 'stretch',
                            backgroundColor: colors.divider,
                        }}
                    />
                    <View style={{ flex: 1, gap: space[1] }}>
                        <Text variant="micro" tone="muted">AVG ECONOMY</Text>
                        <Text variant="bodyLg" weight="semibold" tone={hasEconomy ? 'accent' : 'muted'}>
                            {economy}
                        </Text>
                    </View>
                </View>
            </Card>
        </AnimatedPressable>
    );
});
