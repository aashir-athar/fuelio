import { VehicleForm } from '@/src/components/sheets/VehicleForm';
import { useTheme } from '@/src/theme/ThemeProvider';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddFirstVehicleScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: colors.background,
                paddingTop: insets.top,
            }}
        >
            <VehicleForm
                submitLabel="Add My First Vehicle"
                onDone={() => router.replace('/(tabs)')}
            />
        </View>
    );
}