import { FuelEntryRow } from '@/src/components/cards/FuelEntryRow';
import { ServiceReminderCard } from '@/src/components/cards/ServiceReminderCard';
import { Card } from '@/src/components/primitives/Card';
import { Skeleton } from '@/src/components/primitives/Skeleton';
import { Text } from '@/src/components/primitives/Text';
import { AddFuelSheet } from '@/src/components/sheets/AddFuelSheet';
import { IMAGES } from '@/src/constants/images';
import { useActiveVehicle } from '@/src/hooks/useActiveVehicle';
import { useReduceMotion } from '@/src/hooks/useReduceMotion';
import { useServiceReminders } from '@/src/hooks/useServiceReminders';
import { useVehicleStats } from '@/src/hooks/useVehicleStats';
import { useSettingsStore } from '@/src/store/settings.store';
import { useUiStore } from '@/src/store/ui.store';
import { useTheme } from '@/src/theme/ThemeProvider';
import { accentGlow, fontFamily, radius, space } from '@/src/theme/tokens';
import type { ComputedFuelEntry } from '@/src/utils/fuelAlgorithm';
import { formatCurrency, formatDistance, formatEfficiency } from '@/src/utils/format';
import { serviceTypeLabel } from '@/src/utils/serviceLabels';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const reduceMotion = useReduceMotion();

  const vehicle = useActiveVehicle();
  const stats = useVehicleStats(vehicle?.id);
  const reminders = useServiceReminders(vehicle?.id);

  const currency = useSettingsStore((s) => s.currency);
  const distanceUnit = useSettingsStore((s) => s.distanceUnit);

  const fuelSheetVisible = useUiStore((s) => s.logFuelOpen);
  const openFuelSheet = useUiStore((s) => s.openLogFuel);
  const closeFuelSheet = useUiStore((s) => s.closeLogFuel);
  const openSettings = useCallback(() => router.push('/modal/settings'), [router]);
  const openEntry = useCallback((id: string) => router.push(`/modal/edit-fuel?id=${id}`), [router]);

  const [greeting] = useState(() => {
    const h = new Date().getHours();
    return h < 12 ? 'GOOD MORNING' : h < 18 ? 'GOOD AFTERNOON' : 'GOOD EVENING';
  });

  if (!vehicle) return null;

  const ready = stats !== null;
  const s = stats?.stats;
  const recent = stats?.entries.slice(-3).reverse() ?? [];
  const upcoming = reminders.slice(0, 2);

  const eff = s?.averageEfficiency ?? 0;
  const effStr = ready && eff > 0 ? formatEfficiency(eff, distanceUnit) : null;
  const effParts = effStr ? effStr.split(' ') : null;
  const effNumber = effParts ? effParts[0] : '—';
  const effUnit = effParts ? effParts.slice(1).join(' ') : 'no full tank yet';

  const trend = s?.efficiencyTrend;
  const trendLabel = trend === 'improving' ? 'Improving' : trend === 'declining' ? 'Declining' : 'Steady';

  const enter = (delay: number) => (reduceMotion ? undefined : FadeInDown.duration(380).delay(delay));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + space[4],
          paddingBottom: insets.bottom + 130,
          paddingHorizontal: space[5],
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space[6] }}>
          <View style={{ flex: 1, paddingRight: space[4] }}>
            <Text variant="micro" tone="secondary">{greeting}</Text>
            <Text variant="title" numberOfLines={1} style={{ marginTop: space[1] }}>{vehicle.nickname}</Text>
          </View>
          <Pressable
            onPress={openSettings}
            accessibilityRole="button"
            accessibilityLabel="Settings"
            hitSlop={8}
            style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* Economy hero — the lime star */}
        <Animated.View entering={enter(0)}>
          <Card tone="lime" style={[{ overflow: 'hidden' }, accentGlow(colors.accent)]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text variant="micro" tone="onAccent" style={{ opacity: 0.65 }}>FUEL ECONOMY</Text>
              {effStr ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(13,17,23,0.12)', paddingHorizontal: space[3], paddingVertical: 5, borderRadius: radius.pill }}>
                  <Ionicons
                    name={trend === 'improving' ? 'trending-up' : trend === 'declining' ? 'trending-down' : 'remove'}
                    size={13}
                    color={colors.textOnAccent}
                  />
                  <Text variant="micro" tone="onAccent" weight="semibold">{trendLabel}</Text>
                </View>
              ) : null}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space[2], marginTop: space[3] }}>
              <Text numberOfLines={1} style={{ fontFamily: fontFamily.display, fontSize: 72, lineHeight: 90, letterSpacing: -2, color: colors.textOnAccent }}>
                {effNumber}
              </Text>
              <Text variant="bodyLg" tone="onAccent" weight="semibold" style={{ marginBottom: space[3], opacity: 0.8 }}>
                {effUnit}
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* Divided stat card */}
        <Animated.View entering={enter(70)} style={{ marginTop: space[3] }}>
          <Card tone="elevated">
            <View style={{ flexDirection: 'row' }}>
              <StatCol label="Spent" value={ready ? formatCurrency(s!.totalCost, currency) : null} colors={colors} />
              <Divider colors={colors} />
              <StatCol label="Distance" value={ready ? formatDistance(s!.totalDistance, distanceUnit) : null} colors={colors} />
              <Divider colors={colors} />
              <StatCol label="CO₂" value={ready ? `${Math.round(s!.estimatedCO2kg)} kg` : null} accent colors={colors} />
            </View>
          </Card>
        </Animated.View>

        {/* Log fuel CTA */}
        <Animated.View entering={enter(140)} style={{ marginTop: space[3] }}>
          <Pressable
            onPress={openFuelSheet}
            accessibilityRole="button"
            accessibilityLabel="Log a fill-up"
            style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.985 : 1 }] })}
          >
            <Card tone="elevated" style={{ flexDirection: 'row', alignItems: 'center', gap: space[4] }}>
              <Image source={IMAGES.fueling} style={{ width: 56, height: 56 }} contentFit="contain" />
              <View style={{ flex: 1 }}>
                <Text variant="heading">Log fuel</Text>
                <Text variant="caption" tone="secondary" style={{ marginTop: 2 }}>Five seconds now, sharper numbers later</Text>
              </View>
              <View style={[{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }, accentGlow(colors.accent)]}>
                <Ionicons name="add" size={26} color={colors.textOnAccent} />
              </View>
            </Card>
          </Pressable>
        </Animated.View>

        {/* Upcoming services */}
        {upcoming.length > 0 ? (
          <>
            <Text variant="label" tone="secondary" style={{ marginTop: space[7], marginBottom: space[3] }}>UPCOMING SERVICE</Text>
            {upcoming.map((r, i) => (
              <Animated.View key={r.type} entering={enter(200 + i * 60)} style={{ marginBottom: space[3] }}>
                <ServiceReminderCard title={serviceTypeLabel(r.type)} kmRemaining={r.remaining} overdue={r.remaining < 0} />
              </Animated.View>
            ))}
          </>
        ) : null}

        {/* Recent fuel */}
        <Text variant="label" tone="secondary" style={{ marginTop: space[7], marginBottom: space[3] }}>RECENT FUEL</Text>
        {!ready ? (
          <RecentSkeleton colors={colors} />
        ) : recent.length === 0 ? (
          <Card tone="elevated" style={{ alignItems: 'center', paddingVertical: space[8] }}>
            <Image source={IMAGES.fueling} style={{ width: 96, height: 96 }} contentFit="contain" />
            <Text variant="heading" style={{ marginTop: space[3] }}>No fills yet</Text>
            <Text variant="caption" tone="secondary" style={{ marginTop: space[1], textAlign: 'center', maxWidth: 260 }}>
              Log your first tank to start tracking real fuel economy.
            </Text>
          </Card>
        ) : (
          <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(240)}>
            <Card tone="elevated" padded={false} style={{ overflow: 'hidden' }}>
              {recent.map((e, i) => (
                <RecentRow key={e.id} entry={e} onPress={openEntry} showDivider={i < recent.length - 1} colors={colors} />
              ))}
            </Card>
          </Animated.View>
        )}
      </ScrollView>

      <AddFuelSheet visible={fuelSheetVisible} onClose={closeFuelSheet} />
    </View>
  );
}

type ThemeColors = ReturnType<typeof useTheme>['colors'];

const StatCol = React.memo(function StatCol({ label, value, accent, colors }: { label: string; value: string | null; accent?: boolean; colors: ThemeColors }) {
  return (
    <View style={{ flex: 1 }}>
      <Text variant="micro" tone="muted">{label.toUpperCase()}</Text>
      {value === null ? (
        <Skeleton width="70%" height={20} style={{ marginTop: space[2] }} />
      ) : (
        <Text variant="heading" tone={accent ? 'accent' : 'primary'} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5} style={{ marginTop: space[1], fontSize: 20, lineHeight: 26 }}>{value}</Text>
      )}
    </View>
  );
});

const Divider = React.memo(function Divider({ colors }: { colors: ThemeColors }) {
  return <View style={{ width: 1, backgroundColor: colors.divider, marginHorizontal: space[3], alignSelf: 'stretch' }} />;
});

const RecentRow = React.memo(function RecentRow({ entry, onPress, showDivider, colors }: { entry: ComputedFuelEntry; onPress: (id: string) => void; showDivider: boolean; colors: ThemeColors }) {
  const handlePress = useCallback(() => onPress(entry.id), [onPress, entry.id]);
  return (
    <View>
      <FuelEntryRow entry={entry} onPress={handlePress} />
      {showDivider ? <View style={{ height: 1, backgroundColor: colors.divider, marginHorizontal: space[5] }} /> : null}
    </View>
  );
});

const RecentSkeleton = React.memo(function RecentSkeleton({ colors }: { colors: ThemeColors }) {
  return (
    <Card tone="elevated" padded={false} style={{ overflow: 'hidden' }}>
      {[0, 1, 2].map((i) => (
        <View key={i}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[4], paddingVertical: space[4], paddingHorizontal: space[5] }}>
            <Skeleton width={52} height={52} radius={radius.md} />
            <View style={{ flex: 1, gap: space[2] }}>
              <Skeleton width="55%" height={15} />
              <Skeleton width="40%" height={13} />
            </View>
            <Skeleton width={56} height={15} />
          </View>
          {i < 2 ? <View style={{ height: 1, backgroundColor: colors.divider, marginHorizontal: space[5] }} /> : null}
        </View>
      ))}
    </Card>
  );
});
