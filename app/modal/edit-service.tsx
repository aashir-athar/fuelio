import { Button } from '@/src/components/primitives/Button';
import { Chip } from '@/src/components/primitives/Chip';
import { Input } from '@/src/components/primitives/Input';
import { Text } from '@/src/components/primitives/Text';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useServiceStore } from '@/src/store/service.store';
import { useSettingsStore } from '@/src/store/settings.store';
import { useTheme } from '@/src/theme/ThemeProvider';
import { space } from '@/src/theme/tokens';
import type { OilGrade, OilType, ServiceType } from '@/src/types';
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
    const haptic = useHaptics();

    const { id } = useLocalSearchParams<{ id: string }>();
    const entries = useServiceStore((s) => s.entries);
    const updateEntry = useServiceStore((s) => s.updateEntry);
    const deleteEntry = useServiceStore((s) => s.deleteEntry);
    const currency = useSettingsStore((s) => s.currency);

    const entry = entries.find((e) => e.id === id);

    // ── Local form state ──────────────────────────────────────────────────────
    const [type, setType] = useState<ServiceType>(entry?.type ?? 'oil-change');
    const [odometer, setOdometer] = useState(entry ? String(entry.odometer) : '');
    const [cost, setCost] = useState(entry ? String(entry.cost) : '');
    const [notes, setNotes] = useState(entry?.notes ?? '');
    const [oilGrade, setOilGrade] = useState<OilGrade>(entry?.oilGrade ?? '5W-30');
    const [oilType, setOilType] = useState<OilType>(entry?.oilType ?? 'fully-synthetic');
    const [oilQty, setOilQty] = useState(entry?.oilQuantity ? String(entry.oilQuantity) : '');

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
                }}
            >
                <Text>Entry not found.</Text>
                <Button label="Close" onPress={() => router.back()} />
            </View>
        );
    }

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleSave = () => {
        if (!canSave) return;

        const selectedServiceType = SERVICE_TYPES.find((t) => t.value === type);
        const nextDueMileage =
            selectedServiceType ? odoNum + selectedServiceType.interval : entry.nextDueMileage;

        updateEntry(entry.id, {
            type,
            odometer: odoNum,
            cost: costNum,
            notes: notes.trim() || undefined,
            oilGrade: type === 'oil-change' ? oilGrade : undefined,
            oilType: type === 'oil-change' ? oilType : undefined,
            oilQuantity:
                type === 'oil-change'
                    ? parsePositive(oilQty) || undefined
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
            ? odoNum + selectedServiceType.interval
            : null;

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
                    alignItems: 'center',
                    paddingHorizontal: space[5],
                    paddingVertical: space[4],
                }}
            >
                <Text variant="heading">Edit service</Text>
                <Pressable
                    onPress={() => router.back()}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
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
                    padding: space[5],
                    gap: space[4],
                    paddingBottom: insets.bottom + space[5],
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Service type selector */}
                <View>
                    <Text
                        variant="label"
                        tone="secondary"
                        style={{ marginBottom: space[2] }}
                    >
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

                {/* Odometer + Cost */}
                <View style={{ flexDirection: 'row', gap: space[3] }}>
                    <Input
                        label="Odometer"
                        keyboardType="number-pad"
                        value={odometer}
                        onChangeText={setOdometer}
                        suffix="km"
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

                {/* Oil-change specific fields */}
                {type === 'oil-change' ? (
                    <>
                        <View>
                            <Text
                                variant="label"
                                tone="secondary"
                                style={{ marginBottom: space[2] }}
                            >
                                OIL GRADE
                            </Text>
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

                        <View>
                            <Text
                                variant="label"
                                tone="secondary"
                                style={{ marginBottom: space[2] }}
                            >
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

                {/* Notes */}
                <Input
                    label="Notes (optional)"
                    placeholder="Shop name, parts used, etc."
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                />

                {/* Next-due preview */}
                {previewNextDue !== null ? (
                    <View
                        style={{
                            paddingVertical: space[3],
                            paddingHorizontal: space[4],
                            borderRadius: 16,
                            backgroundColor: 'rgba(182, 242, 77, 0.08)',
                        }}
                    >
                        <Text variant="caption" tone="secondary">
                            Next due at
                        </Text>
                        <Text variant="bodyLg" weight="semibold" tone="accent">
                            {previewNextDue.toLocaleString()} km
                        </Text>
                    </View>
                ) : null}

                {/* Actions */}
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
            </ScrollView>
        </KeyboardAvoidingView>
    );
}