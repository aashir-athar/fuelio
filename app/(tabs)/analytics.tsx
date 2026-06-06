// Lever: Peak-end + progress framing — a bold lime economy hero anchors the session,
// then honest divided trend cards reward genuine efficiency gains without spin.
import { BarChart } from '@/src/components/charts/BarChart';
import { LineChart } from '@/src/components/charts/LineChart';
import { Card } from '@/src/components/primitives/Card';
import { EmptyState } from '@/src/components/primitives/EmptyState';
import { SegmentedControl } from '@/src/components/primitives/SegmentedControl';
import { Skeleton } from '@/src/components/primitives/Skeleton';
import { Text } from '@/src/components/primitives/Text';
import { IMAGES } from '@/src/constants/images';
import { useActiveVehicle } from '@/src/hooks/useActiveVehicle';
import { usePartialEconomyEstimate } from '@/src/hooks/usePartialEstimate';
import { useReduceMotion } from '@/src/hooks/useReduceMotion';
import { useVehicleStats } from '@/src/hooks/useVehicleStats';
import { useSettingsStore } from '@/src/store/settings.store';
import { useTheme } from '@/src/theme/ThemeProvider';
import { accentGlow, fontFamily, radius, space } from '@/src/theme/tokens';
import { formatCurrency, formatDistance, formatEfficiency, formatNumber } from '@/src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
    const reduceMotion = useReduceMotion();
    const vehicle = useActiveVehicle();
    const stats = useVehicleStats(vehicle?.id);
    const partialEstimate = usePartialEconomyEstimate(vehicle?.id);
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
    const trendColor =
        trend === 'improving' ? colors.success :
            trend === 'declining' ? colors.warning : colors.textSecondary;

    // Hero economy split into number + unit so the figure can run huge.
    const avgEff = s?.averageEfficiency ?? 0;
    const heroStr = avgEff > 0 ? formatEfficiency(avgEff, distanceUnit) : null;
    const heroParts = heroStr ? heroStr.split(' ') : null;
    const heroNumber = heroParts ? heroParts[0] : '—';
    const heroUnit = heroParts ? heroParts.slice(1).join(' ') : 'no full tank yet';
    // A single window labeled "Steady" is an unearned claim — require >= 3 measured windows.
    const showTrend = !!heroStr && (s?.computableEntryCount ?? 0) >= 3;

    const enter = (delay: number) => (reduceMotion ? undefined : FadeInDown.duration(380).delay(delay));

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{
                paddingTop: insets.top + space[4],
                paddingBottom: insets.bottom + 150,
                paddingHorizontal: space[5],
            }}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={{ marginBottom: space[6] }}>
                <Text variant="micro" tone="secondary">ANALYTICS</Text>
                <Text variant="title" style={{ marginTop: space[1] }}>Your trends</Text>
            </View>

            {/* Economy hero — the lime star */}
            <Animated.View entering={enter(0)}>
                <Card tone="lime" style={[{ overflow: 'hidden' }, accentGlow(colors.accent)]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Text variant="micro" tone="onAccent" style={{ opacity: 0.65 }}>AVERAGE ECONOMY</Text>
                        {showTrend ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.scrim, paddingHorizontal: space[3], paddingVertical: 5, borderRadius: radius.pill }}>
                                <Ionicons name={trendIcon} size={13} color={colors.accent} />
                                <Text variant="micro" tone="accent" weight="semibold">{TREND_LABEL[trend]}</Text>
                            </View>
                        ) : null}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space[2], marginTop: space[3] }}>
                        <Text numberOfLines={1} style={{ fontFamily: fontFamily.display, fontSize: 72, lineHeight: 90, letterSpacing: -2, color: colors.textOnAccent }}>
                            {heroNumber}
                        </Text>
                        <Text variant="bodyLg" tone="onAccent" weight="semibold" style={{ marginBottom: space[3], opacity: 0.8 }}>
                            {heroUnit}
                        </Text>
                    </View>
                </Card>
            </Animated.View>

            {/* Range picker */}
            <Animated.View entering={enter(70)} style={{ marginTop: space[3] }}>
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
            </Animated.View>

            {s && s.computableEntryCount === 0 && partialEstimate ? (
                <Animated.View entering={enter(120)} style={{ marginTop: space[3] }}>
                    <Card tone="elevated" style={{ gap: space[2] }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text variant="micro" tone="muted">ESTIMATED ECONOMY</Text>
                            <View style={{ paddingHorizontal: space[3], paddingVertical: 3, borderRadius: radius.pill, backgroundColor: colors.accentSoft }}>
                                <Text variant="micro" tone="accent" weight="semibold">
                                    {`${partialEstimate.confidenceLabel.toUpperCase()} CONFIDENCE`}
                                </Text>
                            </View>
                        </View>
                        <Text variant="display" tone="accent">
                            {formatEfficiency(partialEstimate.economyCentral, distanceUnit)}
                        </Text>
                        <Text variant="caption" tone="secondary">
                            {`Range ${formatNumber(partialEstimate.economyMin, 1)}–${formatEfficiency(partialEstimate.economyMax, distanceUnit)} · tightens with every km`}
                        </Text>
                        <Text variant="caption" tone="muted">
                            Estimated from partial fills. Log one full tank for an exact number.
                        </Text>
                    </Card>
                </Animated.View>
            ) : null}

            {filtered.length === 0 ? (
                <View style={{ marginTop: space[7] }}>
                    <EmptyState
                        image={IMAGES.analysis}
                        title="Not enough data yet"
                        subtitle="Log a few fill-ups to unlock beautiful trends and spending insights."
                    />
                </View>
            ) : (
                <>
                    {/* Period overview — divided stat card, lime highlight */}
                    <Animated.View entering={enter(140)} style={{ marginTop: space[3] }}>
                        <Card tone="elevated">
                            <View style={{ flexDirection: 'row' }}>
                                <StatCol label="Spent" value={formatCurrency(period.totalCost, currency)} colors={colors} />
                                <Divider colors={colors} />
                                <StatCol label="Distance" value={formatDistance(period.totalDist, distanceUnit)} colors={colors} />
                                <Divider colors={colors} />
                                <StatCol label="Cost/km" value={formatCurrency(period.costPerKm, currency, 2)} accent colors={colors} />
                            </View>
                        </Card>
                    </Animated.View>

                    {/* Efficiency chart */}
                    <Label text="EFFICIENCY OVER TIME" />
                    <Animated.View entering={enter(200)}>
                        <Card tone="elevated">
                            <LineChart
                                data={efficiencyPoints}
                                height={180}
                                formatValue={(v) => formatEfficiency(v, distanceUnit)}
                            />
                        </Card>
                    </Animated.View>

                    {/* Monthly spend chart */}
                    <Label text="MONTHLY SPEND" />
                    <Animated.View entering={enter(240)}>
                        <Card tone="elevated">
                            <BarChart
                                data={costPoints}
                                height={160}
                                formatValue={(v) => formatCurrency(v, currency)}
                            />
                        </Card>
                    </Animated.View>

                    {/* Efficiency deep-dive — divided card with lime + success highlights */}
                    <Label text="EFFICIENCY" />
                    <Animated.View entering={enter(280)}>
                        <Card tone="elevated">
                            <View style={{ flexDirection: 'row' }}>
                                <StatCol
                                    label="Avg economy"
                                    value={s ? formatEfficiency(s.averageEfficiency, distanceUnit) : null}
                                    caption="distance-weighted"
                                    accent
                                    colors={colors}
                                />
                                <Divider colors={colors} />
                                <StatCol
                                    label="Last 5 fills"
                                    value={s ? formatEfficiency(s.recentAverageEfficiency, distanceUnit) : null}
                                    tone="success"
                                    colors={colors}
                                />
                            </View>
                        </Card>
                    </Animated.View>

                    {/* Trend — honest direction read, no fabricated precision */}
                    <Animated.View entering={enter(320)} style={{ marginTop: space[3] }}>
                        <Card tone="elevated" style={{ flexDirection: 'row', alignItems: 'center', gap: space[4] }}>
                            <View
                                style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: radius.pill,
                                    backgroundColor: colors.surface,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Ionicons name={trendIcon} size={24} color={trendColor} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text variant="micro" tone="muted">EFFICIENCY TREND</Text>
                                <Text variant="heading" style={{ marginTop: 2, color: trendColor }}>
                                    {TREND_LABEL[trend]}
                                </Text>
                            </View>
                        </Card>
                    </Animated.View>

                    {/* Lifetime — best lime, worst warning */}
                    <Label text="LIFETIME" />
                    <Animated.View entering={enter(360)}>
                        <Card tone="elevated">
                            <View style={{ flexDirection: 'row' }}>
                                <StatCol
                                    label="Best"
                                    value={s ? formatEfficiency(s.bestEfficiency, distanceUnit) : null}
                                    tone="success"
                                    colors={colors}
                                />
                                <Divider colors={colors} />
                                <StatCol
                                    label="Worst"
                                    value={s ? formatEfficiency(s.worstEfficiency, distanceUnit) : null}
                                    tone="warning"
                                    colors={colors}
                                />
                            </View>
                        </Card>
                    </Animated.View>

                    {/* Refuel habits */}
                    <Label text="REFUEL HABITS" />
                    <Animated.View entering={enter(400)}>
                        <Card tone="elevated">
                            <View style={{ flexDirection: 'row' }}>
                                <StatCol
                                    label="Avg km/fill"
                                    value={s ? formatDistance(s.avgKmBetweenFills, distanceUnit) : null}
                                    colors={colors}
                                />
                                <Divider colors={colors} />
                                <StatCol
                                    label="Avg days/fill"
                                    value={s ? `${formatNumber(s.avgDaysBetweenFills, 1)}d` : null}
                                    colors={colors}
                                />
                            </View>
                        </Card>
                    </Animated.View>

                    {/* Environmental */}
                    <Label text="ENVIRONMENTAL" />
                    <Animated.View entering={enter(440)}>
                        <Card tone="elevated">
                            <View style={{ flexDirection: 'row' }}>
                                <StatCol
                                    label="Est. CO₂"
                                    value={s ? `${formatNumber(s.estimatedCO2kg, 1)} kg` : null}
                                    tone="danger"
                                    colors={colors}
                                />
                                <Divider colors={colors} />
                                <StatCol
                                    label="Fills logged"
                                    value={s ? `${s.computableEntryCount} / ${s.entryCount}` : null}
                                    caption="computable"
                                    accent
                                    colors={colors}
                                />
                            </View>
                        </Card>
                    </Animated.View>
                </>
            )}
        </ScrollView>
    );
}

type ThemeColors = ReturnType<typeof useTheme>['colors'];
type StatTone = 'success' | 'warning' | 'danger';

const Label = React.memo(function Label({ text }: { text: string }) {
    return (
        <Text variant="label" tone="secondary" style={{ marginTop: space[7], marginBottom: space[3] }}>
            {text}
        </Text>
    );
});

const StatCol = React.memo(function StatCol({
    label,
    value,
    caption,
    accent,
    tone,
    colors,
}: {
    label: string;
    value: string | null;
    caption?: string;
    accent?: boolean;
    tone?: StatTone;
    colors: ThemeColors;
}) {
    const valueColor =
        accent ? colors.accent :
            tone === 'success' ? colors.success :
                tone === 'warning' ? colors.warning :
                    tone === 'danger' ? colors.danger :
                        colors.textPrimary;
    return (
        <View style={{ flex: 1 }}>
            <Text variant="micro" tone="muted">{label.toUpperCase()}</Text>
            {value === null ? (
                <Skeleton width="70%" height={20} style={{ marginTop: space[2] }} />
            ) : (
                <Text variant="heading" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5} style={{ marginTop: space[1], fontSize: 20, lineHeight: 26, color: valueColor }}>{value}</Text>
            )}
            {caption ? <Text variant="micro" tone="muted" style={{ marginTop: space[1] }}>{caption}</Text> : null}
        </View>
    );
});

const Divider = React.memo(function Divider({ colors }: { colors: ThemeColors }) {
    return <View style={{ width: 1, backgroundColor: colors.divider, marginHorizontal: space[3], alignSelf: 'stretch' }} />;
});
