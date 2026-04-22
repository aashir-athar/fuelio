import { FuelEntryRow } from '@/src/components/cards/FuelEntryRow';
import { Card } from '@/src/components/primitives/Card';
import { EmptyState } from '@/src/components/primitives/EmptyState';
import { Text } from '@/src/components/primitives/Text';
import { AddFuelSheet } from '@/src/components/sheets/AddFuelSheet';
import { IMAGES } from '@/src/constants/images';
import { useActiveVehicle } from '@/src/hooks/useActiveVehicle';
import { useVehicleStats } from '@/src/hooks/useVehicleStats';
import { useSettingsStore } from '@/src/store/settings.store';
import { useTheme } from '@/src/theme/ThemeProvider';
import { space } from '@/src/theme/tokens';
import { formatCurrency, formatEfficiency } from '@/src/utils/format';
import type { ComputedFuelEntry } from '@/src/utils/fuelAlgorithm';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FuelScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const vehicle = useActiveVehicle();
    const stats = useVehicleStats(vehicle?.id);
    const { currency, distanceUnit } = useSettingsStore();
    const [sheetVisible, setSheetVisible] = useState(false);

    const entries = useMemo(() => (stats?.entries ?? []).slice().reverse(), [stats]);

    const renderItem = useCallback(
        ({ item }: { item: ComputedFuelEntry }) => (
            <FuelEntryRow entry={item} onPress={() => router.push(`/modal/edit-fuel?id=${item.id}`)} />
        ),
        [router],
    );

    const keyExtractor = useCallback((item: ComputedFuelEntry) => item.id, []);

    if (!vehicle) return null;

    const header = (
        <View style={{ paddingTop: insets.top + space[3], paddingBottom: space[3] }}>
            <Text variant="caption" tone="secondary">Fuel history</Text>
            <Text variant="title" style={{ marginTop: 2, marginBottom: space[4] }}>
                {formatCurrency(stats?.stats.totalCost ?? 0, currency)}
            </Text>
            <Card elevated style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1 }}>
                    <Text variant="micro" tone="muted">FILLS</Text>
                    <Text variant="heading">{stats?.stats.computableEntryCount ?? 0}/{stats?.stats.entryCount ?? 0}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text variant="micro" tone="muted">TOTAL FUEL</Text>
                    <Text variant="heading">{stats?.stats.totalFuel.toFixed(0) ?? 0}L</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text variant="micro" tone="muted">AVG</Text>
                    <Text variant="heading" tone="accent">
                        {stats ? formatEfficiency(stats.stats.averageEfficiency, distanceUnit) : '—'}
                    </Text>
                </View>
            </Card>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {entries.length === 0 ? (
                <View style={{ flex: 1, paddingHorizontal: space[5], paddingBottom: insets.bottom + 120 }}>
                    {header}
                    <EmptyState
                        image={IMAGES.fueling}
                        title="No fills yet"
                        subtitle="Log your first fill-up — we'll instantly compute efficiency, cost per kilometer, and more."
                        ctaLabel="Log first fuel"
                        onCta={() => setSheetVisible(true)}
                    />
                </View>
            ) : (
                <FlatList
                    data={entries}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    ListHeaderComponent={header}
                    contentContainerStyle={{ paddingHorizontal: space[5], paddingBottom: insets.bottom + 120 }}
                    ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.divider, marginHorizontal: space[4] }} />}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={7}
                    removeClippedSubviews
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* FAB */}
            <Pressable
                onPress={() => setSheetVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Add fuel entry"
                style={({ pressed }) => ({
                    position: 'absolute',
                    right: space[5],
                    bottom: insets.bottom + 90,
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: colors.accent,
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: [{ scale: pressed ? 0.94 : 1 }],
                    shadowColor: colors.accent,
                    shadowOpacity: 0.45,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 8 },
                    elevation: 10,
                })}
            >
                <Ionicons name="add" size={32} color={colors.textOnAccent} />
            </Pressable>

            <AddFuelSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} />
        </View>
    );
}