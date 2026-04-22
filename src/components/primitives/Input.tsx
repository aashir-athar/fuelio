import React, { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { font, radius, space } from '../../theme/tokens';
import { Text } from './Text';

interface Props extends Omit<TextInputProps, 'style'> {
  label?: string;
  suffix?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input = React.memo(function Input({
  label,
  suffix,
  error,
  containerStyle,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={containerStyle}>
      {label ? (
        <Text variant="label" tone="secondary" style={{ marginBottom: space[2] }}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.wrap,
          {
            backgroundColor: colors.inputBackground,
            borderColor: error ? colors.danger : focused ? colors.accent : colors.divider,
          },
        ]}
      >
        <TextInput
          {...rest}
          placeholderTextColor={colors.textMuted}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, { color: colors.textPrimary }]}
        />
        {suffix ? (
          <Text variant="body" tone="secondary" style={{ marginLeft: space[2] }}>
            {suffix}
          </Text>
        ) : null}
      </View>
      {error ? (
        <Text variant="caption" tone="danger" style={{ marginTop: space[1] }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: space[4],
  },
  input: {
    flex: 1,
    fontSize: font.size.md,
    fontWeight: font.weight.medium,
    padding: 0,
  },
});