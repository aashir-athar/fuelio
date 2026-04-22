import { useTheme } from '@/src/theme/ThemeProvider';
import { Stack } from 'expo-router';

export default function ModalLayout() {
    const { colors } = useTheme();
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                animation: 'slide_from_bottom',
            }}
        />
    );
}