import { Button } from '@/src/components/primitives/Button';
import { Card } from '@/src/components/primitives/Card';
import { Text } from '@/src/components/primitives/Text';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useReduceMotion } from '@/src/hooks/useReduceMotion';
import { useFuelStore } from '@/src/store/fuel.store';
import { useServiceStore } from '@/src/store/service.store';
import { useVehicleStore } from '@/src/store/vehicle.store';
import { useTheme } from '@/src/theme/ThemeProvider';
import { radius, space } from '@/src/theme/tokens';
import { fuelEntriesToCsv, serviceEntriesToCsv, vehiclesToCsv } from '@/src/utils/csv';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type DatasetKey = 'vehicles' | 'fuel' | 'services';

// UTF-8 byte-order mark so Excel opens the file in the right encoding instead of
// mangling accented characters and currency symbols.
const BOM = '﻿';

/**
 * Write a CSV string to a cache file (BOM-prefixed for Excel) and open the
 * system share sheet. The cache directory is the right home for transient
 * exports: the OS reclaims it automatically and no extra permissions are needed.
 */
async function shareCsv(filename: string, csv: string): Promise<void> {
    const available = await Sharing.isAvailableAsync();
    if (!available) {
        throw new Error('unavailable');
    }
    const file = new File(Paths.cache, filename);
    if (file.exists) {
        file.delete();
    }
    file.write(BOM + csv);
    await Sharing.shareAsync(file.uri, {
        mimeType: 'text/csv',
        UTI: 'public.comma-separated-values-text',
        dialogTitle: 'Export Fuelio data',
    });
}

const ExportCard = React.memo(function ExportCard({
    icon,
    title,
    count,
    unit,
    busy,
    onExport,
    onCopy,
}: {
    icon: IconName;
    title: string;
    count: number;
    unit: string;
    busy: boolean;
    onExport: () => void;
    onCopy: () => void;
}) {
    const { colors } = useTheme();
    return (
        <Card tone="elevated" style={{ padding: space[5] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[4] }}>
                <View
                    style={{
                        width: 52,
                        height: 52,
                        borderRadius: radius.lg,
                        backgroundColor: colors.accentMuted,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Ionicons name={icon} size={24} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text variant="micro" tone="muted">{unit.toUpperCase()}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space[2], marginTop: 1 }}>
                        <Text variant="title" tone="accent" numberOfLines={1}>{count}</Text>
                        <Text variant="body" weight="semibold" tone="secondary">{title}</Text>
                    </View>
                </View>
            </View>

            <View style={{ flexDirection: 'row', gap: space[3], marginTop: space[5] }}>
                <Button
                    label="Export"
                    onPress={onExport}
                    loading={busy}
                    leftIcon={<Ionicons name="share-outline" size={18} color={colors.textOnAccent} />}
                    style={{ flex: 1 }}
                />
                <Button
                    label="Copy"
                    onPress={onCopy}
                    variant="secondary"
                    style={{ flex: 1 }}
                />
            </View>
        </Card>
    );
});

export default function ExportModal() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const reduceMotion = useReduceMotion();
    const vehicles = useVehicleStore((s) => s.vehicles);
    const fuel = useFuelStore((s) => s.entries);
    const services = useServiceStore((s) => s.entries);
    const haptic = useHaptics();

    const [busy, setBusy] = useState<DatasetKey | null>(null);

    const enter = (delay: number) => (reduceMotion ? undefined : FadeInDown.duration(360).delay(delay));

    const handleExport = useCallback(
        async (key: DatasetKey, filename: string, csv: string, label: string) => {
            if (busy) return;
            setBusy(key);
            try {
                await shareCsv(filename, csv);
                haptic('success');
            } catch {
                // Share unavailable or dismissed before completion: fall back to copy
                // so the export is never a dead end.
                try {
                    await Clipboard.setStringAsync(csv);
                    Alert.alert('Sharing unavailable', `${label} CSV copied to your clipboard instead.`);
                } catch {
                    Alert.alert('Export failed', `Could not export ${label.toLowerCase()} right now.`);
                }
            } finally {
                setBusy(null);
            }
        },
        [busy, haptic],
    );

    const handleCopy = useCallback(
        async (csv: string, label: string) => {
            try {
                await Clipboard.setStringAsync(csv);
                haptic('success');
                Alert.alert('Copied', `${label} CSV copied to your clipboard.`);
            } catch {
                Alert.alert('Copy failed', `Could not copy ${label.toLowerCase()} right now.`);
            }
        },
        [haptic],
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    paddingHorizontal: space[5],
                    paddingTop: space[3],
                    paddingBottom: space[5],
                }}
            >
                <View style={{ flex: 1, paddingRight: space[4] }}>
                    <Text variant="micro" tone="secondary">EXPORT</Text>
                    <Text variant="title" style={{ marginTop: space[1] }}>
                        Your data, to go
                    </Text>
                    <Text variant="caption" tone="muted" style={{ marginTop: space[2] }}>
                        Spreadsheet-ready CSV, shared on your terms
                    </Text>
                </View>
                <Pressable
                    onPress={() => router.back()}
                    accessibilityRole="button"
                    accessibilityLabel="Close export"
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
                contentContainerStyle={{
                    padding: space[5],
                    paddingTop: 0,
                    gap: space[3],
                    paddingBottom: insets.bottom + space[8],
                }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={enter(0)}>
                    <ExportCard
                        icon="car-sport-outline"
                        title={vehicles.length === 1 ? 'vehicle' : 'vehicles'}
                        count={vehicles.length}
                        unit="Garage"
                        busy={busy === 'vehicles'}
                        onExport={() => handleExport('vehicles', 'fuelio-vehicles.csv', vehiclesToCsv(vehicles), 'Vehicles')}
                        onCopy={() => handleCopy(vehiclesToCsv(vehicles), 'Vehicles')}
                    />
                </Animated.View>

                <Animated.View entering={enter(70)}>
                    <ExportCard
                        icon="speedometer-outline"
                        title={fuel.length === 1 ? 'entry' : 'entries'}
                        count={fuel.length}
                        unit="Fuel history"
                        busy={busy === 'fuel'}
                        onExport={() => handleExport('fuel', 'fuelio-fuel.csv', fuelEntriesToCsv(fuel), 'Fuel')}
                        onCopy={() => handleCopy(fuelEntriesToCsv(fuel), 'Fuel')}
                    />
                </Animated.View>

                <Animated.View entering={enter(140)}>
                    <ExportCard
                        icon="construct-outline"
                        title={services.length === 1 ? 'entry' : 'entries'}
                        count={services.length}
                        unit="Service history"
                        busy={busy === 'services'}
                        onExport={() => handleExport('services', 'fuelio-services.csv', serviceEntriesToCsv(services), 'Services')}
                        onCopy={() => handleCopy(serviceEntriesToCsv(services), 'Services')}
                    />
                </Animated.View>

                <Animated.View entering={enter(210)} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space[2], paddingHorizontal: space[2], marginTop: space[2] }}>
                    <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} style={{ marginTop: 2 }} />
                    <Text variant="caption" tone="muted" style={{ flex: 1 }}>
                        Files are written on your device and shared only where you choose. Nothing leaves Fuelio on its own.
                    </Text>
                </Animated.View>
            </ScrollView>
        </View>
    );
}
