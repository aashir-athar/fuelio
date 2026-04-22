import { useTheme } from '@/src/theme/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Icon map (same icons, unchanged) ────────────────────────────────────────
type TabKey = 'home' | 'fuel' | 'service' | 'analytics' | 'garage';

const ICON_MAP: Record<TabKey, { ios: string; android: keyof typeof Ionicons.glyphMap }> = {
  home: { ios: 'house.fill', android: 'home' },
  fuel: { ios: 'fuelpump.fill', android: 'speedometer' },
  service: { ios: 'wrench.and.screwdriver.fill', android: 'build' },
  analytics: { ios: 'chart.line.uptrend.xyaxis', android: 'analytics' },
  garage: { ios: 'car.2.fill', android: 'car-sport' },
};

function TabIcon({ name, color, focused }: { name: TabKey; color: string; focused: boolean }) {
  const map = ICON_MAP[name];
  if (Platform.OS === 'ios') {
    return (
      <SymbolView
        name={map.ios as any}
        tintColor={color}
        size={22}
        weight={focused ? 'semibold' : 'regular'}
      />
    );
  }
  return <Ionicons name={map.android} size={22} color={color} />;
}

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS: { name: string; key: TabKey; label: string }[] = [
  { name: 'index', key: 'home', label: 'Home' },
  { name: 'fuel', key: 'fuel', label: 'Fuel' },
  { name: 'service', key: 'service', label: 'Service' },
  { name: 'analytics', key: 'analytics', label: 'Analytics' },
  { name: 'garage', key: 'garage', label: 'Garage' },
];

// ─── Pill Tab Bar ─────────────────────────────────────────────────────────────
/**
 * Custom tab bar rendered as a floating pill.
 *
 * Safe-area strategy:
 *  • We read useSafeAreaInsets() for the real bottom inset (home-indicator on
 *    iOS, gesture-nav bar on Android edge-to-edge).
 *  • The pill floats ABOVE the inset; the parent View's paddingBottom absorbs
 *    the inset so nothing is drawn behind system chrome.
 *  • We never hard-code a pixel offset — works on every device.
 */
function PillTabBar({ state, descriptors, navigation }: any) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Pill sits 12 pt above the safe-area bottom
  const floatGap = 12;

  // Outer wrapper: full-width, sits at screen bottom, absorbs safe-area
  const wrapperStyle: ViewStyle = {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: insets.bottom + floatGap,
    paddingHorizontal: 16,
    alignItems: 'center',
    // Transparent — background is handled by the pill itself
    backgroundColor: 'transparent',
    // Android edge-to-edge: ensure we extend into the inset region visually
    ...(Platform.OS === 'android' && { paddingBottom: Math.max(insets.bottom, 8) + floatGap }),
  };

  const pillStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    height: 64,
    borderRadius: 32,                      // full-pill
    backgroundColor: isDark
      ? 'rgba(22, 27, 39, 0.92)'           // dark glass
      : 'rgba(255, 255, 255, 0.92)',       // light glass
    // Soft border
    borderWidth: 1,
    borderColor: isDark
      ? 'rgba(182, 242, 77, 0.10)'
      : 'rgba(0, 0, 0, 0.07)',
    // Depth
    shadowColor: isDark ? '#000' : '#0D1117',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDark ? 0.55 : 0.14,
    shadowRadius: 24,
    elevation: 24,                         // Android shadow
    paddingHorizontal: 8,
    overflow: 'hidden',
  };

  return (
    <View style={wrapperStyle} pointerEvents="box-none">
      <View style={pillStyle}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const tabKey = TABS[index]?.key ?? 'home';
          const label = TABS[index]?.label ?? route.name;

          const activeColor = colors.accent;
          const inactiveColor = isDark ? colors.textMuted : colors.textMuted;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
              android_ripple={{ color: 'transparent' }}
            >
              {/* Active indicator pill behind icon+label */}
              {focused && (
                <View
                  style={[
                    styles.activePill,
                    {
                      backgroundColor: isDark
                        ? 'rgba(182, 242, 77, 0.13)'
                        : 'rgba(141, 200, 39, 0.12)',
                    },
                  ]}
                />
              )}

              <TabIcon name={tabKey} color={focused ? activeColor : inactiveColor} focused={focused} />

              <Text
                style={[
                  styles.label,
                  {
                    color: focused ? activeColor : inactiveColor,
                    fontWeight: focused ? '700' : '500',
                    opacity: focused ? 1 : 0.7,
                  },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 3,
    position: 'relative',
    borderRadius: 24,
    minHeight: 48,           // WCAG touch target
  },
  activePill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    marginHorizontal: 2,
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.2,
    includeFontPadding: false,  // Android: remove extra padding
  },
});

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // The pill is 64 pt tall + floatGap (12) + safe-area bottom + a tiny extra
  // so screen content scrolls far enough to never hide behind the pill.
  const tabBarHeight = 64 + 12 + Math.max(insets.bottom, 8);

  return (
    <Tabs
      tabBar={(props) => <PillTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          paddingBottom: tabBarHeight
        }
        // Push screen content up so it doesn't hide behind the floating pill
      }}
    >
      {TABS.map(({ name, label }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ title: label }}
        />
      ))}
    </Tabs>
  );
}