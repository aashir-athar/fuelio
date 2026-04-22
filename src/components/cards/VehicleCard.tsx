import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { IMAGES } from '../../constants/images';
import { useVehicleStats } from '../../hooks/useVehicleStats';
import { useSettingsStore } from '../../store/settings.store';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, space } from '../../theme/tokens';
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

export const VehicleCard = React.memo(function VehicleCard({ vehicle, active = false, onPress }: Props) {
    const { colors } = useTheme();
    const router = useRouter();
    const stats = useVehicleStats(vehicle.id);
    const distanceUnit = useSettingsStore((s) => s.distanceUnit);

    return (
        <Pressable onPress={onPress} accessibilityRole="button">
            <Card
                elevated
                style={{
                    borderWidth: active ? 2 : 0,
                    borderColor: active ? colors.accent : 'transparent',
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[4] }}>
                    <Avatar source={IMAGES.addVehicle} size={64} />
                    <View style={{ flex: 1 }}>
                        <Text variant="heading" numberOfLines={1}>{vehicle.nickname}</Text>
                        <Text variant="caption" tone="secondary">
                            {vehicle.year} · {vehicle.make} {vehicle.model}
                        </Text>
                    </View>
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
                        onPress={() => router.push(`/modal/edit-vehicle?id=${vehicle.id}`)}
                        accessibilityRole="button"
                        accessibilityLabel="Edit vehicle"
                        hitSlop={8}
                        style={({ pressed }) => ({
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: colors.surfaceElevated,
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: pressed ? 0.6 : 1,
                        })}
                    >
                        <Ionicons name="pencil" size={16} color={colors.textSecondary} />
                    </Pressable>
                </View>

                <View
                    style={{
                        flexDirection: 'row',
                        marginTop: space[4],
                        paddingTop: space[4],
                        borderTopWidth: 1,
                        borderTopColor: colors.divider,
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <Text variant="micro" tone="muted">ODOMETER</Text>
                        <Text variant="bodyLg" weight="semibold">
                            {formatDistance(vehicle.odometer, distanceUnit)}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text variant="micro" tone="muted">AVG EFFICIENCY</Text>
                        <Text variant="bodyLg" weight="semibold" tone={stats?.stats.averageEfficiency ? 'accent' : 'muted'}>
                            {stats ? formatEfficiency(stats.stats.averageEfficiency, distanceUnit) : '—'}
                        </Text>
                    </View>
                </View>
            </Card>
        </Pressable>
    );
});