import { Button } from '@/src/components/primitives/Button';
import { Text } from '@/src/components/primitives/Text';
import { VehicleForm } from '@/src/components/sheets/VehicleForm';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useVehicleStore } from '@/src/store/vehicle.store';
import { useTheme } from '@/src/theme/ThemeProvider';
import { space } from '@/src/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditVehicleModal() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const haptic = useHaptics();
    const { id } = useLocalSearchParams<{ id: string }>();

    const vehicles = useVehicleStore((s) => s.vehicles);
    const deleteVehicle = useVehicleStore((s) => s.deleteVehicle);

    const vehicle = vehicles.find((v) => v.id === id);

    if (!vehicle) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: space[6] }}>
                <Text variant="heading">Vehicle not found</Text>
                <Text variant="caption" tone="muted" style={{ marginTop: space[2], textAlign: 'center' }}>
                    It may have been deleted from your garage.
                </Text>
                <Button label="Close" onPress={() => router.back()} style={{ marginTop: space[5] }} />
            </View>
        );
    }

    const handleDelete = () => {
        Alert.alert(
            `Delete "${vehicle.nickname}"?`,
            'This will also delete all fuel and service records for this vehicle. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        // Cascade (fuel + service) is enforced inside the store.
                        deleteVehicle(vehicle.id);
                        haptic('warning');
                        router.back();
                    },
                },
            ],
        );
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    paddingHorizontal: space[5],
                    paddingTop: insets.top + space[3],
                    paddingBottom: space[4],
                }}
            >
                <View style={{ flex: 1, paddingRight: space[4] }}>
                    <Text variant="micro" tone="secondary">EDIT VEHICLE</Text>
                    <Text variant="title" numberOfLines={1} style={{ marginTop: space[1] }}>
                        {vehicle.nickname}
                    </Text>
                </View>
                <Pressable
                    onPress={() => router.back()}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                    hitSlop={8}
                    style={({ pressed }) => ({
                        width: 52,
                        height: 52,
                        borderRadius: 26,
                        backgroundColor: colors.surfaceElevated,
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: [{ scale: pressed ? 0.94 : 1 }],
                    })}
                >
                    <Ionicons name="close" size={24} color={colors.textPrimary} />
                </Pressable>
            </View>

            <VehicleForm
                initialVehicle={vehicle}
                submitLabel="Save changes"
                onDone={() => {
                    haptic('success');
                    router.back();
                }}
                footerSlot={
                    <Button
                        label="Delete vehicle"
                        onPress={handleDelete}
                        variant="danger"
                        fullWidth
                    />
                }
            />
        </KeyboardAvoidingView>
    );
}
