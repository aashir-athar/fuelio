import { Button } from '@/src/components/primitives/Button';
import { Card } from '@/src/components/primitives/Card';
import { Text } from '@/src/components/primitives/Text';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useFuelStore } from '@/src/store/fuel.store';
import { useServiceStore } from '@/src/store/service.store';
import { useVehicleStore } from '@/src/store/vehicle.store';
import { useTheme } from '@/src/theme/ThemeProvider';
import { space } from '@/src/theme/tokens';
import { fuelEntriesToCsv, serviceEntriesToCsv, vehiclesToCsv } from '@/src/utils/csv';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Note: expo-clipboard is included transparently via expo-web-browser's deps;
// if needed, add "expo-clipboard": "~8.0.7" to package.json.
// For this implementation we fall back to Alert preview if Clipboard is unavailable.

export default function ExportModal() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const vehicles = useVehicleStore((s) => s.vehicles);
    const fuel = useFuelStore((s) => s.entries);
    const services = useServiceStore((s) => s.entries);
    const haptic = useHaptics();

    const copy = async (text: string, label: string) => {
        try {
            await Clipboard.setStringAsync(text);
            haptic('success');
            Alert.alert('Copied', `${label} CSV copied to clipboard.`);
        } catch {
            Alert.alert(`${label} CSV`, text.slice(0, 1000) + (text.length > 1000 ? '\n…' : ''));
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space[5], paddingVertical: space[4] }}>
                <Text variant="heading">Export data</Text>
                <Pressable
                    onPress={() => router.back()}
                    style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Ionicons name="close" size={22} color={colors.textPrimary} />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: space[5], gap: space[4], paddingBottom: insets.bottom + space[6] }}>
                <Card>
                    <Text variant="bodyLg" weight="semibold">Vehicles</Text>
                    <Text variant="caption" tone="secondary" style={{ marginTop: space[1] }}>
                        {vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'}
                    </Text>
                    <Button
                        label="Copy vehicles CSV"
                        onPress={() => copy(vehiclesToCsv(vehicles), 'Vehicles')}
                        style={{ marginTop: space[3] }}
                        variant="secondary"
                        fullWidth
                    />
                </Card>

                <Card>
                    <Text variant="bodyLg" weight="semibold">Fuel history</Text>
                    <Text variant="caption" tone="secondary" style={{ marginTop: space[1] }}>
                        {fuel.length} {fuel.length === 1 ? 'entry' : 'entries'}
                    </Text>
                    <Button
                        label="Copy fuel CSV"
                        onPress={() => copy(fuelEntriesToCsv(fuel), 'Fuel')}
                        style={{ marginTop: space[3] }}
                        variant="secondary"
                        fullWidth
                    />
                </Card>

                <Card>
                    <Text variant="bodyLg" weight="semibold">Service history</Text>
                    <Text variant="caption" tone="secondary" style={{ marginTop: space[1] }}>
                        {services.length} {services.length === 1 ? 'entry' : 'entries'}
                    </Text>
                    <Button
                        label="Copy service CSV"
                        onPress={() => copy(serviceEntriesToCsv(services), 'Services')}
                        style={{ marginTop: space[3] }}
                        variant="secondary"
                        fullWidth
                    />
                </Card>
            </ScrollView>
        </View>
    );
}