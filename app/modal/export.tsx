import { Button } from '@/src/components/primitives/Button';
import { Card } from '@/src/components/primitives/Card';
import { Text } from '@/src/components/primitives/Text';
import { useHaptics } from '@/src/hooks/useHaptics';
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
    countLabel,
    busy,
    onExport,
    onCopy,
}: {
    icon: IconName;
    title: string;
    countLabel: string;
    busy: boolean;
    onExport: () => void;
    onCopy: () => void;
}) {
    const { colors } = useTheme();
    return (
        <Card padded={false} style={{ padding: space[5] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                <View
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: radius.md,
                        backgroundColor: colors.accentSoft,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Ionicons name={icon} size={22} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text variant="bodyLg" weight="semibold">
                        {title}
                    </Text>
                    <Text variant="caption" tone="secondary" style={{ marginTop: space[1] }}>
                        {countLabel}
                    </Text>
                </View>
            </View>

            <Button
                label="Export and share"
                onPress={onExport}
                loading={busy}
                leftIcon={<Ionicons name="share-outline" size={18} color={colors.textOnAccent} />}
                style={{ marginTop: space[4] }}
                fullWidth
            />
            <Button
                label="Copy as text"
                onPress={onCopy}
                variant="ghost"
                size="sm"
                style={{ marginTop: space[2] }}
                fullWidth
            />
        </Card>
    );
});

export default function ExportModal() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const vehicles = useVehicleStore((s) => s.vehicles);
    const fuel = useFuelStore((s) => s.entries);
    const services = useServiceStore((s) => s.entries);
    const haptic = useHaptics();

    const [busy, setBusy] = useState<DatasetKey | null>(null);

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
                    alignItems: 'center',
                    paddingHorizontal: space[5],
                    paddingTop: space[3],
                    paddingBottom: space[4],
                }}
            >
                <View>
                    <Text variant="heading">Export data</Text>
                    <Text variant="caption" tone="muted" style={{ marginTop: space[1] }}>
                        Your records as spreadsheet-ready CSV
                    </Text>
                </View>
                <Pressable
                    onPress={() => router.back()}
                    accessibilityRole="button"
                    accessibilityLabel="Close export"
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
                contentContainerStyle={{
                    padding: space[5],
                    gap: space[4],
                    paddingBottom: insets.bottom + space[8],
                }}
                showsVerticalScrollIndicator={false}
            >
                <ExportCard
                    icon="car-sport-outline"
                    title="Vehicles"
                    countLabel={`${vehicles.length} ${vehicles.length === 1 ? 'vehicle' : 'vehicles'}`}
                    busy={busy === 'vehicles'}
                    onExport={() => handleExport('vehicles', 'fuelio-vehicles.csv', vehiclesToCsv(vehicles), 'Vehicles')}
                    onCopy={() => handleCopy(vehiclesToCsv(vehicles), 'Vehicles')}
                />

                <ExportCard
                    icon="speedometer-outline"
                    title="Fuel history"
                    countLabel={`${fuel.length} ${fuel.length === 1 ? 'entry' : 'entries'}`}
                    busy={busy === 'fuel'}
                    onExport={() => handleExport('fuel', 'fuelio-fuel.csv', fuelEntriesToCsv(fuel), 'Fuel')}
                    onCopy={() => handleCopy(fuelEntriesToCsv(fuel), 'Fuel')}
                />

                <ExportCard
                    icon="construct-outline"
                    title="Service history"
                    countLabel={`${services.length} ${services.length === 1 ? 'entry' : 'entries'}`}
                    busy={busy === 'services'}
                    onExport={() => handleExport('services', 'fuelio-services.csv', serviceEntriesToCsv(services), 'Services')}
                    onCopy={() => handleCopy(serviceEntriesToCsv(services), 'Services')}
                />

                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space[2], paddingHorizontal: space[1] }}>
                    <Ionicons name="lock-closed-outline" size={14} color={colors.textMuted} style={{ marginTop: 2 }} />
                    <Text variant="caption" tone="muted" style={{ flex: 1 }}>
                        Files are written on your device and shared only where you choose. Nothing leaves Fuelio on its own.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
