import { ServiceReminderCard } from '@/src/components/cards/ServiceReminderCard';
import { Card } from '@/src/components/primitives/Card';
import { EmptyState } from '@/src/components/primitives/EmptyState';
import { SectionHeader } from '@/src/components/primitives/SectionHeader';
import { SegmentedControl } from '@/src/components/primitives/SegmentedControl';
import { Text } from '@/src/components/primitives/Text';
import { AddServiceSheet } from '@/src/components/sheets/AddServiceSheet';
import { IMAGES } from '@/src/constants/images';
import { useActiveVehicle } from '@/src/hooks/useActiveVehicle';
import { useServiceStore } from '@/src/store/service.store';
import { useSettingsStore } from '@/src/store/settings.store';
import { useTheme } from '@/src/theme/ThemeProvider';
import { space } from '@/src/theme/tokens';
import type { ServiceEntry } from '@/src/types';
import { formatCurrency, formatDate } from '@/src/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Tab = 'oil' | 'all';

const TYPE_LABELS: Record<string, string> = {
  'oil-change': 'Oil Change',
  'tire-rotation': 'Tire Rotation',
  'brake': 'Brake Service',
  'battery': 'Battery',
  'air-filter': 'Air Filter',
  'timing-belt': 'Timing Belt',
  'alignment': 'Alignment',
  'coolant': 'Coolant',
  'other': 'Other',
};

function ServiceRow({ entry }: { entry: ServiceEntry }) {
  const { colors } = useTheme();
  const currency = useSettingsStore((s) => s.currency);
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/modal/edit-service', params: { id: entry.id } })}
      accessibilityRole="button"
      accessibilityLabel={`Edit ${TYPE_LABELS[entry.type] ?? entry.type} service`}
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
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.accentSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="build" size={18} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="body" weight="semibold">{TYPE_LABELS[entry.type] ?? entry.type}</Text>
        <Text variant="caption" tone="secondary" style={{ marginTop: 2 }}>
          {formatDate(entry.date, 'long')} · {entry.odometer.toLocaleString()} km
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
        <Text variant="body" weight="semibold">{formatCurrency(entry.cost, currency)}</Text>
        <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

export default function ServiceScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const vehicle = useActiveVehicle();
  const services = useServiceStore((s) => s.entries);
  const [tab, setTab] = useState<Tab>('all');
  const [sheetVisible, setSheetVisible] = useState(false);

  const vServices = useMemo(
    () => services
      .filter((s) => s.vehicleId === vehicle?.id)
      .filter((s) => tab === 'oil' ? s.type === 'oil-change' : true)
      .sort((a, b) => b.date - a.date),
    [services, vehicle, tab],
  );

  const reminders = useMemo(() => {
    if (!vehicle) return [];
    const byType = new Map<string, number>();
    for (const s of services.filter((x) => x.vehicleId === vehicle.id && x.nextDueMileage)) {
      const existing = byType.get(s.type) ?? 0;
      if (!existing || s.odometer > existing) byType.set(s.type, s.nextDueMileage!);
    }
    return Array.from(byType.entries())
      .map(([type, nextDue]) => ({ type, remaining: nextDue - vehicle.odometer }))
      .sort((a, b) => a.remaining - b.remaining);
  }, [services, vehicle]);

  if (!vehicle) return null;

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
        <Text variant="caption" tone="secondary">Maintenance</Text>
        <Text variant="title" style={{ marginTop: 2, marginBottom: space[5] }}>Keep it running</Text>

        <SegmentedControl
          options={[
            { value: 'all', label: 'All Services' },
            { value: 'oil', label: 'Oil Changes' },
          ]}
          value={tab}
          onChange={setTab}
        />

        {reminders.length > 0 ? (
          <>
            <SectionHeader title="Upcoming" />
            {reminders.slice(0, 3).map((r) => (
              <View key={r.type} style={{ marginBottom: space[3] }}>
                <ServiceReminderCard
                  title={TYPE_LABELS[r.type] ?? r.type}
                  kmRemaining={r.remaining}
                  overdue={r.remaining < 0}
                />
              </View>
            ))}
          </>
        ) : null}

        <SectionHeader title="History" />
        {vServices.length === 0 ? (
          <EmptyState
            image={IMAGES.carMaintenance}
            title={tab === 'oil' ? 'No oil changes yet' : 'No service history'}
            subtitle="Track every service to get smart reminders and see how much you've invested in your car."
            ctaLabel="Log first service"
            onCta={() => setSheetVisible(true)}
          />
        ) : (
          <Card padded={false} style={{ overflow: 'hidden' }}>
            {vServices.map((s, i) => (
              <View key={s.id}>
                <ServiceRow entry={s} />
                {i < vServices.length - 1 ? (
                  <View style={{ height: 1, backgroundColor: colors.divider, marginHorizontal: space[4] }} />
                ) : null}
              </View>
            ))}
          </Card>
        )}
      </ScrollView>

      <Pressable
        onPress={() => setSheetVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Add service entry"
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

      <AddServiceSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} />
    </View>
  );
}