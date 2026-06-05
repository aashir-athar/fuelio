// Lever: peak-end + progressive disclosure. The hero opens on the active vehicle
// and a single trustworthy economy figure, then surfaces only the next two service
// reminders so the dashboard reads as "you're on top of it" at a glance.
import { FuelEntryRow } from '@/src/components/cards/FuelEntryRow';
import { ServiceReminderCard } from '@/src/components/cards/ServiceReminderCard';
import { VehicleCard } from '@/src/components/cards/VehicleCard';
import { Avatar } from '@/src/components/primitives/Avatar';
import { Card } from '@/src/components/primitives/Card';
import { SectionHeader } from '@/src/components/primitives/SectionHeader';
import { Skeleton } from '@/src/components/primitives/Skeleton';
import { StatTile } from '@/src/components/primitives/StatTile';
import { Text } from '@/src/components/primitives/Text';
import { AddFuelSheet } from '@/src/components/sheets/AddFuelSheet';
import { IMAGES } from '@/src/constants/images';
import { useActiveVehicle } from '@/src/hooks/useActiveVehicle';
import { useReduceMotion } from '@/src/hooks/useReduceMotion';
import { useServiceReminders } from '@/src/hooks/useServiceReminders';
import { useVehicleStats } from '@/src/hooks/useVehicleStats';
import { useSettingsStore } from '@/src/store/settings.store';
import { useTheme } from '@/src/theme/ThemeProvider';
import { accentGlow, radius, space } from '@/src/theme/tokens';
import type { ComputedFuelEntry } from '@/src/utils/fuelAlgorithm';
import { formatCurrency, formatEfficiency } from '@/src/utils/format';
import { serviceTypeLabel } from '@/src/utils/serviceLabels';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
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

  const [fuelSheetVisible, setFuelSheetVisible] = React.useState(false);
  const openFuelSheet = useCallback(() => setFuelSheetVisible(true), []);
  const closeFuelSheet = useCallback(() => setFuelSheetVisible(false), []);
  const openSettings = useCallback(() => router.push('/modal/settings'), [router]);
  const openEntry = useCallback(
    (id: string) => router.push(`/modal/edit-fuel?id=${id}`),
    [router],
  );

  if (!vehicle) return null;

  const ready = stats !== null;
  const recent = stats?.entries.slice(-3).reverse() ?? [];
  const upcoming = reminders.slice(0, 2);

  const trendCaption =
    stats?.stats.efficiencyTrend === 'improving'
      ? 'improving'
      : stats?.stats.efficiencyTrend === 'declining'
        ? 'declining'
        : undefined;

  // Animation only enters when motion is allowed; a static no-op entering keeps
  // the first paint instant under Reduce Motion.
  const enter = (delay: number) =>
    reduceMotion ? undefined : FadeInDown.duration(320).delay(delay);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + space[3],
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: space[5],
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: space[5],
          }}
        >
          <View style={{ flex: 1, paddingRight: space[4] }}>
            <Text variant="label" tone="secondary">
              WELCOME BACK
            </Text>
            <Text variant="title" numberOfLines={1} style={{ marginTop: space[1] }}>
              {vehicle.nickname}
            </Text>
          </View>
          <Pressable
            onPress={openSettings}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Avatar source={IMAGES.addVehicle} size={44} />
          </Pressable>
        </View>

        {/* Vehicle card */}
        <Animated.View entering={enter(0)}>
          <VehicleCard vehicle={vehicle} active />
        </Animated.View>

        {/* Stats grid */}
        <Animated.View
          entering={enter(80)}
          style={{ flexDirection: 'row', gap: space[3], marginTop: space[4] }}
        >
          {ready ? (
            <>
              <StatTile
                label="Total Spent"
                value={formatCurrency(stats.stats.totalCost, currency)}
                tone="accent"
                compact
                style={{ flex: 1 }}
              />
              <StatTile
                label="Avg Efficiency"
                value={formatEfficiency(stats.stats.averageEfficiency, distanceUnit)}
                tone="success"
                compact
                caption={trendCaption}
                style={{ flex: 1 }}
              />
            </>
          ) : (
            <>
              <StatTileSkeleton />
              <StatTileSkeleton />
            </>
          )}
        </Animated.View>

        {/* Quick log CTA */}
        <Animated.View entering={enter(160)}>
          <Pressable
            onPress={openFuelSheet}
            accessibilityRole="button"
            accessibilityLabel="Log a fill-up"
            accessibilityHint="Opens the quick fuel entry sheet"
            style={({ pressed }) => ([
              {
                marginTop: space[5],
                borderRadius: radius.xl,
                backgroundColor: colors.accent,
                padding: space[5],
                flexDirection: 'row',
                alignItems: 'center',
                gap: space[4],
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
              accentGlow(colors.accent),
            ])}
          >
            <Image
              source={IMAGES.fueling}
              style={{ width: 60, height: 60 }}
              contentFit="contain"
            />
            <View style={{ flex: 1 }}>
              <Text variant="heading" tone="onAccent" weight="bold">
                Log fuel
              </Text>
              <Text
                variant="caption"
                tone="onAccent"
                style={{ opacity: 0.75, marginTop: 2 }}
              >
                Five seconds now, sharper numbers later
              </Text>
            </View>
            <Text variant="title" tone="onAccent" weight="heavy">
              +
            </Text>
          </Pressable>
        </Animated.View>

        {/* Upcoming services */}
        {upcoming.length > 0 ? (
          <>
            <SectionHeader title="Upcoming services" />
            {upcoming.map((r, i) => (
              <Animated.View
                key={r.type}
                entering={enter(240 + i * 60)}
                style={{ marginBottom: space[3] }}
              >
                <ServiceReminderCard
                  title={serviceTypeLabel(r.type)}
                  kmRemaining={r.remaining}
                  overdue={r.remaining < 0}
                />
              </Animated.View>
            ))}
          </>
        ) : null}

        {/* Recent activity */}
        <SectionHeader title="Recent fuel" />
        {!ready ? (
          <RecentSkeleton />
        ) : recent.length === 0 ? (
          <Card style={{ alignItems: 'center', paddingVertical: space[7] }}>
            <Avatar source={IMAGES.fueling} size={100} tinted={false} />
            <Text variant="bodyLg" weight="semibold" style={{ marginTop: space[3] }}>
              No fills yet
            </Text>
            <Text
              variant="caption"
              tone="secondary"
              style={{ marginTop: space[1], textAlign: 'center', maxWidth: 260 }}
            >
              Tap Log fuel above to record your first tank and start seeing your efficiency.
            </Text>
          </Card>
        ) : (
          <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(220)}>
            <Card padded={false} style={{ overflow: 'hidden' }}>
              {recent.map((e, i) => (
                <RecentRow
                  key={e.id}
                  entry={e}
                  onPress={openEntry}
                  showDivider={i < recent.length - 1}
                />
              ))}
            </Card>
          </Animated.View>
        )}
      </ScrollView>

      <AddFuelSheet visible={fuelSheetVisible} onClose={closeFuelSheet} />
    </View>
  );
}

interface RecentRowProps {
  entry: ComputedFuelEntry;
  onPress: (id: string) => void;
  showDivider: boolean;
}

const RecentRow = React.memo(function RecentRow({
  entry,
  onPress,
  showDivider,
}: RecentRowProps) {
  const { colors } = useTheme();
  const handlePress = useCallback(() => onPress(entry.id), [onPress, entry.id]);

  return (
    <View>
      <FuelEntryRow entry={entry} onPress={handlePress} />
      {showDivider ? (
        <View
          style={{
            height: 1,
            backgroundColor: colors.divider,
            marginHorizontal: space[5],
          }}
        />
      ) : null}
    </View>
  );
});

const StatTileSkeleton = React.memo(function StatTileSkeleton() {
  return (
    <Card style={{ flex: 1, minHeight: 96 }}>
      <Skeleton width={72} height={11} style={{ marginBottom: space[2] }} />
      <Skeleton width="60%" height={24} />
    </Card>
  );
});

const RecentSkeleton = React.memo(function RecentSkeleton() {
  const { colors } = useTheme();

  return (
    <Card padded={false} style={{ overflow: 'hidden' }}>
      {[0, 1, 2].map((i) => (
        <View key={i}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: space[4],
              paddingVertical: space[3],
              paddingHorizontal: space[4],
            }}
          >
            <Skeleton width={52} height={52} radius={radius.md} />
            <View style={{ flex: 1, gap: space[2] }}>
              <Skeleton width="55%" height={15} />
              <Skeleton width="40%" height={13} />
            </View>
            <Skeleton width={56} height={15} />
          </View>
          {i < 2 ? (
            <View
              style={{
                height: 1,
                backgroundColor: colors.divider,
                marginHorizontal: space[5],
              }}
            />
          ) : null}
        </View>
      ))}
    </Card>
  );
});
