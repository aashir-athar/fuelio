import { FuelEntryRow } from '@/src/components/cards/FuelEntryRow';
import { ServiceReminderCard } from '@/src/components/cards/ServiceReminderCard';
import { VehicleCard } from '@/src/components/cards/VehicleCard';
import { Avatar } from '@/src/components/primitives/Avatar';
import { Card } from '@/src/components/primitives/Card';
import { SectionHeader } from '@/src/components/primitives/SectionHeader';
import { StatTile } from '@/src/components/primitives/StatTile';
import { Text } from '@/src/components/primitives/Text';
import { AddFuelSheet } from '@/src/components/sheets/AddFuelSheet';
import { IMAGES } from '@/src/constants/images';
import { useActiveVehicle } from '@/src/hooks/useActiveVehicle';
import { useVehicleStats } from '@/src/hooks/useVehicleStats';
import { useServiceStore } from '@/src/store/service.store';
import { useSettingsStore } from '@/src/store/settings.store';
import { useTheme } from '@/src/theme/ThemeProvider';
import { radius, space } from '@/src/theme/tokens';
import { formatCurrency, formatEfficiency } from '@/src/utils/format';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const vehicle = useActiveVehicle();
  const stats = useVehicleStats(vehicle?.id);
  const services = useServiceStore((s) => s.entries);
  const { currency, distanceUnit } = useSettingsStore();
  const [fuelSheetVisible, setFuelSheetVisible] = useState(false);

  const upcomingServices = useMemo(() => {
    if (!vehicle) return [];
    const vServices = services.filter((s) => s.vehicleId === vehicle.id && s.nextDueMileage);
    const byType = new Map<string, number>();
    for (const s of vServices) {
      const existing = byType.get(s.type) ?? 0;
      if (!existing || s.odometer > existing) byType.set(s.type, s.nextDueMileage!);
    }
    return Array.from(byType.entries()).map(([type, nextDue]) => ({
      type,
      remaining: nextDue - vehicle.odometer,
    })).sort((a, b) => a.remaining - b.remaining);
  }, [services, vehicle]);

  if (!vehicle) return null;

  const recent = stats?.entries.slice(-3).reverse() ?? [];

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
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space[5] }}>
          <View>
            <Text variant="caption" tone="secondary">Welcome back</Text>
            <Text variant="heading" style={{ marginTop: 2 }}>{vehicle.nickname}</Text>
          </View>
          <Pressable onPress={() => router.push('/modal/settings')} accessibilityRole="button" accessibilityLabel="Settings">
            <Avatar source={IMAGES.addVehicle} size={44} />
          </Pressable>
        </View>

        {/* Vehicle card */}
        <Animated.View entering={FadeInDown.duration(320)}>
          <VehicleCard vehicle={vehicle} active />
        </Animated.View>

        {/* Stats grid */}
        <Animated.View
          entering={FadeInDown.duration(320).delay(80)}
          style={{ flexDirection: 'row', gap: space[3], marginTop: space[4] }}
        >
          <StatTile
            label="Total Spent"
            value={formatCurrency(stats?.stats.totalCost ?? 0, currency)}
            tone="accent"
            compact
            style={{ flex: 1 }}
          />
          <StatTile
            label="Avg Efficiency"
            value={stats ? formatEfficiency(stats.stats.averageEfficiency, distanceUnit) : '—'}
            tone="success"
            compact
            caption={stats?.stats.efficiencyTrend === 'improving' ? '↑ improving' : stats?.stats.efficiencyTrend === 'declining' ? '↓ declining' : undefined}
            style={{ flex: 1 }}
          />
        </Animated.View>

        {/* Quick log CTA */}
        <Animated.View entering={FadeInDown.duration(320).delay(160)}>
          <Pressable
            onPress={() => setFuelSheetVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Log fuel"
            style={({ pressed }) => ({
              marginTop: space[5],
              borderRadius: radius.xl,
              backgroundColor: colors.accent,
              padding: space[5],
              flexDirection: 'row',
              alignItems: 'center',
              gap: space[4],
              transform: [{ scale: pressed ? 0.98 : 1 }],
              shadowColor: colors.accent,
              shadowOpacity: 0.35,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 8 },
              elevation: 8,
            })}
          >
            <Image source={IMAGES.fueling} style={{ width: 60, height: 60 }} contentFit="contain" />
            <View style={{ flex: 1 }}>
              <Text variant="heading" tone="onAccent" weight="bold">Log fuel</Text>
              <Text variant="caption" tone="onAccent" style={{ opacity: 0.75, marginTop: 2 }}>
                Takes 5 seconds, updates all your stats
              </Text>
            </View>
            <Text variant="title" tone="onAccent" weight="heavy">+</Text>
          </Pressable>
        </Animated.View>

        {/* Upcoming services */}
        {upcomingServices.length > 0 ? (
          <>
            <SectionHeader title="Upcoming services" />
            {upcomingServices.slice(0, 2).map((s, i) => (
              <Animated.View key={s.type} entering={FadeInDown.duration(320).delay(240 + i * 60)} style={{ marginBottom: space[3] }}>
                <ServiceReminderCard
                  title={s.type.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  kmRemaining={s.remaining}
                  overdue={s.remaining < 0}
                />
              </Animated.View>
            ))}
          </>
        ) : null}

        {/* Recent activity */}
        <SectionHeader title="Recent fuel" />
        {recent.length === 0 ? (
          <Card style={{ alignItems: 'center', paddingVertical: space[7] }}>
            <Avatar source={IMAGES.fueling} size={100} tinted={false} />
            <Text variant="bodyLg" weight="semibold" style={{ marginTop: space[3] }}>No fills yet</Text>
            <Text variant="caption" tone="secondary" style={{ marginTop: space[1], textAlign: 'center', maxWidth: 260 }}>
              Tap Log fuel above to record your first tank and start seeing your efficiency.
            </Text>
          </Card>
        ) : (
          <Card padded={false} style={{ overflow: 'hidden' }}>
            {recent.map((e, i) => (
              <View key={e.id}>
                <FuelEntryRow entry={e} onPress={() => router.push(`/modal/edit-fuel?id=${e.id}`)} />
                {i < recent.length - 1 ? (
                  <View style={{ height: 1, backgroundColor: colors.divider, marginHorizontal: space[5] }} />
                ) : null}
              </View>
            ))}
          </Card>
        )}
      </ScrollView>

      <AddFuelSheet visible={fuelSheetVisible} onClose={() => setFuelSheetVisible(false)} />
    </View>
  );
}