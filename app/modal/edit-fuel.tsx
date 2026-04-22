import { Button } from '@/src/components/primitives/Button';
import { Chip } from '@/src/components/primitives/Chip';
import { Input } from '@/src/components/primitives/Input';
import { Text } from '@/src/components/primitives/Text';
import { useHaptics } from '@/src/hooks/useHaptics';
import { useFuelStore } from '@/src/store/fuel.store';
import { useSettingsStore } from '@/src/store/settings.store';
import { useTheme } from '@/src/theme/ThemeProvider';
import { space } from '@/src/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditFuelModal() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const entries = useFuelStore((s) => s.entries);
    const updateEntry = useFuelStore((s) => s.updateEntry);
    const deleteEntry = useFuelStore((s) => s.deleteEntry);
    const currency = useSettingsStore((s) => s.currency);
    const haptic = useHaptics();

    const entry = entries.find((e) => e.id === id);
    const [liters, setLiters] = useState(entry ? String(entry.liters) : '');
    const [price, setPrice] = useState(entry ? String(entry.pricePerLiter) : '');
    const [odometer, setOdometer] = useState(entry ? String(entry.odometer) : '');
    const [fullTank, setFullTank] = useState(entry?.fullTank ?? true);
    const [notes, setNotes] = useState(entry?.notes ?? '');

    if (!entry) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Entry not found</Text>
                <Button label="Close" onPress={() => router.back()} style={{ marginTop: space[4] }} />
            </View>
        );
    }

    const handleSave = () => {
        // parseFloat("0") === 0, which is falsy — using `|| fallback` would silently
        // revert a user-typed "0" to the old value. Use NaN-check instead.
        const parsedLiters = parseFloat(liters);
        const parsedPrice = parseFloat(price);
        const parsedOdometer = parseFloat(odometer);

        updateEntry(entry.id, {
            liters: Number.isFinite(parsedLiters) && parsedLiters > 0
                ? parsedLiters
                : entry.liters,
            pricePerLiter: Number.isFinite(parsedPrice) && parsedPrice >= 0
                ? parsedPrice
                : entry.pricePerLiter,
            odometer: Number.isFinite(parsedOdometer) && parsedOdometer >= 0
                ? parsedOdometer
                : entry.odometer,
            fullTank,
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

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.background }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space[5], paddingVertical: space[4] }}>
                <Text variant="heading">Edit entry</Text>
                <Pressable
                    onPress={() => router.back()}
                    style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Ionicons name="close" size={22} color={colors.textPrimary} />
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={{ padding: space[5], gap: space[4], paddingBottom: insets.bottom + space[5] }}
                keyboardShouldPersistTaps="handled"
            >
                <View style={{ flexDirection: 'row', gap: space[3] }}>
                    <Input label="Liters" keyboardType="decimal-pad" value={liters} onChangeText={setLiters} suffix="L" containerStyle={{ flex: 1 }} />
                    <Input label="Price" keyboardType="decimal-pad" value={price} onChangeText={setPrice} suffix={currency} containerStyle={{ flex: 1 }} />
                </View>
                <Input label="Odometer" keyboardType="number-pad" value={odometer} onChangeText={setOdometer} suffix="km" />
                <View style={{ flexDirection: 'row', gap: space[2] }}>
                    <Chip label="Full tank" selected={fullTank} onPress={() => setFullTank(true)} />
                    <Chip label="Partial" selected={!fullTank} onPress={() => setFullTank(false)} />
                </View>
                <Input label="Notes" value={notes} onChangeText={setNotes} multiline />
                <Button label="Save changes" onPress={handleSave} size="lg" fullWidth />
                <Button label="Delete entry" onPress={handleDelete} variant="danger" fullWidth />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}