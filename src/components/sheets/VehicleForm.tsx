// Lever: commitment + endowment — naming the car and seeing its avatar first makes
// the vehicle feel owned, so the few fields that follow read as care, not chore.
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { IMAGES } from '../../constants/images';
import { useHaptics } from '../../hooks/useHaptics';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import { useSettingsStore } from '../../store/settings.store';
import { useVehicleStore } from '../../store/vehicle.store';
import { space } from '../../theme/tokens';
import type { FuelType, Vehicle } from '../../types';
import {
    displayToKm,
    displayToLitres,
    distanceUnitLabel,
    kmToDisplay,
    litresToDisplay,
    volumeUnitLabel,
} from '../../utils/units';
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
    /** When false, the form's own avatar+title header is hidden (the host screen provides one). */
    showHeader?: boolean;
}

export function VehicleForm({ initialVehicle, onDone, submitLabel = 'Save Vehicle', footerSlot, showHeader = true }: Props) {
    const reduceMotion = useReduceMotion();
    const addVehicle = useVehicleStore((s) => s.addVehicle);
    const updateVehicle = useVehicleStore((s) => s.updateVehicle);
    const distanceUnit = useSettingsStore((s) => s.distanceUnit);
    const volumeUnit = useSettingsStore((s) => s.volumeUnit);
    const haptic = useHaptics();

    const [nickname, setNickname] = useState(initialVehicle?.nickname ?? '');
    const [make, setMake] = useState(initialVehicle?.make ?? '');
    const [model, setModel] = useState(initialVehicle?.model ?? '');
    const [year, setYear] = useState(initialVehicle?.year ? String(initialVehicle.year) : String(new Date().getFullYear()));
    const [fuelType, setFuelType] = useState<FuelType>(initialVehicle?.fuelType ?? 'petrol');
    const [tankCap, setTankCap] = useState(initialVehicle?.tankCapacity ? String(+litresToDisplay(initialVehicle.tankCapacity, volumeUnit).toFixed(2)) : '');
    const [odometer, setOdometer] = useState(initialVehicle?.odometer ? String(Math.round(kmToDisplay(initialVehicle.odometer, distanceUnit))) : '0');
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
            tankCapacity: (() => {
                const v = parseFloat(tankCap);
                return Number.isFinite(v) && v > 0 ? displayToLitres(v, volumeUnit) : 50;
            })(),
            odometer: (() => {
                const v = parseFloat(odometer);
                return Number.isFinite(v) && v >= 0 ? displayToKm(v, distanceUnit) : 0;
            })(),
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

    const enter = (delay: number) => (reduceMotion ? undefined : FadeInDown.duration(360).delay(delay));

    return (
        <ScrollView
            contentContainerStyle={{ paddingHorizontal: space[5], paddingTop: space[5], paddingBottom: space[10], gap: space[5] }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            {showHeader ? (
                <Animated.View entering={enter(0)} style={{ alignItems: 'center', marginBottom: space[2] }}>
                    <Avatar source={IMAGES.addVehicle} size={148} tinted={false} />
                    <Text variant="micro" tone="secondary" style={{ marginTop: space[4] }}>
                        {initialVehicle ? 'EDIT VEHICLE' : 'NEW VEHICLE'}
                    </Text>
                    <Text variant="display" style={{ marginTop: space[1], textAlign: 'center' }}>
                        {initialVehicle ? 'Your ride' : 'Add a ride'}
                    </Text>
                    <Text variant="body" tone="secondary" style={{ textAlign: 'center', marginTop: space[2], maxWidth: 300 }}>
                        We use this to compute accurate fuel economy and service reminders.
                    </Text>
                </Animated.View>
            ) : null}

            <Animated.View entering={enter(60)} style={{ gap: space[4] }}>
                <Input label="Nickname" placeholder="My Civic" value={nickname} onChangeText={setNickname} />
                <View style={{ flexDirection: 'row', gap: space[3] }}>
                    <Input label="Make" placeholder="Honda" value={make} onChangeText={setMake} containerStyle={{ flex: 1 }} />
                    <Input label="Model" placeholder="Civic" value={model} onChangeText={setModel} containerStyle={{ flex: 1 }} />
                </View>
                <View style={{ flexDirection: 'row', gap: space[3] }}>
                    <Input label="Year" placeholder="2022" keyboardType="number-pad" value={year} onChangeText={setYear} containerStyle={{ flex: 1 }} />
                    <Input label="Plate" placeholder="ABC-123" value={plate} onChangeText={setPlate} containerStyle={{ flex: 1 }} />
                </View>
            </Animated.View>

            <Animated.View entering={enter(120)} style={{ gap: space[3] }}>
                <Text variant="label" tone="secondary">FUEL TYPE</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
                    {FUEL_TYPES.map((f) => (
                        <Chip key={f.value} label={f.label} selected={fuelType === f.value} onPress={() => setFuelType(f.value)} />
                    ))}
                </View>
            </Animated.View>

            <Animated.View entering={enter(180)}>
                <View style={{ flexDirection: 'row', gap: space[3] }}>
                    <Input label={`Tank (${volumeUnitLabel(volumeUnit)})`} placeholder="50" keyboardType="decimal-pad" value={tankCap} onChangeText={setTankCap} suffix={volumeUnitLabel(volumeUnit)} containerStyle={{ flex: 1 }} />
                    <Input label="Odometer" placeholder="0" keyboardType="number-pad" value={odometer} onChangeText={setOdometer} suffix={distanceUnitLabel(distanceUnit)} containerStyle={{ flex: 1 }} />
                </View>
            </Animated.View>

            <Animated.View entering={enter(240)} style={{ marginTop: space[2], gap: space[3] }}>
                <Button label={submitLabel} onPress={handleSave} disabled={!canSave} size="lg" fullWidth />
                {footerSlot}
            </Animated.View>
        </ScrollView>
    );
}
