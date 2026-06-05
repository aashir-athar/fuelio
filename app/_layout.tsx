import '@/src/services/locationTask'; // registers the background station-watch task (must load at startup)
import { useServiceNotifications } from '@/src/hooks/useServiceNotifications';
import { resumeStationDetection } from '@/src/services/location';
import { configureNotificationHandler } from '@/src/services/notifications';
import { useStoreHydration } from '@/src/store/hydration';
import { useSettingsStore } from '@/src/store/settings.store';
import { useUiStore } from '@/src/store/ui.store';
import { useVehicleStore } from '@/src/store/vehicle.store';
import { ThemeProvider, useTheme } from '@/src/theme/ThemeProvider';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync().catch(() => {});
configureNotificationHandler();

function RootNav() {
  const { colors, isDark } = useTheme();
  const hydrated = useStoreHydration();
  const router = useRouter();
  const segments = useSegments();
  const hasOnboarded = useSettingsStore((s) => s.hasCompletedOnboarding);
  const vehicleCount = useVehicleStore((s) => s.vehicles.length);
  const locationEnabled = useSettingsStore((s) => s.locationPromptEnabled);

  // Keep OS-scheduled service reminders in sync with the data.
  useServiceNotifications();

  // Resume the opt-in station watch if the user enabled it previously (no prompt).
  useEffect(() => {
    if (!hydrated || !locationEnabled) return;
    resumeStationDetection().catch(() => {});
  }, [hydrated, locationEnabled]);

  useEffect(() => {
    if (!hydrated) return;
    SplashScreen.hideAsync().catch(() => {});
  }, [hydrated]);

  // Route the user when they tap a notification (foreground + cold-start).
  useEffect(() => {
    if (!hydrated) return;
    const handle = (response: Notifications.NotificationResponse | null) => {
      const kind = response?.notification.request.content.data?.kind;
      if (kind === 'fueling-prompt') {
        router.navigate('/(tabs)');
        useUiStore.getState().requestLogFuel();
      } else if (kind === 'service-reminder') {
        router.navigate('/(tabs)/service');
      }
    };
    Notifications.getLastNotificationResponseAsync().then(handle).catch(() => {});
    const sub = Notifications.addNotificationResponseReceivedListener(handle);
    return () => sub.remove();
  }, [hydrated, router]);

  useEffect(() => {
    if (!hydrated) return;
    const inOnboarding = segments[0] === '(onboarding)';
    const inTabs = segments[0] === '(tabs)';
    const inModal = segments[0] === 'modal';

    if (!hasOnboarded && !inOnboarding) {
      router.replace('/(onboarding)/welcome');
    } else if (hasOnboarded && vehicleCount === 0 && !inOnboarding && !inModal) {
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