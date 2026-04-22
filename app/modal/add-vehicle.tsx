import { VehicleForm } from '@/src/components/sheets/VehicleForm';
import { useTheme } from '@/src/theme/ThemeProvider';
import { space } from '@/src/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddVehicleModal() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Pressable
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Close"
                style={{
                    position: 'absolute',
                    top: space[3],
                    right: space[5],
                    width: 40, height: 40, borderRadius: 20,
                    backgroundColor: colors.surfaceElevated,
                    alignItems: 'center', justifyContent: 'center',
                    zIndex: 10,
                }}
            >
                <Ionicons name="close" size={22} color={colors.textPrimary} />
            </Pressable>
            <VehicleForm onDone={() => router.back()} />
        </View>
    );
}