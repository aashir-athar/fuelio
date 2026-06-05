// Lever: Peak-end + progress framing — a calm period summary up top anchors the
// session, then honest trend tiles reward genuine efficiency gains without spin.
import { BarChart } from '@/src/components/charts/BarChart';
import { LineChart } from '@/src/components/charts/LineChart';
import { Card } from '@/src/components/primitives/Card';
import { EmptyState } from '@/src/components/primitives/EmptyState';
import { SectionHeader } from '@/src/components/primitives/SectionHeader';
import { SegmentedControl } from '@/src/components/primitives/SegmentedControl';
import { StatTile } from '@/src/components/primitives/StatTile';
import { Text } from '@/src/components/primitives/Text';
import { IMAGES } from '@/src/constants/images';
import { useActiveVehicle } from '@/src/hooks/useActiveVehicle';
import { useVehicleStats } from '@/src/hooks/useVehicleStats';
import { useSettingsStore } from '@/src/store/settings.store';
import { useTheme } from '@/src/theme/ThemeProvider';
import { radius, space } from '@/src/theme/tokens';
import { formatCurrency, formatDistance, formatEfficiency, formatNumber } from '@/src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Range = 'month' | 'quarter' | 'year' | 'all';

const TREND_LABEL: Record<'improving' | 'declining' | 'stable', string> = {
    improving: 'Improving',
    declining: 'Declining',
    stable: 'Steady',
};

export default function AnalyticsScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const vehicle = useActiveVehicle();
    const stats = useVehicleStats(vehicle?.id);
    const currency = useSettingsStore((s) => s.currency);
    const distanceUnit = useSettingsStore((s) => s.distanceUnit);
    const [range, setRange] = useState<Range>('month');
    // Captured once at mount (lazy init) so range filtering stays pure during render.
    const [now] = useState(() => Date.now());

    const filtered = useMemo(() => {
        if (!stats) return [];
        const day = 86400000;
        const cutoff =
            range === 'month' ? now - 30 * day :
                range === 'quarter' ? now - 90 * day :
                    range === 'year' ? now - 365 * day :
                        0;
        return stats.entries.filter((e) => e.date >= cutoff);
    }, [stats, range, now]);

    const efficiencyPoints = useMemo(
        () => filtered
            .filter((e) => e.isEfficiencyValid)
            .map((e) => ({
                label: new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                value: e.efficiency,
            })),
        [filtered],
    );

    const costPoints = useMemo(() => {
        const map = new Map<string, number>();
        for (const e of filtered) {
            const key = new Date(e.date).toLocaleDateString(undefined, { month: 'short' });
            map.set(key, (map.get(key) ?? 0) + e.totalCost);
        }
        return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
    }, [filtered]);

    // Period aggregates — memoized so they are not recomputed on every render
    // (theme toggles, unrelated state). Cost-per-km only counts entries that have
    // an associated distance; the first-ever entry has distanceDriven=0 (no prior
    // odometer baseline) and would otherwise inflate cost-per-km by up to 70%.
    const period = useMemo(() => {
        const totalCost = filtered.reduce((acc, e) => acc + e.totalCost, 0);
        const totalDist = filtered.reduce((acc, e) => acc + e.distanceDriven, 0);
        const costable = filtered.filter((e) => e.distanceDriven > 0);
        const costableAmount = costable.reduce((acc, e) => acc + e.totalCost, 0);
        const costableDist = costable.reduce((acc, e) => acc + e.distanceDriven, 0);
        const costPerKm = costableDist > 0 ? costableAmount / costableDist : 0;
        return { totalCost, totalDist, costPerKm };
    }, [filtered]);

    if (!vehicle) return null;

    const s = stats?.stats;

    const trend = s?.efficiencyTrend ?? 'stable';
    const trendIcon =
        trend === 'improving' ? 'trending-up' :
            trend === 'declining' ? 'trending-down' : 'remove';
    const trendTone: 'success' | 'warning' | 'primary' =
        trend === 'improving' ? 'success' :
            trend === 'declining' ? 'warning' : 'primary';
    const trendColor =
        trend === 'improving' ? colors.success :
            trend === 'declining' ? colors.warning : colors.textSecondary;

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{
                paddingTop: insets.top + space[3],
                paddingBottom: insets.bottom + 120,
                paddingHorizontal: space[5],
            }}
            showsVerticalScrollIndicator={false}
        >
            <Text variant="caption" tone="secondary">Analytics</Text>
            <Text variant="title" style={{ marginTop: 2, marginBottom: space[4] }}>Your trends</Text>

            <SegmentedControl
                options={[
                    { value: 'month', label: '30d' },
                    { value: 'quarter', label: '90d' },
                    { value: 'year', label: '1y' },
                    { value: 'all', label: 'All' },
                ]}
                value={range}
                onChange={setRange}
            />

            {filtered.length === 0 ? (
                <View style={{ marginTop: space[6] }}>
                    <EmptyState
                        image={IMAGES.analysis}
                        title="Not enough data yet"
                        subtitle="Log a few fill-ups to unlock beautiful trends and spending insights."
                    />
                </View>
            ) : (
                <>
                    {/* Period overview */}
                    <View style={{ flexDirection: 'row', gap: space[3], marginTop: space[4] }}>
                        <StatTile
                            label="Spent"
                            value={formatCurrency(period.totalCost, currency)}
                            tone="accent"
                            compact
                            style={{ flex: 1 }}
                        />
                        <StatTile
                            label="Distance"
                            value={formatDistance(period.totalDist, distanceUnit)}
                            compact
                            style={{ flex: 1 }}
                        />
                        <StatTile
                            label="Cost/km"
                            value={formatCurrency(period.costPerKm, currency, 2)}
                            tone="warning"
                            compact
                            style={{ flex: 1 }}
                        />
                    </View>

                    {/* Efficiency chart */}
                    <SectionHeader title="Efficiency over time" />
                    <Card elevated>
                        <LineChart
                            data={efficiencyPoints}
                            height={180}
                            formatValue={(v) => formatEfficiency(v, distanceUnit)}
                        />
                    </Card>

                    {/* Monthly spend chart */}
                    <SectionHeader title="Monthly spend" />
                    <Card elevated>
                        <BarChart
                            data={costPoints}
                            height={160}
                            formatValue={(v) => formatCurrency(v, currency)}
                        />
                    </Card>

                    {/* Efficiency deep-dive */}
                    <SectionHeader title="Efficiency" />
                    <View style={{ flexDirection: 'row', gap: space[3] }}>
                        <StatTile
                            label="Avg economy"
                            value={s ? formatEfficiency(s.averageEfficiency, distanceUnit) : '—'}
                            caption="distance-weighted"
                            tone="accent"
                            compact
                            style={{ flex: 1 }}
                        />
                        <StatTile
                            label="Last 5 fills"
                            value={s ? formatEfficiency(s.recentAverageEfficiency, distanceUnit) : '—'}
                            tone="success"
                            compact
                            style={{ flex: 1 }}
                        />
                    </View>

                    {/* Trend — honest direction read, no fabricated precision */}
                    <Card style={{ marginTop: space[3] }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[3] }}>
                            <View
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: radius.md,
                                    backgroundColor: colors.surfaceElevated,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Ionicons name={trendIcon} size={22} color={trendColor} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text variant="label" tone="secondary">EFFICIENCY TREND</Text>
                                <Text variant="heading" tone={trendTone} style={{ marginTop: 2 }}>
                                    {TREND_LABEL[trend]}
                                </Text>
                            </View>
                        </View>
                    </Card>

                    {/* Lifetime */}
                    <SectionHeader title="Lifetime" />
                    <View style={{ flexDirection: 'row', gap: space[3] }}>
                        <StatTile
                            label="Best"
                            value={s ? formatEfficiency(s.bestEfficiency, distanceUnit) : '—'}
                            tone="success"
                            compact
                            style={{ flex: 1 }}
                        />
                        <StatTile
                            label="Worst"
                            value={s ? formatEfficiency(s.worstEfficiency, distanceUnit) : '—'}
                            tone="warning"
                            compact
                            style={{ flex: 1 }}
                        />
                    </View>

                    {/* Habits */}
                    <SectionHeader title="Refuel habits" />
                    <View style={{ flexDirection: 'row', gap: space[3] }}>
                        <StatTile
                            label="Avg km/fill"
                            value={s ? formatDistance(s.avgKmBetweenFills, distanceUnit) : '—'}
                            compact
                            style={{ flex: 1 }}
                        />
                        <StatTile
                            label="Avg days/fill"
                            value={s ? `${formatNumber(s.avgDaysBetweenFills, 1)}d` : '—'}
                            compact
                            style={{ flex: 1 }}
                        />
                    </View>

                    {/* Environmental */}
                    <SectionHeader title="Environmental" />
                    <View style={{ flexDirection: 'row', gap: space[3] }}>
                        <StatTile
                            label="Est. CO₂"
                            value={s ? `${formatNumber(s.estimatedCO2kg, 1)} kg` : '—'}
                            tone="danger"
                            compact
                            style={{ flex: 1 }}
                        />
                        <StatTile
                            label="Fills logged"
                            value={s ? `${s.computableEntryCount} / ${s.entryCount}` : '—'}
                            compact
                            style={{ flex: 1 }}
                            caption="computable"
                        />
                    </View>
                </>
            )}
        </ScrollView>
    );
}
