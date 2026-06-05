// Lever: endowed progress + status salience — the active vehicle is a full lime
// hero so the one car you're tracking is unmistakable; the rest stay calm charcoal.
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
import { accentGlow, radius, space, spring } from '../../theme/tokens';
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

    // On lime, "onAccent" tones read as near-black; charcoal cards use the usual scale.
    const titleTone = active ? 'onAccent' : 'primary';
    const subTone = active ? 'onAccent' : 'secondary';
    // Sub-tiles sitting on lime are dark; on charcoal they're the base surface.
    const tileBg = active ? colors.textOnAccent : colors.surface;
    const tileIcon = active ? colors.accent : colors.textSecondary;
    const dividerColor = active ? colors.scrim : colors.divider;
    const economyTone = active ? 'onAccent' : hasEconomy ? 'accent' : 'muted';

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
            accessibilityState={{ selected: active }}
            style={animStyle}
        >
            <Card
                tone={active ? 'lime' : 'elevated'}
                style={active ? accentGlow(colors.accent) : undefined}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[4] }}>
                    <Avatar
                        source={IMAGES.addVehicle}
                        size={60}
                        tinted={false}
                        style={{ backgroundColor: active ? colors.textOnAccent : colors.accentSoft, borderRadius: radius.lg }}
                    />
                    <View style={{ flex: 1, gap: 2 }}>
                        <Text variant="heading" tone={titleTone} numberOfLines={1}>{vehicle.nickname}</Text>
                        <Text variant="caption" tone={subTone} numberOfLines={1} style={active ? { opacity: 0.7 } : undefined}>
                            {vehicle.year} · {vehicle.make} {vehicle.model}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: space[2] }}>
                        {active ? (
                            <View
                                style={{
                                    paddingHorizontal: space[3],
                                    paddingVertical: space[1],
                                    backgroundColor: colors.textOnAccent,
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
                                borderRadius: radius.pill,
                                backgroundColor: tileBg,
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: pressed ? 0.6 : 1,
                            })}
                        >
                            <Ionicons name="pencil" size={17} color={tileIcon} />
                        </Pressable>
                    </View>
                </View>

                <View
                    style={{
                        flexDirection: 'row',
                        marginTop: space[5],
                        paddingTop: space[4],
                        borderTopWidth: 1,
                        borderTopColor: dividerColor,
                        gap: space[4],
                    }}
                >
                    <View style={{ flex: 1, gap: space[1] }}>
                        <Text variant="micro" tone={active ? 'onAccent' : 'muted'} style={active ? { opacity: 0.6 } : undefined}>ODOMETER</Text>
                        <Text variant="heading" tone={titleTone} numberOfLines={1}>
                            {formatDistance(vehicle.odometer, distanceUnit)}
                        </Text>
                    </View>
                    <View
                        style={{
                            width: 1,
                            alignSelf: 'stretch',
                            backgroundColor: dividerColor,
                        }}
                    />
                    <View style={{ flex: 1, gap: space[1] }}>
                        <Text variant="micro" tone={active ? 'onAccent' : 'muted'} style={active ? { opacity: 0.6 } : undefined}>AVG ECONOMY</Text>
                        <Text variant="heading" tone={economyTone} numberOfLines={1}>
                            {economy}
                        </Text>
                    </View>
                </View>
            </Card>
        </AnimatedPressable>
    );
});
