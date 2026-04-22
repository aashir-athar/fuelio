import { useStoreHydration } from '@/src/store/hydration';
import { useSettingsStore } from '@/src/store/settings.store';
import { useVehicleStore } from '@/src/store/vehicle.store';
import { ThemeProvider, useTheme } from '@/src/theme/ThemeProvider';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNav() {
  const { colors, isDark } = useTheme();
  const hydrated = useStoreHydration();
  const router = useRouter();
  const segments = useSegments();
  const hasOnboarded = useSettingsStore((s) => s.hasCompletedOnboarding);
  const vehicleCount = useVehicleStore((s) => s.vehicles.length);

  useEffect(() => {
    if (!hydrated) return;
    SplashScreen.hideAsync().catch(() => {});
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const inOnboarding = segments[0] === '(onboarding)';
    const inTabs = segments[0] === '(tabs)';
    const inModal = segments[0] === 'modal';

    if (!hasOnboarded && !inOnboarding) {
      router.replace('/(onboarding)/welcome');
    } else if (hasOnboarded && vehicleCount === 0 && !inOnboarding) {
      router.replace('/(onboarding)/add-first-vehicle');
    } else if (hasOnboarded && vehicleCount > 0 && !inTabs && !inModal) {
      router.replace('/(tabs)');
    }
  }, [hydrated, hasOnboarded, vehicleCount, segments, router]);

  if (!hydrated) return null;

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootNav />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}