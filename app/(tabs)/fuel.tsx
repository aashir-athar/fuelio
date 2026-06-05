// Lever: progressive disclosure + peak-end. The header answers "what has this cost
// me?" in one figure, the measured-window strip builds trust in the economy number,
// and the log reads newest-first so the most recent fill (the freshest memory) leads.
import { FuelEntryRow } from '@/src/components/cards/FuelEntryRow';
import { Card } from '@/src/components/primitives/Card';
import { EmptyState } from '@/src/components/primitives/EmptyState';
import { Text } from '@/src/components/primitives/Text';
import { AddFuelSheet } from '@/src/components/sheets/AddFuelSheet';
import { IMAGES } from '@/src/constants/images';
import { useActiveVehicle } from '@/src/hooks/useActiveVehicle';
import { useReduceMotion } from '@/src/hooks/useReduceMotion';
import { useVehicleStats } from '@/src/hooks/useVehicleStats';
import { useSettingsStore } from '@/src/store/settings.store';
import { useTheme } from '@/src/theme/ThemeProvider';
import { accentGlow, radius, space } from '@/src/theme/tokens';
import type { ComputedFuelEntry } from '@/src/utils/fuelAlgorithm';
import { formatCurrency, formatEfficiency, formatVolume } from '@/src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FuelScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const reduceMotion = useReduceMotion();

    const vehicle = useActiveVehicle();
    const stats = useVehicleStats(vehicle?.id);

    const currency = useSettingsStore((s) => s.currency);
    const distanceUnit = useSettingsStore((s) => s.distanceUnit);
    const volumeUnit = useSettingsStore((s) => s.volumeUnit);

    const [sheetVisible, setSheetVisible] = useState(false);
    const openSheet = useCallback(() => setSheetVisible(true), []);
    const closeSheet = useCallback(() => setSheetVisible(false), []);

    const entries = useMemo(() => (stats?.entries ?? []).slice().reverse(), [stats]);

    const openEntry = useCallback(
        (id: string) => router.push(`/modal/edit-fuel?id=${id}`),
        [router],
    );

    const renderItem = useCallback(
        ({ item }: { item: ComputedFuelEntry }) => (
            <FuelEntryRow entry={item} onPress={() => openEntry(item.id)} />
        ),
        [openEntry],
    );

    const keyExtractor = useCallback((item: ComputedFuelEntry) => item.id, []);

    if (!vehicle) return null;

    const totalCost = stats?.stats.totalCost ?? 0;
    const measured = stats?.stats.computableEntryCount ?? 0;
    const total = stats?.stats.entryCount ?? 0;
    const totalFuel = stats?.stats.totalFuel ?? 0;
    const avgEfficiency = stats?.stats.averageEfficiency ?? 0;

    const header = (
        <View style={{ paddingTop: insets.top + space[3], paddingBottom: space[4] }}>
            <Text variant="label" tone="secondary">FUEL HISTORY</Text>
            <Text variant="display" style={{ marginTop: space[1], marginBottom: space[5] }}>
                {formatCurrency(totalCost, currency)}
            </Text>

            <Card elevated padded={false}>
                <View style={{ flexDirection: 'row', padding: space[5] }}>
                    <SummaryStat label="Fills" value={`${measured}/${total}`} />
                    <ColumnDivider />
                    <SummaryStat label="Fuel" value={formatVolume(totalFuel, volumeUnit)} />
                    <ColumnDivider />
                    <SummaryStat
                        label="Average"
                        value={measured > 0 ? formatEfficiency(avgEfficiency, distanceUnit) : '—'}
                        tone="accent"
                    />
                </View>
                <View style={{ height: 1, backgroundColor: colors.divider, marginHorizontal: space[5] }} />
                <Text variant="micro" tone="muted" style={{ padding: space[4], paddingTop: space[3] }}>
                    {measured > 0
                        ? `Average measured across ${measured} full-tank ${measured === 1 ? 'window' : 'windows'}`
                        : 'Log two back-to-back full tanks to measure economy'}
                </Text>
            </Card>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {entries.length === 0 ? (
                <View
                    style={{
                        flex: 1,
                        paddingHorizontal: space[5],
                        paddingBottom: insets.bottom + 120,
                    }}
                >
                    {header}
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <EmptyState
                            image={IMAGES.fueling}
                            title="No fills logged"
                            subtitle="Add your first fill-up and we will start tracking efficiency, cost per kilometre, and more."
                            ctaLabel="Log first fuel"
                            onCta={openSheet}
                        />
                    </View>
                </View>
            ) : (
                <FlashList
                    data={entries}
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    ListHeaderComponent={header}
                    contentContainerStyle={{
                        paddingHorizontal: space[5],
                        paddingBottom: insets.bottom + 120,
                    }}
                    ItemSeparatorComponent={ItemSeparator}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <Animated.View
                entering={reduceMotion ? undefined : FadeInDown.duration(320).delay(120)}
                style={{
                    position: 'absolute',
                    right: space[5],
                    bottom: insets.bottom + 90,
                }}
            >
                <Pressable
                    onPress={openSheet}
                    accessibilityRole="button"
                    accessibilityLabel="Add fuel entry"
                    accessibilityHint="Opens the fuel entry sheet"
                    style={({ pressed }) => ([
                        {
                            width: 60,
                            height: 60,
                            borderRadius: radius.pill,
                            backgroundColor: colors.accent,
                            alignItems: 'center',
                            justifyContent: 'center',
                            transform: [{ scale: pressed ? 0.94 : 1 }],
                        },
                        accentGlow(colors.accent),
                    ])}
                >
                    <Ionicons name="add" size={32} color={colors.textOnAccent} />
                </Pressable>
            </Animated.View>

            <AddFuelSheet visible={sheetVisible} onClose={closeSheet} />
        </View>
    );
}

const ItemSeparator = React.memo(function ItemSeparator() {
    const { colors } = useTheme();
    return (
        <View style={{ height: 1, backgroundColor: colors.divider, marginHorizontal: space[4] }} />
    );
});

interface SummaryStatProps {
    label: string;
    value: string;
    tone?: 'primary' | 'accent';
}

const SummaryStat = React.memo(function SummaryStat({ label, value, tone = 'primary' }: SummaryStatProps) {
    return (
        <View style={{ flex: 1 }}>
            <Text variant="micro" tone="muted">{label.toUpperCase()}</Text>
            <Text
                variant="heading"
                tone={tone === 'accent' ? 'accent' : 'primary'}
                numberOfLines={1}
                style={{ marginTop: space[1] }}
            >
                {value}
            </Text>
        </View>
    );
});

const ColumnDivider = React.memo(function ColumnDivider() {
    const { colors } = useTheme();
    return (
        <View style={{ width: 1, backgroundColor: colors.divider, marginHorizontal: space[4], alignSelf: 'stretch' }} />
    );
});
