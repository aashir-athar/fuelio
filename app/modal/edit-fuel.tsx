// Lever: reversibility + control — clear edit affordances and a guarded delete keep
// the user in command of their own data, lowering the cost of logging honestly.
import { Button } from '@/src/components/primitives/Button';
import { Card } from '@/src/components/primitives/Card';
import { Chip } from '@/src/components/primitives/Chip';
import { Input } from '@/src/components/primitives/Input';
import { Text } from '@/src/components/primitives/Text';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useReduceMotion } from '@/src/hooks/useReduceMotion';
import { useFuelStore } from '@/src/store/fuel.store';
import { useSettingsStore } from '@/src/store/settings.store';
import { useTheme } from '@/src/theme/ThemeProvider';
import { accentGlow, fontFamily, space } from '@/src/theme/tokens';
import { formatCurrency } from '@/src/utils/format';
import {
    displayToKm,
    displayToLitres,
    displayToPricePerLitre,
    distanceUnitLabel,
    kmToDisplay,
    litresToDisplay,
    pricePerLitreToDisplay,
    volumeUnitLabel,
} from '@/src/utils/units';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TANK_LEVELS = [
    { label: '¼', value: 0.25 },
    { label: '½', value: 0.5 },
    { label: '¾', value: 0.75 },
    { label: 'Full', value: 1 },
] as const;

export default function EditFuelModal() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const reduceMotion = useReduceMotion();
    const { id } = useLocalSearchParams<{ id: string }>();
    const entries = useFuelStore((s) => s.entries);
    const updateEntry = useFuelStore((s) => s.updateEntry);
    const deleteEntry = useFuelStore((s) => s.deleteEntry);
    const currency = useSettingsStore((s) => s.currency);
    const volumeUnit = useSettingsStore((s) => s.volumeUnit);
    const distanceUnit = useSettingsStore((s) => s.distanceUnit);
    const haptic = useHaptics();

    const entry = entries.find((e) => e.id === id);
    // Stored canonical (L, price/L, km); edit in the user's chosen units.
    const [liters, setLiters] = useState(entry ? String(+litresToDisplay(entry.liters, volumeUnit).toFixed(2)) : '');
    const [price, setPrice] = useState(entry ? String(+pricePerLitreToDisplay(entry.pricePerLiter, volumeUnit).toFixed(3)) : '');
    const [odometer, setOdometer] = useState(entry ? String(Math.round(kmToDisplay(entry.odometer, distanceUnit))) : '');
    const [fullTank, setFullTank] = useState(entry?.fullTank ?? true);
    const [tankLevel, setTankLevel] = useState<number | null>(entry?.tankLevelAfter ?? null);
    const [notes, setNotes] = useState(entry?.notes ?? '');

    if (!entry) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: space[4], paddingHorizontal: space[6] }}>
                <Text variant="title" style={{ textAlign: 'center' }}>Entry not found</Text>
                <Button label="Close" onPress={() => router.back()} fullWidth />
            </View>
        );
    }

    const litersNum = parseFloat(liters) || 0;
    const priceNum = parseFloat(price) || 0;
    const total = Math.round(litersNum * priceNum * 100) / 100;

    const handleSave = () => {
        // parseFloat("0") === 0, which is falsy — using `|| fallback` would silently
        // revert a user-typed "0" to the old value. Use NaN-check instead.
        const parsedLiters = parseFloat(liters);
        const parsedPrice = parseFloat(price);
        const parsedOdometer = parseFloat(odometer);

        updateEntry(entry.id, {
            // Convert valid display-unit input back to canonical; keep the existing
            // canonical value when the field is blank/invalid (don't revert a typed 0).
            liters: Number.isFinite(parsedLiters) && parsedLiters > 0
                ? displayToLitres(parsedLiters, volumeUnit)
                : entry.liters,
            pricePerLiter: Number.isFinite(parsedPrice) && parsedPrice >= 0
                ? displayToPricePerLitre(parsedPrice, volumeUnit)
                : entry.pricePerLiter,
            odometer: Number.isFinite(parsedOdometer) && parsedOdometer >= 0
                ? displayToKm(parsedOdometer, distanceUnit)
                : entry.odometer,
            fullTank,
            tankLevelAfter: !fullTank && tankLevel != null ? tankLevel : undefined,
            notes: notes.trim() || undefined,
        });
        haptic('success');
        router.back();
    };

    const handleDelete = () => {
        Alert.alert('Delete entry?', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    deleteEntry(entry.id);
                    haptic('warning');
                    router.back();
                },
            },
        ]);
    };

    const enter = (delay: number) => (reduceMotion ? undefined : FadeInDown.duration(360).delay(delay));
    const totalStr = formatCurrency(total, currency, 2);

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: space[5], paddingTop: insets.top + space[3], paddingBottom: space[4] }}>
                <View style={{ flex: 1, paddingRight: space[4] }}>
                    <Text variant="micro" tone="secondary">FUEL ENTRY</Text>
                    <Text variant="title" numberOfLines={1} style={{ marginTop: space[1] }}>Edit fill-up</Text>
                </View>
                <Pressable
                    onPress={() => router.back()}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                    hitSlop={8}
                    style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Ionicons name="close" size={22} color={colors.textPrimary} />
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: space[5], paddingTop: space[2], gap: space[5], paddingBottom: insets.bottom + space[6] }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={enter(0)} style={{ gap: space[4] }}>
                    <View style={{ flexDirection: 'row', gap: space[3] }}>
                        <Input label={volumeUnit === 'gallon' ? 'Gallons' : 'Liters'} keyboardType="decimal-pad" value={liters} onChangeText={setLiters} suffix={volumeUnitLabel(volumeUnit)} containerStyle={{ flex: 1 }} />
                        <Input label={`Price / ${volumeUnitLabel(volumeUnit)}`} keyboardType="decimal-pad" value={price} onChangeText={setPrice} suffix={currency} containerStyle={{ flex: 1 }} />
                    </View>
                    <Input label="Odometer" keyboardType="number-pad" value={odometer} onChangeText={setOdometer} suffix={distanceUnitLabel(distanceUnit)} />
                </Animated.View>

                {/* Live lime total */}
                <Animated.View entering={enter(60)}>
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
                            style={{ fontFamily: fontFamily.display, fontSize: 56, lineHeight: 60, letterSpacing: -1.6, color: colors.textOnAccent, marginTop: space[2] }}
                        >
                            {totalStr}
                        </Text>
                    </Card>
                </Animated.View>

                <Animated.View entering={enter(120)} style={{ gap: space[3] }}>
                    <Text variant="label" tone="secondary">FILL TYPE</Text>
                    <View style={{ flexDirection: 'row', gap: space[2] }}>
                        <Chip label="Full tank" selected={fullTank} onPress={() => setFullTank(true)} />
                        <Chip label="Partial" selected={!fullTank} onPress={() => setFullTank(false)} />
                    </View>
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

                <Animated.View entering={enter(180)}>
                    <Input label="Notes" value={notes} onChangeText={setNotes} multiline />
                </Animated.View>

                <Animated.View entering={enter(240)} style={{ gap: space[3], marginTop: space[1] }}>
                    <Button label="Save changes" onPress={handleSave} size="lg" fullWidth />
                    <Button label="Delete entry" onPress={handleDelete} variant="danger" fullWidth />
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
