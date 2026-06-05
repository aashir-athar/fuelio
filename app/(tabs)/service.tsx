// Lever: loss aversion + progressive disclosure. The most urgent reminder is lifted
// into a bold lime statement card ("don't let this lapse"), softer reminders sit
// below as calm charcoal cards, and the full history collapses into one floating
// card so the screen reads as "handled, not nagging".
import { ServiceReminderCard } from '@/src/components/cards/ServiceReminderCard';
import { Card } from '@/src/components/primitives/Card';
import { EmptyState } from '@/src/components/primitives/EmptyState';
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
import { accentGlow, fontFamily, radius, space } from '@/src/theme/tokens';
import type { DistanceUnit, ServiceEntry } from '@/src/types';
import { formatCurrency, formatDate, formatDistance } from '@/src/utils/format';
import { serviceTypeLabel } from '@/src/utils/serviceLabels';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Tab = 'oil' | 'all';
type ThemeColors = ReturnType<typeof useTheme>['colors'];

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
        paddingVertical: space[4],
        paddingHorizontal: space[5],
        gap: space[4],
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: radius.md,
          backgroundColor: colors.accentSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="build" size={20} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyLg" weight="semibold" numberOfLines={1}>{label}</Text>
        <Text variant="caption" tone="secondary" numberOfLines={1} style={{ marginTop: 2 }}>
          {formatDate(entry.date, 'long')} · {formatDistance(entry.odometer, distanceUnit)}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
        <Text variant="bodyLg" weight="semibold">{formatCurrency(entry.cost, currency)}</Text>
        <Ionicons name="chevron-forward" size={15} color={colors.textMuted} />
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

  const distanceUnit = useSettingsStore((s) => s.distanceUnit);

  if (!vehicle) return null;

  // The single most pressing reminder gets the lime statement card; the rest stay calm.
  const lead = reminders[0];
  const rest = reminders.slice(1, 3);

  const enter = (delay: number) =>
    reduceMotion ? undefined : FadeInDown.duration(360).delay(delay);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + space[4],
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: space[5],
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={enter(0)}>
          <Text variant="micro" tone="secondary">MAINTENANCE</Text>
          <Text
            style={{
              fontFamily: fontFamily.display,
              fontSize: 44,
              lineHeight: 48,
              letterSpacing: -1.4,
              color: colors.textPrimary,
              marginTop: space[1],
              marginBottom: space[5],
            }}
          >
            Keep it running
          </Text>
        </Animated.View>

        <Animated.View entering={enter(60)}>
          <SegmentedControl
            options={[
              { value: 'all', label: 'All Services' },
              { value: 'oil', label: 'Oil Changes' },
            ]}
            value={tab}
            onChange={setTab}
          />
        </Animated.View>

        {lead ? (
          <Animated.View entering={enter(120)} style={{ marginTop: space[6] }}>
            <Text variant="label" tone="secondary" style={{ marginBottom: space[3] }}>UPCOMING</Text>
            <LeadReminderCard
              title={serviceTypeLabel(lead.type)}
              remaining={lead.remaining}
              distanceUnit={distanceUnit}
              colors={colors}
            />
            {rest.map((r, i) => (
              <Animated.View
                key={r.type}
                entering={enter(180 + i * 60)}
                style={{ marginTop: space[3] }}
              >
                <ServiceReminderCard
                  title={serviceTypeLabel(r.type)}
                  kmRemaining={r.remaining}
                  overdue={r.remaining < 0}
                />
              </Animated.View>
            ))}
          </Animated.View>
        ) : null}

        <Text variant="label" tone="secondary" style={{ marginTop: space[7], marginBottom: space[3] }}>HISTORY</Text>
        {vServices.length === 0 ? (
          <EmptyState
            image={IMAGES.carMaintenance}
            title={tab === 'oil' ? 'No oil changes yet' : 'No service history'}
            subtitle="Log every service to get smart reminders and see how much your car has cost you over time."
            ctaLabel="Log first service"
            onCta={openSheet}
          />
        ) : (
          <Animated.View entering={enter(120)}>
            <Card tone="elevated" padded={false} style={{ overflow: 'hidden' }}>
              {vServices.map((s, i) => (
                <View key={s.id}>
                  <ServiceRow entry={s} onPress={openEntry} />
                  {i < vServices.length - 1 ? (
                    <View style={{ height: 1, backgroundColor: colors.divider, marginHorizontal: space[5] }} />
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

interface LeadReminderCardProps {
  title: string;
  remaining: number;
  distanceUnit: DistanceUnit;
  colors: ThemeColors;
}

// The hero reminder: full-lime fill with black text when overdue (loudest signal),
// charcoal with a lime accent number when simply due soon.
const LeadReminderCard = React.memo(function LeadReminderCard({
  title, remaining, distanceUnit, colors,
}: LeadReminderCardProps) {
  const overdue = remaining < 0;
  const distance = formatDistance(Math.abs(remaining), distanceUnit);

  if (overdue) {
    return (
      <Card tone="lime" style={[{ overflow: 'hidden' }, accentGlow(colors.accent)]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text variant="micro" tone="onAccent" style={{ opacity: 0.65 }}>NEXT SERVICE</Text>
          <View
            style={{
              paddingHorizontal: space[3],
              paddingVertical: 5,
              borderRadius: radius.pill,
              backgroundColor: colors.textOnAccent,
            }}
          >
            <Text variant="micro" weight="bold" tone="accent">OVERDUE</Text>
          </View>
        </View>
        <Text variant="title" tone="onAccent" numberOfLines={1} style={{ marginTop: space[3] }}>
          {title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space[2], marginTop: space[2] }}>
          <Text
            style={{
              fontFamily: fontFamily.display,
              fontSize: 40,
              lineHeight: 42,
              letterSpacing: -1.4,
              color: colors.textOnAccent,
            }}
          >
            {distance}
          </Text>
          <Text variant="body" tone="onAccent" weight="semibold" style={{ marginBottom: space[2], opacity: 0.8 }}>
            past due
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card tone="elevated" style={{ overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text variant="micro" tone="secondary">NEXT SERVICE</Text>
        <View
          style={{
            paddingHorizontal: space[3],
            paddingVertical: 5,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: colors.accent,
            backgroundColor: colors.accentSoft,
          }}
        >
          <Text variant="micro" weight="bold" tone="accent">SOON</Text>
        </View>
      </View>
      <Text variant="title" numberOfLines={1} style={{ marginTop: space[3] }}>
        {title}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space[2], marginTop: space[2] }}>
        <Text
          style={{
            fontFamily: fontFamily.display,
            fontSize: 40,
            lineHeight: 42,
            letterSpacing: -1.4,
            color: colors.accent,
          }}
        >
          {distance}
        </Text>
        <Text variant="body" tone="secondary" weight="semibold" style={{ marginBottom: space[2] }}>
          to go
        </Text>
      </View>
    </Card>
  );
});
