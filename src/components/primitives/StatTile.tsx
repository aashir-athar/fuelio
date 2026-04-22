import React from 'react';
import { type ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { space } from '../../theme/tokens';
import { Card } from './Card';
import { Text } from './Text';

interface Props {
  label: string;
  value: string;
  caption?: string;
  tone?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  compact?: boolean;
  style?: ViewStyle;
}

export const StatTile = React.memo(function StatTile({
  label, value, caption, tone = 'primary', compact = false, style,
}: Props) {
  const { colors } = useTheme();

  const valueColor = (() => {
    switch (tone) {
      case 'accent': return colors.accent;
      case 'success': return colors.success;
      case 'warning': return colors.warning;
      case 'danger': return colors.danger;
      default: return colors.textPrimary;
    }
  })();

  return (
    <Card style={[{ minHeight: compact ? 96 : 112 }, style]}>
      <Text variant="label" tone="secondary" style={{ marginBottom: space[2] }}>
        {label.toUpperCase()}
      </Text>
      <Text variant={compact ? 'heading' : 'title'} style={{ color: valueColor }}>
        {value}
      </Text>
      {caption ? (
        <Text variant="caption" tone="muted" style={{ marginTop: space[1] }}>
          {caption}
        </Text>
      ) : null}
    </Card>
  );
});