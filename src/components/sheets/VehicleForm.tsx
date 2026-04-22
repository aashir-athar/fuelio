import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { IMAGES } from '../../constants/images';
import { useHaptics } from '../../hooks/useHaptics';
import { useVehicleStore } from '../../store/vehicle.store';
import { space } from '../../theme/tokens';
import type { FuelType, Vehicle } from '../../types';
import { Avatar } from '../primitives/Avatar';
import { Button } from '../primitives/Button';
import { Chip } from '../primitives/Chip';
import { Input } from '../primitives/Input';
import { Text } from '../primitives/Text';

const FUEL_TYPES: { value: FuelType; label: string }[] = [
    { value: 'petrol', label: 'Petrol' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'cng', label: 'CNG' },
    { value: 'ev', label: 'EV' },
];

interface Props {
    initialVehicle?: Vehicle;
    onDone: () => void;
    submitLabel?: string;
    footerSlot?: React.ReactNode;
}

export function VehicleForm({ initialVehicle, onDone, submitLabel = 'Save Vehicle', footerSlot }: Props) {
    const addVehicle = useVehicleStore((s) => s.addVehicle);
    const updateVehicle = useVehicleStore((s) => s.updateVehicle);
    const haptic = useHaptics();

    const [nickname, setNickname] = useState(initialVehicle?.nickname ?? '');
    const [make, setMake] = useState(initialVehicle?.make ?? '');
    const [model, setModel] = useState(initialVehicle?.model ?? '');
    const [year, setYear] = useState(initialVehicle?.year ? String(initialVehicle.year) : String(new Date().getFullYear()));
    const [fuelType, setFuelType] = useState<FuelType>(initialVehicle?.fuelType ?? 'petrol');
    const [tankCap, setTankCap] = useState(initialVehicle?.tankCapacity ? String(initialVehicle.tankCapacity) : '');
    const [odometer, setOdometer] = useState(initialVehicle?.odometer ? String(initialVehicle.odometer) : '0');
    const [plate, setPlate] = useState(initialVehicle?.licensePlate ?? '');

    const canSave = nickname.trim().length > 0 && make.trim().length > 0 && model.trim().length > 0;

    const handleSave = () => {
        if (!canSave) return;
        const payload = {
            nickname: nickname.trim(),
            make: make.trim(),
            model: model.trim(),
            year: parseInt(year, 10) || new Date().getFullYear(),
            fuelType,
            tankCapacity: parseFloat(tankCap) || 50,
            odometer: parseFloat(odometer) || 0,
            licensePlate: plate.trim() || undefined,
        };
        if (initialVehicle) {
            updateVehicle(initialVehicle.id, payload);
        } else {
            addVehicle(payload);
        }
        haptic('success');
        onDone();
    };

    return (
        <ScrollView
            contentContainerStyle={{ padding: space[6], paddingBottom: space[10], gap: space[4] }}
            keyboardShouldPersistTaps="handled"
        >
            <View style={{ alignItems: 'center', marginBottom: space[3] }}>
                <Avatar source={IMAGES.addVehicle} size={160} tinted={false} />
                <Text variant="title" style={{ marginTop: space[4], textAlign: 'center' }}>
                    {initialVehicle ? 'Edit vehicle' : 'Add your vehicle'}
                </Text>
                <Text variant="body" tone="secondary" style={{ textAlign: 'center', marginTop: space[2], maxWidth: 300 }}>
                    We use this to compute accurate fuel economy and service reminders.
                </Text>
            </View>

            <Input label="Nickname" placeholder="My Civic" value={nickname} onChangeText={setNickname} />
            <View style={{ flexDirection: 'row', gap: space[3] }}>
                <Input label="Make" placeholder="Honda" value={make} onChangeText={setMake} containerStyle={{ flex: 1 }} />
                <Input label="Model" placeholder="Civic" value={model} onChangeText={setModel} containerStyle={{ flex: 1 }} />
            </View>
            <View style={{ flexDirection: 'row', gap: space[3] }}>
                <Input label="Year" placeholder="2022" keyboardType="number-pad" value={year} onChangeText={setYear} containerStyle={{ flex: 1 }} />
                <Input label="Plate" placeholder="ABC-123" value={plate} onChangeText={setPlate} containerStyle={{ flex: 1 }} />
            </View>

            <View>
                <Text variant="label" tone="secondary" style={{ marginBottom: space[2] }}>
                    FUEL TYPE
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
                    {FUEL_TYPES.map((f) => (
                        <Chip key={f.value} label={f.label} selected={fuelType === f.value} onPress={() => setFuelType(f.value)} />
                    ))}
                </View>
            </View>

            <View style={{ flexDirection: 'row', gap: space[3] }}>
                <Input label="Tank (L)" placeholder="50" keyboardType="decimal-pad" value={tankCap} onChangeText={setTankCap} suffix="L" containerStyle={{ flex: 1 }} />
                <Input label="Odometer" placeholder="0" keyboardType="number-pad" value={odometer} onChangeText={setOdometer} suffix="km" containerStyle={{ flex: 1 }} />
            </View>

            <Button label={submitLabel} onPress={handleSave} disabled={!canSave} size="lg" fullWidth style={{ marginTop: space[4] }} />
            {footerSlot}
        </ScrollView>
    );
}