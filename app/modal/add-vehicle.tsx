import { VehicleForm } from '@/src/components/sheets/VehicleForm';
import { useTheme } from '@/src/theme/ThemeProvider';
import { radius, space } from '@/src/theme/tokens';
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
                style={{
                    position: 'absolute',
                    top: insets.top + space[2],
                    right: space[5],
                    width: 44,
                    height: 44,
                    borderRadius: radius.pill,
                    backgroundColor: colors.surfaceElevated,
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                }}
            >
                <Ionicons name="close" size={22} color={colors.textPrimary} />
            </Pressable>
            <VehicleForm onDone={close} />
        </View>
    );
}
