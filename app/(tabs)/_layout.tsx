import { useTheme } from '@/src/theme/ThemeProvider';
import { accentGlow, radius, space } from '@/src/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React from 'react';
import { Platform, Pressable, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    return <SymbolView name={map.ios as never} tintColor={color} size={23} weight={focused ? 'bold' : 'regular'} />;
  }
  return <Ionicons name={map.android} size={23} color={color} />;
}

const TABS: { name: string; key: TabKey; label: string }[] = [
  { name: 'index', key: 'home', label: 'Home' },
  { name: 'fuel', key: 'fuel', label: 'Fuel' },
  { name: 'service', key: 'service', label: 'Service' },
  { name: 'analytics', key: 'analytics', label: 'Analytics' },
  { name: 'garage', key: 'garage', label: 'Garage' },
];

const PILL_HEIGHT = 76;

/**
 * Floating tab dock (Pilo style): a charcoal pill holding five circular slots. The
 * active slot is a solid lime circle with a black icon; inactive slots are muted icons.
 */
function PiloTabBar({ state, navigation }: any) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const wrapper: ViewStyle = {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: Math.max(insets.bottom, 10) + 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  };

  return (
    <View style={wrapper} pointerEvents="box-none">
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space[1],
          paddingHorizontal: space[2],
          height: PILL_HEIGHT,
          borderRadius: radius.pill,
          backgroundColor: colors.surfaceElevated,
          borderWidth: 1,
          borderColor: colors.divider,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: isDark ? 0.5 : 0.16,
          shadowRadius: 24,
          elevation: 20,
        }}
      >
        {state.routes.map((route: { key: string; name: string }, index: number) => {
          const focused = state.index === index;
          const tabKey = TABS[index]?.key ?? 'home';

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={TABS[index]?.label}
              onPress={onPress}
              style={[
                {
                  width: 54,
                  height: 54,
                  borderRadius: 27,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: focused ? colors.accent : 'transparent',
                },
                focused && accentGlow(colors.accent),
              ]}
            >
              <TabIcon name={tabKey} color={focused ? colors.textOnAccent : colors.textMuted} focused={focused} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = PILL_HEIGHT + 20 + Math.max(insets.bottom, 10);

  return (
    <Tabs
      tabBar={(props) => <PiloTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { paddingBottom: tabBarHeight },
      }}
    >
      {TABS.map(({ name, label }) => (
        <Tabs.Screen key={name} name={name} options={{ title: label }} />
      ))}
    </Tabs>
  );
}
