import { Image } from 'expo-image';
import React from 'react';
import { View, type ImageSourcePropType, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface Props {
  source: ImageSourcePropType;
  size?: number;
  style?: ViewStyle;
  tinted?: boolean;
}

export const Avatar = React.memo(function Avatar({ source, size = 56, style, tinted = true }: Props) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: tinted ? colors.accentSoft : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Image
        source={source}
        style={{ width: size * 0.9, height: size * 0.9 }}
        contentFit="contain"
        transition={180}
      />
    </View>
  );
});