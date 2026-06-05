import { Card } from '@/src/components/primitives/Card';
import { SegmentedControl } from '@/src/components/primitives/SegmentedControl';
import { Text } from '@/src/components/primitives/Text';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useReduceMotion } from '@/src/hooks/useReduceMotion';
import { disableStationDetection, enableStationDetection } from '@/src/services/location';
import { requestNotificationPermission } from '@/src/services/notifications';
import { useFuelStore } from '@/src/store/fuel.store';
import { useServiceStore } from '@/src/store/service.store';
import { useSettingsStore } from '@/src/store/settings.store';
import { useVehicleStore } from '@/src/store/vehicle.store';
import { useTheme } from '@/src/theme/ThemeProvider';
import { accentGlow, radius, space } from '@/src/theme/tokens';
import type { Currency } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Alert, Pressable, ScrollView, Switch, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const CURRENCIES: readonly Currency[] = ['USD', 'EUR', 'GBP', 'PKR', 'AED', 'SAR', 'INR'];

/** A settings row with a leading lime icon coin, label, and a trailing control or chevron. */
const Row = React.memo(function Row({
    icon,
    label,
    sub,
    right,
    onPress,
    tone = 'default',
}: {
    icon: IconName;
    label: string;
    sub?: string;
    right?: React.ReactNode;
    onPress?: () => void;
    tone?: 'default' | 'danger';
}) {
    const { colors } = useTheme();
    const isDanger = tone === 'danger';
    const labelColor = isDanger ? colors.danger : colors.textPrimary;
    const coinBg = isDanger ? colors.accentMuted : colors.accentMuted;
    const iconColor = isDanger ? colors.danger : colors.accent;

    const content = (
        <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[4], flex: 1 }}>
                <View
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: radius.md,
                        backgroundColor: isDanger ? colors.accentSoft : coinBg,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Ionicons name={icon} size={21} color={iconColor} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text variant="body" weight="semibold" style={{ color: labelColor }}>
                        {label}
                    </Text>
                    {sub ? (
                        <Text variant="caption" tone="muted" style={{ marginTop: 1 }}>
                            {sub}
                        </Text>
                    ) : null}
                </View>
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
                    minHeight: 64,
                    paddingVertical: space[3],
                    paddingHorizontal: space[5],
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
                minHeight: 64,
                paddingVertical: space[3],
                paddingHorizontal: space[5],
                backgroundColor: pressed ? colors.surface : 'transparent',
            })}
        >
            {content}
        </Pressable>
    );
});

const Divider = React.memo(function Divider() {
    const { colors } = useTheme();
    return <View style={{ height: 1, marginLeft: space[5] + 44 + space[4], backgroundColor: colors.divider }} />;
});

const GroupLabel = React.memo(function GroupLabel({ title }: { title: string }) {
    return (
        <Text variant="micro" tone="muted" style={{ marginTop: space[6], marginBottom: space[3], marginLeft: space[1] }}>
            {title.toUpperCase()}
        </Text>
    );
});

export default function SettingsModal() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const haptic = useHaptics();
    const reduceMotion = useReduceMotion();

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

    const enter = (delay: number) => (reduceMotion ? undefined : FadeInDown.duration(360).delay(delay));

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
                        // Stop the opt-in background station watch before resetting the
                        // flag, so it can't keep running after a wipe.
                        void disableStationDetection();
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
                    alignItems: 'flex-start',
                    paddingHorizontal: space[5],
                    paddingTop: insets.top + space[3],
                    paddingBottom: space[5],
                }}
            >
                <View style={{ flex: 1, paddingRight: space[4] }}>
                    <Text variant="micro" tone="secondary">SETTINGS</Text>
                    <Text variant="title" style={{ marginTop: space[1] }}>
                        Your setup
                    </Text>
                    <Text variant="caption" tone="muted" style={{ marginTop: space[2] }}>
                        Tune Fuelio to the way you drive
                    </Text>
                </View>
                <Pressable
                    onPress={() => router.back()}
                    accessibilityRole="button"
                    accessibilityLabel="Close settings"
                    hitSlop={8}
                    style={{
                        width: 52,
                        height: 52,
                        borderRadius: 26,
                        backgroundColor: colors.surfaceElevated,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Ionicons name="close" size={24} color={colors.textPrimary} />
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: space[5], paddingBottom: insets.bottom + space[8] }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={enter(0)}>
                    <GroupLabel title="Appearance" />
                    <Card tone="elevated" style={{ padding: space[4] }}>
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
                </Animated.View>

                <Animated.View entering={enter(70)}>
                    <GroupLabel title="Units" />
                    <Card tone="elevated" padded={false} style={{ paddingVertical: space[2] }}>
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
                </Animated.View>

                <Animated.View entering={enter(140)}>
                    <GroupLabel title="Currency" />
                    <Card tone="elevated" style={{ padding: space[4] }}>
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
                                        style={({ pressed }) => ({
                                            minWidth: 60,
                                            alignItems: 'center',
                                            paddingHorizontal: space[4],
                                            paddingVertical: space[3],
                                            borderRadius: radius.pill,
                                            borderWidth: 1,
                                            borderColor: selected ? colors.accent : colors.divider,
                                            backgroundColor: selected ? colors.accent : colors.surface,
                                            transform: [{ scale: pressed ? 0.96 : 1 }],
                                        })}
                                    >
                                        <Text variant="label" weight="semibold" tone={selected ? 'onAccent' : 'secondary'}>
                                            {c}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </Card>
                </Animated.View>

                <Animated.View entering={enter(210)}>
                    <GroupLabel title="Notifications" />
                    <Card tone="elevated" padded={false} style={{ paddingVertical: space[2] }}>
                        <Row
                            icon="notifications-outline"
                            label="Service reminders"
                            sub="Get nudged before maintenance is due"
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
                            label="Station prompts"
                            sub="Offer to log when you stop to fill up"
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
                </Animated.View>

                <Animated.View entering={enter(280)}>
                    <GroupLabel title="Data" />
                    <Card tone="elevated" padded={false} style={{ paddingVertical: space[2] }}>
                        <Row icon="download-outline" label="Export CSV" sub="Vehicles, fuel and service history" onPress={() => router.push('/modal/export')} />
                        <Divider />
                        <Row icon="trash-outline" label="Wipe all data" sub="Erase everything on this device" tone="danger" onPress={wipeAll} />
                    </Card>
                </Animated.View>

                <Animated.View entering={enter(350)}>
                    <GroupLabel title="About" />
                    <Card tone="lime" style={[{ overflow: 'hidden' }, accentGlow(colors.accent)]}>
                        <Text variant="micro" tone="onAccent" style={{ opacity: 0.65 }}>FUELIO</Text>
                        <Text variant="heading" tone="onAccent" style={{ marginTop: space[2] }}>
                            Drive smarter. Spend less.
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space[2], marginTop: space[4] }}>
                            <Ionicons name="shield-checkmark" size={16} color={colors.textOnAccent} style={{ marginTop: 2, opacity: 0.75 }} />
                            <Text variant="caption" tone="onAccent" style={{ flex: 1, opacity: 0.8 }}>
                                Private by design. No ads, no accounts, no analytics. Optional location and reminders stay on your device.
                            </Text>
                        </View>
                    </Card>
                    <Text variant="micro" tone="muted" style={{ marginTop: space[4], textAlign: 'center' }}>
                        {`Fuelio v${Constants.expoConfig?.version ?? '2.0.0'}`}
                    </Text>
                </Animated.View>
            </ScrollView>
        </View>
    );
}
