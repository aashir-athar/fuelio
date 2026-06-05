import { useTheme } from '@/src/theme/ThemeProvider';
import React from 'react';
import { View } from 'react-native';

/**
 * Root route placeholder. All gating/redirects happen in the single navigation
 * guard in _layout.tsx; this just gives Expo Router a mountable '/' that the guard
 * immediately routes away from once the stores have hydrated. (Previously this
 * hard-redirected to /(tabs), which raced the guard and could leak a non-onboarded
 * user into the tabs.)
 */
export default function Index() {
  const { colors } = useTheme();
  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
}
