import React from 'react';
import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius as radiusTokens, space } from '../../theme/tokens';

type CardTone = 'surface' | 'elevated' | 'lime' | 'outline';

interface Props extends ViewProps {
  /** surface (default), elevated (charcoal), lime (accent fill), outline (border only). */
  tone?: CardTone;
  /** back-compat: maps to tone 'elevated'. */
  elevated?: boolean;
  padded?: boolean;
  bordered?: boolean;
  radius?: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Card = React.memo(function Card({
  tone,
  elevated = false,
  padded = true,
  bordered = false,
  radius,
  children,
  style,
  ...rest
}: Props) {
  const { colors, isDark } = useTheme();
  const t: CardTone = tone ?? (elevated ? 'elevated' : 'surface');
  const bg =
    t === 'lime' ? colors.accent
      : t === 'elevated' ? colors.surfaceElevated
        : t === 'outline' ? 'transparent'
          : colors.surface;
  const r = radius ?? radiusTokens.xl;

  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: bg,
          borderRadius: r,
          padding: padded ? space[5] : 0,
          borderWidth: bordered || t === 'outline' ? 1 : 0,
          borderColor: colors.divider,
        },
        t === 'elevated' && !isDark && {
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
