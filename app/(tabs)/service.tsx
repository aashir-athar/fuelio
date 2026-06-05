// Lever: loss aversion + progressive disclosure. Overdue/soon reminders sit above
// the fold as a gentle nudge ("don't let this lapse"), while the full service log
// stays collapsed into one calm card so the screen reads as "handled, not nagging".
import { ServiceReminderCard } from '@/src/components/cards/ServiceReminderCard';
import { Card } from '@/src/components/primitives/Card';
import { EmptyState } from '@/src/components/primitives/EmptyState';
import { SectionHeader } from '@/src/components/primitives/SectionHeader';
import { SegmentedControl } from '@/src/components/primitives/SegmentedControl';
import { Text } from '@/src/components/primitives/Text';
import { AddServiceSheet } from '@/src/components/sheets/AddServiceSheet';
import { IMAGES } from '@/src/constants/images';
import { useActiveVehicle } from '@/src/hooks/useActiveVehicle';
import { useReduceMotion } from '@/src/hooks/useReduceMotion';
import { useServiceReminders } from '@/src/hooks/useServiceReminders';
import { useServiceStore } from '@/src/store/service.store';
import { useSettingsStore } from '@/src/store/settings.store';
import { useTheme } from '@/src/theme/ThemeProvider';
import { accentGlow, radius, space } from '@/src/theme/tokens';
import type { ServiceEntry } from '@/src/types';
import { formatCurrency, formatDate, formatDistance } from '@/src/utils/format';
import { serviceTypeLabel } from '@/src/utils/serviceLabels';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Tab = 'oil' | 'all';

interface ServiceRowProps {
  entry: ServiceEntry;
  onPress: (id: string) => void;
}

const ServiceRow = React.memo(function ServiceRow({ entry, onPress }: ServiceRowProps) {
  const { colors } = useTheme();
  const currency = useSettingsStore((s) => s.currency);
  const distanceUnit = useSettingsStore((s) => s.distanceUnit);

  const label = serviceTypeLabel(entry.type);
  const handlePress = useCallback(() => onPress(entry.id), [onPress, entry.id]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${formatDate(entry.date, 'long')}, ${formatCurrency(entry.cost, currency)}`}
      accessibilityHint="Opens this service to edit"
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: space[3],
        paddingHorizontal: space[4],
        gap: space[3],
        opacity: pressed ? 0.7 : 1,
      })}
    >
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
        <Ionicons name="build" size={18} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="body" weight="semibold" numberOfLines={1}>{label}</Text>
        <Text variant="caption" tone="secondary" numberOfLines={1} style={{ marginTop: 2 }}>
          {formatDate(entry.date, 'long')} · {formatDistance(entry.odometer, distanceUnit)}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
        <Text variant="body" weight="semibold">{formatCurrency(entry.cost, currency)}</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
      </View>
    </Pressable>
  );
});

export default function ServiceScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const reduceMotion = useReduceMotion();

  const vehicle = useActiveVehicle();
  const services = useServiceStore((s) => s.entries);
  const reminders = useServiceReminders(vehicle?.id);

  const [tab, setTab] = useState<Tab>('all');
  const [sheetVisible, setSheetVisible] = useState(false);
  const openSheet = useCallback(() => setSheetVisible(true), []);
  const closeSheet = useCallback(() => setSheetVisible(false), []);

  const openEntry = useCallback(
    (id: string) => router.push({ pathname: '/modal/edit-service', params: { id } }),
    [router],
  );

  const vServices = useMemo(
    () => services
      .filter((s) => s.vehicleId === vehicle?.id)
      .filter((s) => (tab === 'oil' ? s.type === 'oil-change' : true))
      .sort((a, b) => b.date - a.date),
    [services, vehicle, tab],
  );

  if (!vehicle) return null;

  const upcoming = reminders.slice(0, 3);

  const enter = (delay: number) =>
    reduceMotion ? undefined : FadeInDown.duration(320).delay(delay);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + space[3],
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: space[5],
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="label" tone="secondary">MAINTENANCE</Text>
        <Text variant="title" style={{ marginTop: space[1], marginBottom: space[5] }}>
          Keep it running
        </Text>

        <SegmentedControl
          options={[
            { value: 'all', label: 'All Services' },
            { value: 'oil', label: 'Oil Changes' },
          ]}
          value={tab}
          onChange={setTab}
        />

        {upcoming.length > 0 ? (
          <>
            <SectionHeader title="Upcoming" />
            {upcoming.map((r, i) => (
              <Animated.View
                key={r.type}
                entering={enter(i * 60)}
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

        <SectionHeader title="History" />
        {vServices.length === 0 ? (
          <EmptyState
            image={IMAGES.carMaintenance}
            title={tab === 'oil' ? 'No oil changes yet' : 'No service history'}
            subtitle="Log every service to get smart reminders and see how much your car has cost you over time."
            ctaLabel="Log first service"
            onCta={openSheet}
          />
        ) : (
          <Animated.View entering={enter(80)}>
            <Card padded={false} style={{ overflow: 'hidden' }}>
              {vServices.map((s, i) => (
                <View key={s.id}>
                  <ServiceRow entry={s} onPress={openEntry} />
                  {i < vServices.length - 1 ? (
                    <View style={{ height: 1, backgroundColor: colors.divider, marginHorizontal: space[4] }} />
                  ) : null}
                </View>
              ))}
            </Card>
          </Animated.View>
        )}
      </ScrollView>

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
          accessibilityLabel="Add service entry"
          accessibilityHint="Opens the service entry sheet"
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

      <AddServiceSheet visible={sheetVisible} onClose={closeSheet} />
    </View>
  );
}
