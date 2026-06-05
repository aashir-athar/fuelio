// Lever: peak-end + progressive disclosure. The screen opens on the single number
// that answers "what has fuel cost me?" rendered huge and confident, the divided
// stat card builds trust in the economy figure (and shows how much of the log is
// measured), and the list reads newest-first so the freshest fill leads the recall.
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
import { accentGlow, fontFamily, radius, space } from '@/src/theme/tokens';
import type { ComputedFuelEntry } from '@/src/utils/fuelAlgorithm';
import { formatCurrency, formatEfficiency, formatVolume } from '@/src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ThemeColors = ReturnType<typeof useTheme>['colors'];

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

    // Share of the log that has a measured full-tank economy window behind it.
    const measuredRatio = total > 0 ? Math.min(1, measured / total) : 0;
    const measuredPct = Math.round(measuredRatio * 100);

    const enter = (delay: number) =>
        reduceMotion ? undefined : FadeInDown.duration(360).delay(delay);

    const header = (
        <View style={{ paddingTop: insets.top + space[4], paddingBottom: space[5] }}>
            <Animated.View entering={enter(0)}>
                <Text variant="micro" tone="secondary">TOTAL FUEL SPEND</Text>
                <Text
                    style={{
                        fontFamily: fontFamily.display,
                        fontSize: 64,
                        lineHeight: 66,
                        letterSpacing: -2,
                        color: colors.textPrimary,
                        marginTop: space[1],
                    }}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                >
                    {formatCurrency(totalCost, currency)}
                </Text>
            </Animated.View>

            {/* Signature divided stat card: Fills | Fuel | Average, key number in lime,
                with a thin lime measured-progress bar and a small caption. */}
            <Animated.View entering={enter(70)} style={{ marginTop: space[5] }}>
                <Card tone="elevated" padded={false}>
                    <View style={{ flexDirection: 'row', padding: space[5], paddingBottom: space[4] }}>
                        <SummaryStat label="Fills" value={`${measured}/${total}`} colors={colors} />
                        <ColumnDivider colors={colors} />
                        <SummaryStat label="Fuel" value={formatVolume(totalFuel, volumeUnit)} colors={colors} />
                        <ColumnDivider colors={colors} />
                        <SummaryStat
                            label="Average"
                            value={measured > 0 ? formatEfficiency(avgEfficiency, distanceUnit) : '—'}
                            tone="accent"
                            colors={colors}
                        />
                    </View>

                    <View style={{ paddingHorizontal: space[5] }}>
                        <View
                            style={{
                                height: 6,
                                borderRadius: radius.pill,
                                backgroundColor: colors.divider,
                                overflow: 'hidden',
                            }}
                        >
                            <View
                                style={{
                                    width: `${Math.max(measuredPct, measured > 0 ? 6 : 0)}%`,
                                    height: '100%',
                                    borderRadius: radius.pill,
                                    backgroundColor: colors.accent,
                                }}
                            />
                        </View>
                        <Text variant="micro" tone="muted" style={{ marginTop: space[3], paddingBottom: space[5] }}>
                            {measured > 0
                                ? `${measuredPct}% measured across ${measured} full-tank ${measured === 1 ? 'window' : 'windows'}`
                                : 'Log two back-to-back full tanks to measure economy'}
                        </Text>
                    </View>
                </Card>
            </Animated.View>
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
    return <View style={{ height: space[3] }} />;
});

interface SummaryStatProps {
    label: string;
    value: string;
    tone?: 'primary' | 'accent';
    colors: ThemeColors;
}

const SummaryStat = React.memo(function SummaryStat({ label, value, tone = 'primary' }: SummaryStatProps) {
    return (
        <View style={{ flex: 1 }}>
            <Text variant="micro" tone="muted">{label.toUpperCase()}</Text>
            <Text
                variant="heading"
                tone={tone === 'accent' ? 'accent' : 'primary'}
                numberOfLines={1}
                style={{ marginTop: space[2] }}
            >
                {value}
            </Text>
        </View>
    );
});

const ColumnDivider = React.memo(function ColumnDivider({ colors }: { colors: ThemeColors }) {
    return (
        <View style={{ width: 1, backgroundColor: colors.divider, marginHorizontal: space[4], alignSelf: 'stretch' }} />
    );
});
