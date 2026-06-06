// Lever: reversibility + planning — inline validation and a lime "next due" card turn
// editing into forward-looking maintenance, not bookkeeping; delete stays guarded.
import { Button } from '@/src/components/primitives/Button';
import { Card } from '@/src/components/primitives/Card';
import { Chip } from '@/src/components/primitives/Chip';
import { Input } from '@/src/components/primitives/Input';
import { Text } from '@/src/components/primitives/Text';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useReduceMotion } from '@/src/hooks/useReduceMotion';
import { useServiceStore } from '@/src/store/service.store';
import { useSettingsStore } from '@/src/store/settings.store';
import { useTheme } from '@/src/theme/ThemeProvider';
import { accentGlow, fontFamily, space } from '@/src/theme/tokens';
import type { OilGrade, OilType, ServiceType } from '@/src/types';
import { formatDistance } from '@/src/utils/format';
import {
    displayToKm,
    displayToLitres,
    distanceUnitLabel,
    kmToDisplay,
    litresToDisplay,
    volumeUnitLabel,
} from '@/src/utils/units';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Constants ───────────────────────────────────────────────────────────────

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

const OIL_GRADES: OilGrade[] = [
    '0W-20', '0W-30', '5W-20', '5W-30', '5W-40',
    '10W-30', '10W-40', '15W-40', '20W-50',
];

const OIL_TYPES: { value: OilType; label: string }[] = [
    { value: 'fully-synthetic', label: 'Fully Synthetic' },
    { value: 'semi-synthetic', label: 'Semi Synthetic' },
    { value: 'mineral', label: 'Mineral' },
];

// ─── Validation helpers ───────────────────────────────────────────────────────

/** Parse a user-supplied number string; returns NaN when blank or non-numeric. */
function parsePositive(raw: string): number {
    const n = parseFloat(raw.trim());
    return Number.isFinite(n) && n >= 0 ? n : NaN;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditServiceModal() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const reduceMotion = useReduceMotion();
    const haptic = useHaptics();

    const { id } = useLocalSearchParams<{ id: string }>();
    const entries = useServiceStore((s) => s.entries);
    const updateEntry = useServiceStore((s) => s.updateEntry);
    const deleteEntry = useServiceStore((s) => s.deleteEntry);
    const currency = useSettingsStore((s) => s.currency);
    const distanceUnit = useSettingsStore((s) => s.distanceUnit);
    const volumeUnit = useSettingsStore((s) => s.volumeUnit);

    const entry = entries.find((e) => e.id === id);

    // ── Local form state (canonical km/L stored; edited in the user's units) ────
    const [type, setType] = useState<ServiceType>(entry?.type ?? 'oil-change');
    const [odometer, setOdometer] = useState(entry ? String(Math.round(kmToDisplay(entry.odometer, distanceUnit))) : '');
    const [cost, setCost] = useState(entry ? String(entry.cost) : '');
    const [notes, setNotes] = useState(entry?.notes ?? '');
    const [oilGrade, setOilGrade] = useState<OilGrade>(entry?.oilGrade ?? '5W-30');
    const [oilType, setOilType] = useState<OilType>(entry?.oilType ?? 'fully-synthetic');
    const [oilQty, setOilQty] = useState(entry?.oilQuantity ? String(+litresToDisplay(entry.oilQuantity, volumeUnit).toFixed(2)) : '');

    // ── Validation ────────────────────────────────────────────────────────────
    const odoNum = parsePositive(odometer);
    const costNum = parsePositive(cost);

    const odometerError: string | undefined = (() => {
        if (odometer === '') return undefined; // not yet touched
        if (isNaN(odoNum)) return 'Enter a valid odometer reading';
        if (odoNum <= 0) return 'Odometer must be greater than 0';
        return undefined;
    })();

    const costError: string | undefined = (() => {
        if (cost === '') return undefined;
        if (isNaN(costNum)) return 'Enter a valid cost';
        return undefined;
    })();

    const canSave =
        !isNaN(odoNum) &&
        odoNum > 0 &&
        !isNaN(costNum) &&
        odometerError === undefined &&
        costError === undefined;

    // ── Entry guard ───────────────────────────────────────────────────────────
    if (!entry) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: colors.background,
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: space[4],
                    paddingHorizontal: space[6],
                }}
            >
                <Text variant="title" style={{ textAlign: 'center' }}>Entry not found</Text>
                <Button label="Close" onPress={() => router.back()} fullWidth />
            </View>
        );
    }

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleSave = () => {
        if (!canSave) return;

        const selectedServiceType = SERVICE_TYPES.find((t) => t.value === type);
        const odoCanonical = displayToKm(odoNum, distanceUnit);
        const nextDueMileage =
            selectedServiceType ? odoCanonical + selectedServiceType.interval : entry.nextDueMileage;
        const qty = parsePositive(oilQty);

        updateEntry(entry.id, {
            type,
            odometer: odoCanonical,
            cost: costNum,
            notes: notes.trim() || undefined,
            oilGrade: type === 'oil-change' ? oilGrade : undefined,
            oilType: type === 'oil-change' ? oilType : undefined,
            oilQuantity:
                type === 'oil-change' && Number.isFinite(qty) && qty > 0
                    ? displayToLitres(qty, volumeUnit)
                    : undefined,
            nextDueMileage,
        });

        haptic('success');
        router.back();
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete service entry?',
            'This action cannot be undone.',
            [
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
            ],
        );
    };

    // ── Computed next-due preview ─────────────────────────────────────────────
    const selectedServiceType = SERVICE_TYPES.find((t) => t.value === type);
    const previewNextDue =
        !isNaN(odoNum) && odoNum > 0 && selectedServiceType
            ? displayToKm(odoNum, distanceUnit) + selectedServiceType.interval
            : null;

    const enter = (delay: number) => (reduceMotion ? undefined : FadeInDown.duration(360).delay(delay));
    const nextDueParts = previewNextDue !== null ? formatDistance(previewNextDue, distanceUnit).split(' ') : null;
    const nextDueNumber = nextDueParts ? nextDueParts[0] : '';
    const nextDueUnit = nextDueParts ? nextDueParts.slice(1).join(' ') : '';

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    paddingHorizontal: space[5],
                    paddingTop: insets.top + space[3],
                    paddingBottom: space[4],
                }}
            >
                <View style={{ flex: 1, paddingRight: space[4] }}>
                    <Text variant="micro" tone="secondary">SERVICE ENTRY</Text>
                    <Text variant="title" numberOfLines={1} style={{ marginTop: space[1] }}>Edit service</Text>
                </View>
                <Pressable
                    onPress={() => router.back()}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                    hitSlop={8}
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: colors.surfaceElevated,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Ionicons name="close" size={22} color={colors.textPrimary} />
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: space[5],
                    paddingTop: space[2],
                    gap: space[5],
                    paddingBottom: insets.bottom + space[6],
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Service type selector */}
                <Animated.View entering={enter(0)} style={{ gap: space[3] }}>
                    <Text variant="label" tone="secondary">SERVICE TYPE</Text>
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
                </Animated.View>

                {/* Odometer + Cost */}
                <Animated.View entering={enter(60)}>
                    <View style={{ flexDirection: 'row', gap: space[3] }}>
                        <Input
                            label="Odometer"
                            keyboardType="number-pad"
                            value={odometer}
                            onChangeText={setOdometer}
                            suffix={distanceUnitLabel(distanceUnit)}
                            error={odometerError}
                            containerStyle={{ flex: 1 }}
                        />
                        <Input
                            label="Cost"
                            keyboardType="decimal-pad"
                            value={cost}
                            onChangeText={setCost}
                            suffix={currency}
                            error={costError}
                            containerStyle={{ flex: 1 }}
                        />
                    </View>
                </Animated.View>

                {/* Oil-change specific fields */}
                {type === 'oil-change' ? (
                    <Animated.View entering={enter(120)} style={{ gap: space[5] }}>
                        <View style={{ gap: space[3] }}>
                            <Text variant="label" tone="secondary">OIL GRADE</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
                                {OIL_GRADES.map((g) => (
                                    <Chip
                                        key={g}
                                        label={g}
                                        selected={oilGrade === g}
                                        onPress={() => setOilGrade(g)}
                                    />
                                ))}
                            </View>
                        </View>

                        <View style={{ gap: space[3] }}>
                            <Text variant="label" tone="secondary">OIL TYPE</Text>
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
                            label={`Quantity (${volumeUnitLabel(volumeUnit)})`}
                            placeholder="4.5"
                            keyboardType="decimal-pad"
                            value={oilQty}
                            onChangeText={setOilQty}
                            suffix={volumeUnitLabel(volumeUnit)}
                        />
                    </Animated.View>
                ) : null}

                {/* Notes */}
                <Animated.View entering={enter(160)}>
                    <Input
                        label="Notes (optional)"
                        placeholder="Shop name, parts used, etc."
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                    />
                </Animated.View>

                {/* Next-due preview — lime card */}
                {previewNextDue !== null ? (
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

                {/* Actions */}
                <Animated.View entering={enter(200)} style={{ gap: space[3], marginTop: space[1] }}>
                    <Button
                        label="Save changes"
                        onPress={handleSave}
                        disabled={!canSave}
                        size="lg"
                        fullWidth
                    />
                    <Button
                        label="Delete entry"
                        onPress={handleDelete}
                        variant="danger"
                        fullWidth
                    />
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
