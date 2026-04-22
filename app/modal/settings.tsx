import { Card } from '@/src/components/primitives/Card';
import { SectionHeader } from '@/src/components/primitives/SectionHeader';
import { SegmentedControl } from '@/src/components/primitives/SegmentedControl';
import { Text } from '@/src/components/primitives/Text';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useFuelStore } from '@/src/store/fuel.store';
import { useServiceStore } from '@/src/store/service.store';
import { useSettingsStore } from '@/src/store/settings.store';
import { useVehicleStore } from '@/src/store/vehicle.store';
import { useTheme } from '@/src/theme/ThemeProvider';
import { space } from '@/src/theme/tokens';
import type { Currency } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function Row({
    label, right, onPress,
}: { label: string; right?: React.ReactNode; onPress?: () => void }) {
    const { colors } = useTheme();
    const Inner = onPress ? Pressable : View;
    return (
        <Inner
            onPress={onPress}
            accessibilityRole={onPress ? 'button' : undefined}
            style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                paddingVertical: space[4], paddingHorizontal: space[5],
            }}
        >
            <Text variant="body">{label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                {right}
                {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
            </View>
        </Inner>
    );
}

export default function SettingsModal() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const settings = useSettingsStore();
    const vehicleStore = useVehicleStore();
    const fuelStore = useFuelStore();
    const serviceStore = useServiceStore();
    const haptic = useHaptics();

    const wipeAll = () => {
        Alert.alert(
            'Wipe all data?',
            'This deletes every vehicle, fuel entry, and service record. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Wipe everything',
                    style: 'destructive',
                    onPress: () => {
                        vehicleStore.reset();
                        fuelStore.reset();
                        serviceStore.reset();
                        settings.reset();
                        haptic('warning');
                        router.replace('/(onboarding)/welcome');
                    },
                },
            ],
        );
    };

    const CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP', 'PKR', 'AED', 'SAR', 'INR'];

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space[5], paddingVertical: space[4] }}>
                <Text variant="heading">Settings</Text>
                <Pressable
                    onPress={() => router.back()}
                    style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Ionicons name="close" size={22} color={colors.textPrimary} />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: space[5], paddingBottom: insets.bottom + space[6] }}>
                <SectionHeader title="Appearance" />
                <Card padded={false} style={{ padding: space[4] }}>
                    <SegmentedControl
                        options={[
                            { value: 'system', label: 'System' },
                            { value: 'light', label: 'Light' },
                            { value: 'dark', label: 'Dark' },
                        ]}
                        value={settings.themePreference}
                        onChange={settings.setThemePreference}
                    />
                </Card>

                <SectionHeader title="Units" />
                <Card padded={false}>
                    <Row
                        label="Distance"
                        right={
                            <View style={{ minWidth: 160 }}>
                                <SegmentedControl
                                    options={[{ value: 'km', label: 'km' }, { value: 'mi', label: 'mi' }]}
                                    value={settings.distanceUnit}
                                    onChange={settings.setDistanceUnit}
                                />
                            </View>
                        }
                    />
                    <View style={{ height: 1, backgroundColor: colors.divider }} />
                    <Row
                        label="Volume"
                        right={
                            <View style={{ minWidth: 160 }}>
                                <SegmentedControl
                                    options={[{ value: 'liter', label: 'L' }, { value: 'gallon', label: 'gal' }]}
                                    value={settings.volumeUnit}
                                    onChange={settings.setVolumeUnit}
                                />
                            </View>
                        }
                    />
                </Card>

                <SectionHeader title="Currency" />
                <Card padded={false} style={{ padding: space[4] }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
                        {CURRENCIES.map((c) => (
                            <Pressable
                                key={c}
                                onPress={() => { haptic('selection'); settings.setCurrency(c); }}
                                style={{
                                    paddingHorizontal: space[4], paddingVertical: space[2],
                                    borderRadius: 999,
                                    backgroundColor: settings.currency === c ? colors.accent : colors.surfaceElevated,
                                }}
                            >
                                <Text variant="label" weight="semibold" tone={settings.currency === c ? 'onAccent' : 'primary'}>
                                    {c}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </Card>

                <SectionHeader title="Notifications" />
                <Card padded={false}>
                    <Row
                        label="Service reminders"
                        right={
                            <Switch
                                value={settings.notificationsEnabled}
                                onValueChange={settings.setNotificationsEnabled}
                                trackColor={{ true: colors.accent, false: colors.divider }}
                                thumbColor={colors.surface}
                            />
                        }
                    />
                </Card>

                <SectionHeader title="Data" />
                <Card padded={false}>
                    <Row label="Export CSV" onPress={() => router.push('/modal/export')} />
                    <View style={{ height: 1, backgroundColor: colors.divider }} />
                    <Row label="Wipe all data" onPress={wipeAll} />
                </Card>

                <SectionHeader title="About" />
                <Card padded={false} style={{ padding: space[5] }}>
                    <Text variant="body" weight="semibold">Fuelio</Text>
                    <Text variant="caption" tone="secondary" style={{ marginTop: space[1] }}>
                        Drive smarter. Spend less. Maintain better.
                    </Text>
                    <Text variant="caption" tone="muted" style={{ marginTop: space[3] }}>
                        Version 1.0.0 · 100% offline · No ads · No tracking
                    </Text>
                </Card>
            </ScrollView>
        </View>
    );
}