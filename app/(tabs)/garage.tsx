import { VehicleCard } from '@/src/components/cards/VehicleCard';
import { Button } from '@/src/components/primitives/Button';
import { EmptyState } from '@/src/components/primitives/EmptyState';
import { Text } from '@/src/components/primitives/Text';
import { IMAGES } from '@/src/constants/images';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useSettingsStore } from '@/src/store/settings.store';
import { useVehicleStore } from '@/src/store/vehicle.store';
import { useTheme } from '@/src/theme/ThemeProvider';
import { space } from '@/src/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GarageScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const vehicles = useVehicleStore((s) => s.vehicles);
    const activeId = useSettingsStore((s) => s.activeVehicleId);
    const setActive = useSettingsStore((s) => s.setActiveVehicleId);
    const haptic = useHaptics();

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
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text variant="caption" tone="secondary">Garage</Text>
                        <Text variant="title" style={{ marginTop: 2 }}>{vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'}</Text>
                    </View>
                    <Pressable
                        onPress={() => router.push('/modal/add-vehicle')}
                        accessibilityRole="button"
                        accessibilityLabel="Add vehicle"
                        style={({ pressed }) => ({
                            width: 44, height: 44, borderRadius: 22,
                            backgroundColor: colors.accent,
                            alignItems: 'center', justifyContent: 'center',
                            transform: [{ scale: pressed ? 0.94 : 1 }],
                        })}
                    >
                        <Ionicons name="add" size={24} color={colors.textOnAccent} />
                    </Pressable>
                </View>

                {vehicles.length === 0 ? (
                    <EmptyState
                        image={IMAGES.addVehicle}
                        title="No vehicles yet"
                        subtitle="Add your first vehicle to start tracking fuel and maintenance."
                        ctaLabel="Add vehicle"
                        onCta={() => router.push('/modal/add-vehicle')}
                    />
                ) : (
                    <View style={{ gap: space[3], marginTop: space[5] }}>
                        {vehicles.map((v) => (
                            <VehicleCard
                                key={v.id}
                                vehicle={v}
                                active={v.id === activeId}
                                onPress={() => {
                                    haptic('selection');
                                    setActive(v.id);
                                }}
                            />
                        ))}

                        <Button
                            label="Add another vehicle"
                            onPress={() => router.push('/modal/add-vehicle')}
                            variant="secondary"
                            size="lg"
                            fullWidth
                            style={{ marginTop: space[3] }}
                        />
                    </View>
                )}
            </ScrollView>
        </View>
    );
}