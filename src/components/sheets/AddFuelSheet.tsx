import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { useHaptics } from '../../hooks/useHaptics';
import { useFuelStore } from '../../store/fuel.store';
import { useSettingsStore } from '../../store/settings.store';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, space } from '../../theme/tokens';
import { formatCurrency } from '../../utils/format';
import {
    displayToKm,
    displayToLitres,
    displayToPricePerLitre,
    distanceUnitLabel,
    kmToDisplay,
    volumeUnitLabel,
} from '../../utils/units';
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
    const { colors } = useTheme();
    const vehicle = useActiveVehicle();
    const addEntry = useFuelStore((s) => s.addEntry);
    const currency = useSettingsStore((s) => s.currency);
    const volumeUnit = useSettingsStore((s) => s.volumeUnit);
    const distanceUnit = useSettingsStore((s) => s.distanceUnit);
    const haptic = useHaptics();

    // Odometer is stored canonical (km); show it in the user's distance unit.
    const seedOdometer = vehicle ? String(Math.round(kmToDisplay(vehicle.odometer, distanceUnit))) : '';
    const [liters, setLiters] = useState('');
    const [price, setPrice] = useState('');
    const [odometer, setOdometer] = useState(seedOdometer);
    const [fullTank, setFullTank] = useState(true);
    const [notes, setNotes] = useState('');

    const litersNum = parseFloat(liters) || 0;
    const priceNum = parseFloat(price) || 0;
    const odoNum = parseFloat(odometer) || 0;
    // Cost is unit-invariant: gallons × price/gallon === litres × price/litre.
    const total = Math.round(litersNum * priceNum * 100) / 100;
    const canSave = litersNum > 0 && priceNum > 0 && odoNum > 0 && vehicle !== null;

    React.useEffect(() => {
        if (visible && vehicle) {
            setOdometer(String(Math.round(kmToDisplay(vehicle.odometer, distanceUnit))));
        }
    }, [visible, vehicle, distanceUnit]);

    const handleSave = () => {
        if (!canSave || !vehicle) return;
        addEntry({
            vehicleId: vehicle.id,
            date: Date.now(),
            // Convert the user's display units back to canonical before storing.
            liters: displayToLitres(litersNum, volumeUnit),
            pricePerLiter: displayToPricePerLitre(priceNum, volumeUnit),
            odometer: displayToKm(odoNum, distanceUnit),
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
                        suffix={volumeUnitLabel(volumeUnit)}
                        containerStyle={{ flex: 1 }}
                    />
                    <Input
                        label={`Price / ${volumeUnitLabel(volumeUnit)}`}
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
                    suffix={distanceUnitLabel(distanceUnit)}
                />

                <View>
                    <View style={{ flexDirection: 'row', gap: space[2] }}>
                        <Chip label="Full tank" selected={fullTank} onPress={() => setFullTank(true)} />
                        <Chip label="Partial fill" selected={!fullTank} onPress={() => setFullTank(false)} />
                    </View>
                    <Text variant="caption" tone="muted" style={{ marginTop: space[2] }}>
                        {fullTank
                            ? 'Filled to the top — this is what measures your real economy.'
                            : "Didn't fill all the way? This rolls into your next full-tank reading."}
                    </Text>
                </View>

                <Input
                    label="Notes (optional)"
                    placeholder="Station, route, anything worth remembering"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                />

                <View
                    style={{
                        paddingVertical: space[4],
                        paddingHorizontal: space[5],
                        borderRadius: radius.lg,
                        backgroundColor: colors.accentSoft,
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
