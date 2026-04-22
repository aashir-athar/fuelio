import React, { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useHaptics } from '../../hooks/useHaptics';
import { useReduceMotion } from '../../hooks/useReduceMotion';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, space, spring } from '../../theme/tokens';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button = React.memo(function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  accessibilityHint,
}: Props) {
  const { colors } = useTheme();
  const haptic = useHaptics();
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(1);

  const heights: Record<Size, number> = { sm: 38, md: 48, lg: 56 };
  const paddings: Record<Size, number> = { sm: space[4], md: space[5], lg: space[6] };

  const bg = (() => {
    if (variant === 'primary') return colors.accent;
    if (variant === 'danger') return 'transparent';
    if (variant === 'secondary') return colors.surfaceElevated;
    return 'transparent';
  })();

  const borderColor = variant === 'danger' ? colors.danger : 'transparent';
  const textTone = variant === 'primary' ? 'onAccent' : variant === 'danger' ? 'danger' : 'primary';

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = useCallback(() => {
    if (!reduceMotion) scale.value = withSpring(0.96, spring.snappy);
    haptic('light');
  }, [haptic, reduceMotion, scale]);

  const handlePressOut = useCallback(() => {
    if (!reduceMotion) scale.value = withSpring(1, spring.snappy);
  }, [reduceMotion, scale]);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={[
        animStyle,
        styles.base,
        {
          height: heights[size],
          paddingHorizontal: paddings[size],
          backgroundColor: disabled ? colors.surfaceElevated : bg,
          borderColor,
          borderWidth: variant === 'danger' ? 1.5 : 0,
          alignSelf: fullWidth ? 'stretch' : 'auto',
          opacity: disabled ? 0.5 : 1,
        },
        variant === 'primary' && !disabled && {
          shadowColor: colors.accent,
          shadowOpacity: 0.28,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.textOnAccent : colors.accent} />
      ) : (
        <>
          {leftIcon}
          <Text variant={size === 'lg' ? 'bodyLg' : 'body'} weight="semibold" tone={textTone}>
            {label}
          </Text>
          {rightIcon}
        </>
      )}
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    gap: space[2],
  },
});