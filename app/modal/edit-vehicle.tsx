import { Button } from '@/src/components/primitives/Button';
import { Text } from '@/src/components/primitives/Text';
import { VehicleForm } from '@/src/components/sheets/VehicleForm';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useFuelStore } from '@/src/store/fuel.store';
import { useServiceStore } from '@/src/store/service.store';
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
    const deleteVehicleFuel = useFuelStore((s) => s.deleteForVehicle);
    const deleteVehicleService = useServiceStore((s) => s.deleteForVehicle);

    const vehicle = vehicles.find((v) => v.id === id);

    if (!vehicle) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Vehicle not found</Text>
                <Button label="Close" onPress={() => router.back()} style={{ marginTop: space[4] }} />
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
                        deleteVehicleFuel(vehicle.id);
                        deleteVehicleService(vehicle.id);
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
                    alignItems: 'center',
                    paddingHorizontal: space[5],
                    paddingVertical: space[4],
                }}
            >
                <Text variant="heading">Edit vehicle</Text>
                <Pressable
                    onPress={() => router.back()}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: colors.surfaceElevated,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Ionicons name="close" size={22} color={colors.textPrimary} />
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