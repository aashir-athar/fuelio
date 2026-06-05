import React, { useEffect } from 'react';
import { type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import { useTheme } from '../../theme/ThemeProvider';
import { radius as radiusTokens } from '../../theme/tokens';

interface Props {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Shimmer placeholder shaped like the content it stands in for.
 * Uses a cheap opacity pulse (no gradient/mask) so it stays smooth on low-end
 * Android, and holds a static dim value under Reduce Motion.
 */
export const Skeleton = React.memo(function Skeleton({
  width = '100%',
  height = 16,
  radius = radiusTokens.sm,
  style,
}: Props) {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const pulse = useSharedValue(0.55);

  useEffect(() => {
    if (reduceMotion) {
      pulse.value = 0.6;
      return;
    }
    pulse.value = withRepeat(
      withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse, reduceMotion]);

  const animStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        { width, height, borderRadius: radius, backgroundColor: colors.surfaceElevated },
        animStyle,
        style,
      ]}
    />
  );
});
