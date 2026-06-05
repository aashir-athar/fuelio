// Lever: progressive disclosure — oil-change details only unfold when relevant,
// and a lime "next due" card closes the loop so logging feels like planning ahead.
import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { useHaptics } from '../../hooks/useHaptics';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import { useServiceStore } from '../../store/service.store';
import { useSettingsStore } from '../../store/settings.store';
import { useTheme } from '../../theme/ThemeProvider';
import { accentGlow, fontFamily, space } from '../../theme/tokens';
import type { OilGrade, OilType, ServiceType } from '../../types';
import { formatDistance } from '../../utils/format';
import {
  displayToKm,
  displayToLitres,
  distanceUnitLabel,
  kmToDisplay,
  volumeUnitLabel,
} from '../../utils/units';
import { Button } from '../primitives/Button';
import { Card } from '../primitives/Card';
import { Chip } from '../primitives/Chip';
import { Input } from '../primitives/Input';
import { Sheet } from '../primitives/Sheet';
import { Text } from '../primitives/Text';

interface Props {
  visible: boolean;
  onClose: () => void;
}

// Intervals are in canonical km.
const SERVICE_TYPES: { value: ServiceType; label: string; interval: number }[] = [
  { value: 'oil-change', label: 'Oil Change', interval: 5000 },
  { value: 'tire-rotation', label: 'Tire Rotation', interval: 10000 },
  { value: 'brake', label: 'Brakes', interval: 40000 },
  { value: 'battery', label: 'Battery', interval: 60000 },
  { value: 'air-filter', label: 'Air Filter', interval: 20000 },
  { value: 'timing-belt', label: 'Timing Belt', interval: 100000 },
  { value: 'alignment', label: 'Alignment', interval: 20000 },
  { value: 'coolant', label: 'Coolant', interval: 40000 },
  { value: 'other', label: 'Other', interval: 10000 },
];

const OIL_GRADES: OilGrade[] = ['0W-20', '0W-30', '5W-20', '5W-30', '5W-40', '10W-30', '10W-40', '15W-40', '20W-50'];
const OIL_TYPES: { value: OilType; label: string }[] = [
  { value: 'fully-synthetic', label: 'Fully Synthetic' },
  { value: 'semi-synthetic', label: 'Semi Synthetic' },
  { value: 'mineral', label: 'Mineral' },
];

export function AddServiceSheet({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const vehicle = useActiveVehicle();
  const addEntry = useServiceStore((s) => s.addEntry);
  const currency = useSettingsStore((s) => s.currency);
  const distanceUnit = useSettingsStore((s) => s.distanceUnit);
  const volumeUnit = useSettingsStore((s) => s.volumeUnit);
  const haptic = useHaptics();

  const [type, setType] = useState<ServiceType>('oil-change');
  const [odometer, setOdometer] = useState('');
  const [cost, setCost] = useState('');
  const [oilGrade, setOilGrade] = useState<OilGrade>('5W-30');
  const [oilType, setOilType] = useState<OilType>('fully-synthetic');
  const [oilQty, setOilQty] = useState('');
  const [notes, setNotes] = useState('');

  // Re-seed the odometer each time the sheet opens (render-time reset; no setState-in-effect).
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible && vehicle) setOdometer(String(Math.round(kmToDisplay(vehicle.odometer, distanceUnit))));
  }

  const selectedType = useMemo(() => SERVICE_TYPES.find((t) => t.value === type), [type]);
  const odoNum = parseFloat(odometer) || 0;
  const costNum = parseFloat(cost) || 0;
  const odoCanonical = displayToKm(odoNum, distanceUnit);
  const nextDueCanonical = odoNum > 0 && selectedType ? odoCanonical + selectedType.interval : undefined;
  const canSave = odoNum > 0 && costNum >= 0 && vehicle !== null;

  const handleSave = () => {
    if (!canSave || !vehicle) return;
    const qty = parseFloat(oilQty);
    addEntry({
      vehicleId: vehicle.id,
      type,
      date: Date.now(),
      odometer: odoCanonical,
      cost: costNum,
      notes: notes.trim() || undefined,
      oilGrade: type === 'oil-change' ? oilGrade : undefined,
      oilType: type === 'oil-change' ? oilType : undefined,
      oilQuantity: type === 'oil-change' && Number.isFinite(qty) && qty > 0
        ? displayToLitres(qty, volumeUnit)
        : undefined,
      nextDueMileage: nextDueCanonical,
    });
    haptic('success');
    setCost('');
    setNotes('');
    setOilQty('');
    onClose();
  };

  if (!vehicle) return null;

  const enter = (delay: number) => (reduceMotion ? undefined : FadeInDown.duration(360).delay(delay));
  const nextDueParts = nextDueCanonical ? formatDistance(nextDueCanonical, distanceUnit).split(' ') : null;
  const nextDueNumber = nextDueParts ? nextDueParts[0] : '';
  const nextDueUnit = nextDueParts ? nextDueParts.slice(1).join(' ') : '';

  return (
    <Sheet visible={visible} onClose={onClose}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space[5], paddingTop: space[2], paddingBottom: space[6], gap: space[5] }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={enter(0)}>
          <Text variant="micro" tone="secondary">LOG A SERVICE</Text>
          <Text variant="display" numberOfLines={1} style={{ marginTop: space[1] }}>Maintenance</Text>
          <Text variant="caption" tone="secondary" style={{ marginTop: space[1] }}>{vehicle.nickname}</Text>
        </Animated.View>

        <Animated.View entering={enter(60)} style={{ gap: space[3] }}>
          <Text variant="label" tone="secondary">SERVICE TYPE</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
            {SERVICE_TYPES.map((t) => (
              <Chip key={t.value} label={t.label} selected={type === t.value} onPress={() => setType(t.value)} />
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={enter(120)}>
          <View style={{ flexDirection: 'row', gap: space[3] }}>
            <Input
              label="Odometer"
              placeholder="0"
              keyboardType="number-pad"
              value={odometer}
              onChangeText={setOdometer}
              suffix={distanceUnitLabel(distanceUnit)}
              containerStyle={{ flex: 1 }}
            />
            <Input
              label="Cost"
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={cost}
              onChangeText={setCost}
              suffix={currency}
              containerStyle={{ flex: 1 }}
            />
          </View>
        </Animated.View>

        {type === 'oil-change' ? (
          <Animated.View entering={enter(180)} style={{ gap: space[5] }}>
            <View style={{ gap: space[3] }}>
              <Text variant="label" tone="secondary">OIL GRADE</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
                {OIL_GRADES.map((g) => (
                  <Chip key={g} label={g} selected={oilGrade === g} onPress={() => setOilGrade(g)} />
                ))}
              </View>
            </View>
            <View style={{ gap: space[3] }}>
              <Text variant="label" tone="secondary">OIL TYPE</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
                {OIL_TYPES.map((o) => (
                  <Chip key={o.value} label={o.label} selected={oilType === o.value} onPress={() => setOilType(o.value)} />
                ))}
              </View>
            </View>
            <Input
              label={`Quantity (${volumeUnitLabel(volumeUnit)})`}
              placeholder="4.5"
              keyboardType="decimal-pad"
              value={oilQty}
              onChangeText={setOilQty}
              suffix={volumeUnitLabel(volumeUnit)}
            />
          </Animated.View>
        ) : null}

        <Animated.View entering={enter(220)}>
          <Input
            label="Notes (optional)"
            placeholder="Shop name, parts used, etc."
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </Animated.View>

        {nextDueCanonical ? (
          <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(320)}>
            <Card tone="lime" style={[{ overflow: 'hidden' }, accentGlow(colors.accent)]}>
              <Text variant="micro" tone="onAccent" style={{ opacity: 0.65 }}>NEXT DUE AT</Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space[2], marginTop: space[2] }}>
                <Text
                  numberOfLines={1}
                  style={{ fontFamily: fontFamily.display, fontSize: 48, lineHeight: 52, letterSpacing: -1.2, color: colors.textOnAccent }}
                >
                  {nextDueNumber}
                </Text>
                <Text variant="bodyLg" tone="onAccent" weight="semibold" style={{ marginBottom: space[2], opacity: 0.8 }}>
                  {nextDueUnit}
                </Text>
              </View>
            </Card>
          </Animated.View>
        ) : null}

        <Animated.View entering={enter(280)} style={{ marginTop: space[1] }}>
          <Button label="Save service" onPress={handleSave} disabled={!canSave} size="lg" fullWidth />
        </Animated.View>
      </ScrollView>
    </Sheet>
  );
}
