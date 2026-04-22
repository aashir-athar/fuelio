import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { useHaptics } from '../../hooks/useHaptics';
import { useServiceStore } from '../../store/service.store';
import { useSettingsStore } from '../../store/settings.store';
import { space } from '../../theme/tokens';
import type { OilGrade, OilType, ServiceType } from '../../types';
import { Button } from '../primitives/Button';
import { Chip } from '../primitives/Chip';
import { Input } from '../primitives/Input';
import { Sheet } from '../primitives/Sheet';
import { Text } from '../primitives/Text';

interface Props {
  visible: boolean;
  onClose: () => void;
}

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
  const vehicle = useActiveVehicle();
  const addEntry = useServiceStore((s) => s.addEntry);
  const currency = useSettingsStore((s) => s.currency);
  const haptic = useHaptics();

  const [type, setType] = useState<ServiceType>('oil-change');
  const [odometer, setOdometer] = useState('');
  const [cost, setCost] = useState('');
  const [oilGrade, setOilGrade] = useState<OilGrade>('5W-30');
  const [oilType, setOilType] = useState<OilType>('fully-synthetic');
  const [oilQty, setOilQty] = useState('');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (visible && vehicle) setOdometer(String(vehicle.odometer));
  }, [visible, vehicle]);

  const selectedType = useMemo(() => SERVICE_TYPES.find((t) => t.value === type), [type]);
  const odoNum = parseFloat(odometer) || 0;
  const costNum = parseFloat(cost) || 0;
  const nextDue = odoNum && selectedType ? odoNum + selectedType.interval : undefined;
  const canSave = odoNum > 0 && costNum >= 0 && vehicle !== null;

  const handleSave = () => {
    if (!canSave || !vehicle) return;
    addEntry({
      vehicleId: vehicle.id,
      type,
      date: Date.now(),
      odometer: odoNum,
      cost: costNum,
      notes: notes.trim() || undefined,
      oilGrade: type === 'oil-change' ? oilGrade : undefined,
      oilType: type === 'oil-change' ? oilType : undefined,
      oilQuantity: type === 'oil-change' ? parseFloat(oilQty) || undefined : undefined,
      nextDueMileage: nextDue,
    });
    haptic('success');
    setCost('');
    setNotes('');
    setOilQty('');
    onClose();
  };

  if (!vehicle) return null;

  return (
    <Sheet visible={visible} onClose={onClose}>
      <ScrollView
        contentContainerStyle={{ padding: space[5], gap: space[4] }}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text variant="title">Log service</Text>
          <Text variant="caption" tone="secondary">{vehicle.nickname}</Text>
        </View>

        <View>
          <Text variant="label" tone="secondary" style={{ marginBottom: space[2] }}>
            SERVICE TYPE
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
            {SERVICE_TYPES.map((t) => (
              <Chip
                key={t.value}
                label={t.label}
                selected={type === t.value}
                onPress={() => setType(t.value)}
              />
            ))}
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: space[3] }}>
          <Input
            label="Odometer"
            placeholder="0"
            keyboardType="number-pad"
            value={odometer}
            onChangeText={setOdometer}
            suffix="km"
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

        {type === 'oil-change' ? (
          <>
            <View>
              <Text variant="label" tone="secondary" style={{ marginBottom: space[2] }}>
                OIL GRADE
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
                {OIL_GRADES.map((g) => (
                  <Chip key={g} label={g} selected={oilGrade === g} onPress={() => setOilGrade(g)} />
                ))}
              </View>
            </View>
            <View>
              <Text variant="label" tone="secondary" style={{ marginBottom: space[2] }}>
                OIL TYPE
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
                {OIL_TYPES.map((o) => (
                  <Chip
                    key={o.value}
                    label={o.label}
                    selected={oilType === o.value}
                    onPress={() => setOilType(o.value)}
                  />
                ))}
              </View>
            </View>
            <Input
              label="Quantity (L)"
              placeholder="4.5"
              keyboardType="decimal-pad"
              value={oilQty}
              onChangeText={setOilQty}
              suffix="L"
            />
          </>
        ) : null}

        <Input
          label="Notes (optional)"
          placeholder="Shop name, parts used, etc."
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        {nextDue ? (
          <View
            style={{
              paddingVertical: space[3],
              paddingHorizontal: space[4],
              borderRadius: 16,
              backgroundColor: 'rgba(182, 242, 77, 0.08)',
            }}
          >
            <Text variant="caption" tone="secondary">Next due at</Text>
            <Text variant="bodyLg" weight="semibold" tone="accent">
              {nextDue.toLocaleString()} km
            </Text>
          </View>
        ) : null}

        <Button label="Save service" onPress={handleSave} disabled={!canSave} size="lg" fullWidth />
      </ScrollView>
    </Sheet>
  );
}