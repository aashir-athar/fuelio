import React from 'react';
import { View, type ViewProps, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, space } from '../../theme/tokens';

interface Props extends ViewProps {
  elevated?: boolean;
  padded?: boolean;
  bordered?: boolean;
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export const Card = React.memo(function Card({
  elevated = false,
  padded = true,
  bordered = false,
  children,
  style,
  ...rest
}: Props) {
  const { colors, isDark } = useTheme();

  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: elevated ? colors.surfaceElevated : colors.surface,
          borderRadius: radius.lg,
          padding: padded ? space[5] : 0,
          borderWidth: bordered ? 1 : 0,
          borderColor: colors.divider,
        },
        elevated && !isDark && {
          shadowColor: '#0D1117',
          shadowOpacity: 0.06,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 4,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
});