import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { useHaptics } from '../../hooks/useHaptics';
import { useFuelStore } from '../../store/fuel.store';
import { useSettingsStore } from '../../store/settings.store';
import { space } from '../../theme/tokens';
import { formatCurrency } from '../../utils/format';
import { Button } from '../primitives/Button';
import { Chip } from '../primitives/Chip';
import { Input } from '../primitives/Input';
import { Sheet } from '../primitives/Sheet';
import { Text } from '../primitives/Text';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export function AddFuelSheet({ visible, onClose }: Props) {
    const vehicle = useActiveVehicle();
    const addEntry = useFuelStore((s) => s.addEntry);
    const currency = useSettingsStore((s) => s.currency);
    const volumeUnit = useSettingsStore((s) => s.volumeUnit);
    const haptic = useHaptics();

    const [liters, setLiters] = useState('');
    const [price, setPrice] = useState('');
    const [odometer, setOdometer] = useState(vehicle ? String(vehicle.odometer) : '');
    const [fullTank, setFullTank] = useState(true);
    const [notes, setNotes] = useState('');

    const litersNum = parseFloat(liters) || 0;
    const priceNum = parseFloat(price) || 0;
    const odoNum = parseFloat(odometer) || 0;
    // Use multiply-round-divide instead of toFixed to avoid floating-point drift
    const total = Math.round(litersNum * priceNum * 100) / 100;
    const canSave = litersNum > 0 && priceNum > 0 && odoNum > 0 && vehicle !== null;

    React.useEffect(() => {
        if (visible && vehicle) setOdometer(String(vehicle.odometer));
    }, [visible, vehicle]);

    const handleSave = () => {
        if (!canSave || !vehicle) return;
        addEntry({
            vehicleId: vehicle.id,
            date: Date.now(),
            liters: litersNum,
            pricePerLiter: priceNum,
            odometer: odoNum,
            fullTank,
            notes: notes.trim() || undefined,
        });
        haptic('success');
        setLiters('');
        setPrice('');
        setNotes('');
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
                    <Text variant="title">Log fuel</Text>
                    <Text variant="caption" tone="secondary">{vehicle.nickname}</Text>
                </View>

                <View style={{ flexDirection: 'row', gap: space[3] }}>
                    <Input
                        label={volumeUnit === 'gallon' ? 'Gallons' : 'Liters'}
                        placeholder="0"
                        keyboardType="decimal-pad"
                        value={liters}
                        onChangeText={setLiters}
                        suffix={volumeUnit === 'gallon' ? 'gal' : 'L'}
                        containerStyle={{ flex: 1 }}
                    />
                    <Input
                        label={`Price per ${volumeUnit === 'gallon' ? 'gallon' : 'liter'}`}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        value={price}
                        onChangeText={setPrice}
                        suffix={currency}
                        containerStyle={{ flex: 1 }}
                    />
                </View>

                <Input
                    label="Odometer"
                    placeholder="0"
                    keyboardType="number-pad"
                    value={odometer}
                    onChangeText={setOdometer}
                    suffix="km"
                />

                <View style={{ flexDirection: 'row', gap: space[2] }}>
                    <Chip label="Full tank" selected={fullTank} onPress={() => setFullTank(true)} />
                    <Chip label="Partial fill" selected={!fullTank} onPress={() => setFullTank(false)} />
                </View>

                <Input
                    label="Notes (optional)"
                    placeholder="Gas station name, route, anything..."
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                />

                <View
                    style={{
                        paddingVertical: space[4],
                        paddingHorizontal: space[5],
                        borderRadius: 16,
                        backgroundColor: 'rgba(182, 242, 77, 0.08)',
                        alignItems: 'center',
                    }}
                >
                    <Text variant="label" tone="secondary">TOTAL</Text>
                    <Text variant="title" tone="accent" style={{ marginTop: space[1] }}>
                        {formatCurrency(total, currency, 2)}
                    </Text>
                </View>

                <Button
                    label="Save fuel entry"
                    onPress={handleSave}
                    disabled={!canSave}
                    size="lg"
                    fullWidth
                />
            </ScrollView>
        </Sheet>
    );
}