import { Card } from '@/src/components/primitives/Card';
import { SectionHeader } from '@/src/components/primitives/SectionHeader';
import { SegmentedControl } from '@/src/components/primitives/SegmentedControl';
import { Text } from '@/src/components/primitives/Text';
import { useHaptics } from '@/src/hooks/useHaptics';
import { disableStationDetection, enableStationDetection } from '@/src/services/location';
import { requestNotificationPermission } from '@/src/services/notifications';
import { useFuelStore } from '@/src/store/fuel.store';
import { useServiceStore } from '@/src/store/service.store';
import { useSettingsStore } from '@/src/store/settings.store';
import { useVehicleStore } from '@/src/store/vehicle.store';
import { useTheme } from '@/src/theme/ThemeProvider';
import { radius, space } from '@/src/theme/tokens';
import type { Currency } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Alert, Pressable, ScrollView, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const CURRENCIES: readonly Currency[] = ['USD', 'EUR', 'GBP', 'PKR', 'AED', 'SAR', 'INR'];

/** A settings row with a leading icon coin, label, and a trailing control or chevron. */
const Row = React.memo(function Row({
    icon,
    label,
    right,
    onPress,
    tone = 'default',
}: {
    icon: IconName;
    label: string;
    right?: React.ReactNode;
    onPress?: () => void;
    tone?: 'default' | 'danger';
}) {
    const { colors } = useTheme();
    const isDanger = tone === 'danger';
    const labelColor = isDanger ? colors.danger : colors.textPrimary;
    const coinBg = isDanger ? colors.surfaceElevated : colors.surfaceElevated;
    const iconColor = isDanger ? colors.danger : colors.textSecondary;

    const content = (
        <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], flex: 1 }}>
                <View
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: radius.sm,
                        backgroundColor: coinBg,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Ionicons name={icon} size={17} color={iconColor} />
                </View>
                <Text variant="body" weight="medium" style={{ color: labelColor }}>
                    {label}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                {right}
                {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
            </View>
        </>
    );

    if (!onPress) {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: 56,
                    paddingVertical: space[3],
                    paddingHorizontal: space[4],
                }}
            >
                {content}
            </View>
        );
    }

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: 56,
                paddingVertical: space[3],
                paddingHorizontal: space[4],
                backgroundColor: pressed ? colors.surfaceElevated : 'transparent',
            })}
        >
            {content}
        </Pressable>
    );
});

const Divider = React.memo(function Divider() {
    const { colors } = useTheme();
    return <View style={{ height: 1, marginLeft: space[4] + 32 + space[3], backgroundColor: colors.divider }} />;
});

export default function SettingsModal() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const haptic = useHaptics();

    const themePreference = useSettingsStore((s) => s.themePreference);
    const setThemePreference = useSettingsStore((s) => s.setThemePreference);
    const distanceUnit = useSettingsStore((s) => s.distanceUnit);
    const setDistanceUnit = useSettingsStore((s) => s.setDistanceUnit);
    const volumeUnit = useSettingsStore((s) => s.volumeUnit);
    const setVolumeUnit = useSettingsStore((s) => s.setVolumeUnit);
    const currency = useSettingsStore((s) => s.currency);
    const setCurrency = useSettingsStore((s) => s.setCurrency);
    const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled);
    const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled);
    const locationPromptEnabled = useSettingsStore((s) => s.locationPromptEnabled);
    const setLocationPromptEnabled = useSettingsStore((s) => s.setLocationPromptEnabled);
    const resetSettings = useSettingsStore((s) => s.reset);

    const resetVehicles = useVehicleStore((s) => s.reset);
    const resetFuel = useFuelStore((s) => s.reset);
    const resetServices = useServiceStore((s) => s.reset);

    const wipeAll = useCallback(() => {
        Alert.alert(
            'Wipe all data?',
            'This deletes every vehicle, fuel entry, and service record. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Wipe everything',
                    style: 'destructive',
                    onPress: () => {
                        resetVehicles();
                        resetFuel();
                        resetServices();
                        resetSettings();
                        haptic('warning');
                        router.replace('/(onboarding)/welcome');
                    },
                },
            ],
        );
    }, [resetVehicles, resetFuel, resetServices, resetSettings, haptic, router]);

    const pickCurrency = useCallback(
        (c: Currency) => {
            haptic('selection');
            setCurrency(c);
        },
        [haptic, setCurrency],
    );

    const onToggleNotifications = useCallback(
        async (value: boolean) => {
            if (value) {
                const granted = await requestNotificationPermission();
                if (!granted) {
                    Alert.alert(
                        'Allow notifications',
                        'To get service reminders, turn on notifications for Fuelio in your device settings.',
                    );
                    return;
                }
            }
            setNotificationsEnabled(value);
        },
        [setNotificationsEnabled],
    );

    const onToggleLocation = useCallback(
        async (value: boolean) => {
            if (value) {
                const ok = await enableStationDetection();
                if (!ok) {
                    Alert.alert(
                        'Location needed',
                        'To offer a fuel-log prompt when you stop at a station, allow Fuelio to use your location (including in the background) in your device settings. This is optional and off by default.',
                    );
                    return;
                }
            } else {
                await disableStationDetection();
            }
            setLocationPromptEnabled(value);
        },
        [setLocationPromptEnabled],
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: space[5],
                    paddingTop: space[3],
                    paddingBottom: space[4],
                }}
            >
                <View>
                    <Text variant="heading">Settings</Text>
                    <Text variant="caption" tone="muted" style={{ marginTop: space[1] }}>
                        Tune Fuelio to the way you drive
                    </Text>
                </View>
                <Pressable
                    onPress={() => router.back()}
                    accessibilityRole="button"
                    accessibilityLabel="Close settings"
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: radius.pill,
                        backgroundColor: colors.surfaceElevated,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Ionicons name="close" size={22} color={colors.textPrimary} />
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: space[5], paddingBottom: insets.bottom + space[8] }}
                showsVerticalScrollIndicator={false}
            >
                <SectionHeader title="Appearance" />
                <Card padded={false} style={{ padding: space[4] }}>
                    <SegmentedControl
                        options={[
                            { value: 'system', label: 'System' },
                            { value: 'light', label: 'Light' },
                            { value: 'dark', label: 'Dark' },
                        ]}
                        value={themePreference}
                        onChange={setThemePreference}
                    />
                </Card>

                <SectionHeader title="Units" />
                <Card padded={false}>
                    <Row
                        icon="speedometer-outline"
                        label="Distance"
                        right={
                            <View style={{ width: 132 }}>
                                <SegmentedControl
                                    options={[{ value: 'km', label: 'km' }, { value: 'mi', label: 'mi' }]}
                                    value={distanceUnit}
                                    onChange={setDistanceUnit}
                                />
                            </View>
                        }
                    />
                    <Divider />
                    <Row
                        icon="water-outline"
                        label="Volume"
                        right={
                            <View style={{ width: 132 }}>
                                <SegmentedControl
                                    options={[{ value: 'liter', label: 'L' }, { value: 'gallon', label: 'gal' }]}
                                    value={volumeUnit}
                                    onChange={setVolumeUnit}
                                />
                            </View>
                        }
                    />
                </Card>

                <SectionHeader title="Currency" />
                <Card padded={false} style={{ padding: space[4] }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
                        {CURRENCIES.map((c) => {
                            const selected = currency === c;
                            return (
                                <Pressable
                                    key={c}
                                    onPress={() => pickCurrency(c)}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Currency ${c}`}
                                    accessibilityState={{ selected }}
                                    style={{
                                        minWidth: 56,
                                        alignItems: 'center',
                                        paddingHorizontal: space[4],
                                        paddingVertical: space[3],
                                        borderRadius: radius.pill,
                                        borderWidth: 1,
                                        borderColor: selected ? colors.accent : colors.divider,
                                        backgroundColor: selected ? colors.accent : colors.surfaceElevated,
                                    }}
                                >
                                    <Text variant="label" weight="semibold" tone={selected ? 'onAccent' : 'secondary'}>
                                        {c}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </Card>

                <SectionHeader title="Notifications" />
                <Card padded={false}>
                    <Row
                        icon="notifications-outline"
                        label="Service reminders"
                        right={
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={onToggleNotifications}
                                trackColor={{ true: colors.accent, false: colors.divider }}
                                thumbColor={colors.surface}
                            />
                        }
                    />
                    <Divider />
                    <Row
                        icon="location-outline"
                        label="Fuel-up prompts at stations"
                        right={
                            <Switch
                                value={locationPromptEnabled}
                                onValueChange={onToggleLocation}
                                trackColor={{ true: colors.accent, false: colors.divider }}
                                thumbColor={colors.surface}
                            />
                        }
                    />
                </Card>

                <SectionHeader title="Data" />
                <Card padded={false}>
                    <Row icon="download-outline" label="Export CSV" onPress={() => router.push('/modal/export')} />
                    <Divider />
                    <Row icon="trash-outline" label="Wipe all data" tone="danger" onPress={wipeAll} />
                </Card>

                <SectionHeader title="About" />
                <Card style={{ padding: space[5] }}>
                    <Text variant="body" weight="semibold">
                        Fuelio
                    </Text>
                    <Text variant="caption" tone="secondary" style={{ marginTop: space[1] }}>
                        Drive smarter. Spend less. Maintain better.
                    </Text>
                    <View style={{ height: 1, backgroundColor: colors.divider, marginVertical: space[4] }} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
                        <Ionicons name="shield-checkmark-outline" size={15} color={colors.textMuted} />
                        <Text variant="caption" tone="muted">
                            Version 1.0.0 · 100% offline · No ads · No tracking
                        </Text>
                    </View>
                </Card>
            </ScrollView>
        </View>
    );
}
