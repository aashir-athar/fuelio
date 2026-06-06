import { VehicleForm } from '@/src/components/sheets/VehicleForm';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddVehicleModal() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const close = useCallback(() => router.back(), [router]);

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Pressable
                onPress={close}
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={8}
                style={({ pressed }) => ({
                    position: 'absolute',
                    top: insets.top + 8,
                    right: 20,
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: colors.surfaceElevated,
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    transform: [{ scale: pressed ? 0.94 : 1 }],
                })}
            >
                <Ionicons name="close" size={24} color={colors.textPrimary} />
            </Pressable>
            <VehicleForm onDone={close} />
        </View>
    );
}
