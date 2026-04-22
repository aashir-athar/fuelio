import { useTheme } from '@/src/theme/ThemeProvider';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';

/**
 * Root redirect — the actual gating happens in _layout.tsx.
 * This file exists only so Expo Router has a root route to mount.
 */
export default function Index() {
  const { colors } = useTheme();
  const router = useRouter();

  useEffect(() => {
    router.replace('/(tabs)');
  }, [router]);

  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
}