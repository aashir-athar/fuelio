// Lever: progressive disclosure + peak-end — the lime total card grows as the user
// types, turning data entry into a live, satisfying payoff before they commit.
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useActiveVehicle } from '../../hooks/useActiveVehicle';
import { useHaptics } from '../../hooks/useHaptics';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import { useFuelStore } from '../../store/fuel.store';
import { useSettingsStore } from '../../store/settings.store';
import { useTheme } from '../../theme/ThemeProvider';
import { accentGlow, fontFamily, space } from '../../theme/tokens';
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
import { Card } from '../primitives/Card';
import { Chip } from '../primitives/Chip';
import { Input } from '../primitives/Input';
import { Sheet } from '../primitives/Sheet';
import { Text } from '../primitives/Text';

interface Props {
    visible: boolean;
    onClose: () => void;
}

/** Fuel-gauge marks for the optional "tank level after a partial fill" input. */
const TANK_LEVELS = [
    { label: '¼', value: 0.25 },
    { label: '½', value: 0.5 },
    { label: '¾', value: 0.75 },
    { label: 'Full', value: 1 },
] as const;

export function AddFuelSheet({ visible, onClose }: Props) {
    const { colors } = useTheme();
    const reduceMotion = useReduceMotion();
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
    const [tankLevel, setTankLevel] = useState<number | null>(null);
    const [notes, setNotes] = useState('');

    const litersNum = parseFloat(liters) || 0;
    const priceNum = parseFloat(price) || 0;
    const odoNum = parseFloat(odometer) || 0;
    // Cost is unit-invariant: gallons × price/gallon === litres × price/litre.
    const total = Math.round(litersNum * priceNum * 100) / 100;
    const canSave = litersNum > 0 && priceNum > 0 && odoNum > 0 && vehicle !== null;

    // Re-seed the odometer each time the sheet opens (React render-time reset pattern;
    // avoids calling setState inside an effect).
    const [wasVisible, setWasVisible] = useState(visible);
    if (visible !== wasVisible) {
        setWasVisible(visible);
        if (visible && vehicle) setOdometer(seedOdometer);
    }

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
            tankLevelAfter: !fullTank && tankLevel != null ? tankLevel : undefined,
            notes: notes.trim() || undefined,
        });
        haptic('success');
        setLiters('');
        setPrice('');
        setNotes('');
        setTankLevel(null);
        onClose();
    };

    if (!vehicle) return null;

    const enter = (delay: number) => (reduceMotion ? undefined : FadeInDown.duration(360).delay(delay));
    const totalStr = formatCurrency(total, currency, 2);

    return (
        <Sheet visible={visible} onClose={onClose}>
            <ScrollView
                contentContainerStyle={{ paddingHorizontal: space[5], paddingTop: space[2], paddingBottom: space[6], gap: space[5] }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={enter(0)}>
                    <Text variant="micro" tone="secondary">LOG A FILL-UP</Text>
                    <Text variant="display" numberOfLines={1} style={{ marginTop: space[1] }}>New tank</Text>
                    <Text variant="caption" tone="secondary" style={{ marginTop: space[1] }}>{vehicle.nickname}</Text>
                </Animated.View>

                <Animated.View entering={enter(60)} style={{ gap: space[4] }}>
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
                </Animated.View>

                {/* Live lime total — the hero of the sheet */}
                <Animated.View entering={enter(120)}>
                    <Card tone="lime" style={[{ overflow: 'hidden' }, accentGlow(colors.accent)]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Text variant="micro" tone="onAccent" style={{ opacity: 0.65 }}>TOTAL THIS FILL</Text>
                            {litersNum > 0 ? (
                                <Text variant="micro" tone="onAccent" weight="semibold" style={{ opacity: 0.8 }}>
                                    {liters || '0'} {volumeUnitLabel(volumeUnit)}
                                </Text>
                            ) : null}
                        </View>
                        <Text
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            style={{ fontFamily: fontFamily.display, fontSize: 60, lineHeight: 64, letterSpacing: -1.6, color: colors.textOnAccent, marginTop: space[2] }}
                        >
                            {totalStr}
                        </Text>
                    </Card>
                </Animated.View>

                {/* Fill type — Full / Partial pills */}
                <Animated.View entering={enter(180)} style={{ gap: space[3] }}>
                    <Text variant="label" tone="secondary">FILL TYPE</Text>
                    <View style={{ flexDirection: 'row', gap: space[2] }}>
                        <Chip label="Full tank" selected={fullTank} onPress={() => setFullTank(true)} />
                        <Chip label="Partial fill" selected={!fullTank} onPress={() => setFullTank(false)} />
                    </View>
                    <Text variant="caption" tone="muted">
                        {fullTank
                            ? 'Filled to the top. This is what measures your real economy.'
                            : 'Set the tank level after filling for an exact reading, or leave it and it rolls into your next full tank.'}
                    </Text>
                    {fullTank ? null : (
                        <View style={{ gap: space[3], marginTop: space[1] }}>
                            <Text variant="label" tone="secondary">TANK LEVEL NOW (OPTIONAL)</Text>
                            <View style={{ flexDirection: 'row', gap: space[2] }}>
                                {TANK_LEVELS.map((l) => (
                                    <Chip
                                        key={l.value}
                                        label={l.label}
                                        selected={tankLevel === l.value}
                                        onPress={() => setTankLevel(tankLevel === l.value ? null : l.value)}
                                        style={{ flex: 1, alignItems: 'center' }}
                                    />
                                ))}
                            </View>
                        </View>
                    )}
                </Animated.View>

                <Animated.View entering={enter(240)}>
                    <Input
                        label="Notes (optional)"
                        placeholder="Station, route, anything worth remembering"
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                    />
                </Animated.View>

                <Animated.View entering={enter(300)} style={{ marginTop: space[1] }}>
                    <Button
                        label="Save fuel entry"
                        onPress={handleSave}
                        disabled={!canSave}
                        size="lg"
                        fullWidth
                    />
                </Animated.View>
            </ScrollView>
        </Sheet>
    );
}
