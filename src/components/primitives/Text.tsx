import React from 'react';
import { Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { font } from '../../theme/tokens';

type Variant =
    | 'display'
    | 'title'
    | 'heading'
    | 'body'
    | 'bodyLg'
    | 'caption'
    | 'micro'
    | 'label';
type Tone = 'primary' | 'secondary' | 'muted' | 'accent' | 'success' | 'danger' | 'warning' | 'onAccent';

interface Props extends TextProps {
    variant?: Variant;
    tone?: Tone;
    weight?: keyof typeof font.weight;
    children?: React.ReactNode;
}

export const Text = React.memo(function Text({
    variant = 'body',
    tone = 'primary',
    weight,
    style,
    children,
    ...rest
}: Props) {
    const { colors } = useTheme();

    const variantStyle: TextStyle = (() => {
        switch (variant) {
            case 'display':
                return { fontSize: font.size.display, fontWeight: font.weight.heavy, letterSpacing: font.letter.tight, lineHeight: 48 };
            case 'title':
                return { fontSize: font.size.xxl, fontWeight: font.weight.bold, letterSpacing: font.letter.tight, lineHeight: 38 };
            case 'heading':
                return { fontSize: font.size.xl, fontWeight: font.weight.bold, letterSpacing: font.letter.tight, lineHeight: 30 };
            case 'bodyLg':
                return { fontSize: font.size.md, fontWeight: font.weight.regular, lineHeight: 24 };
            case 'body':
                return { fontSize: font.size.base, fontWeight: font.weight.regular, lineHeight: 22 };
            case 'label':
                return { fontSize: font.size.sm, fontWeight: font.weight.semibold, letterSpacing: font.letter.wide, lineHeight: 18 };
            case 'caption':
                return { fontSize: font.size.sm, fontWeight: font.weight.regular, lineHeight: 18 };
            case 'micro':
                return { fontSize: font.size.xs, fontWeight: font.weight.medium, letterSpacing: font.letter.wide, lineHeight: 14 };
        }
    })();

    const color = (() => {
        switch (tone) {
            case 'primary': return colors.textPrimary;
            case 'secondary': return colors.textSecondary;
            case 'muted': return colors.textMuted;
            case 'accent': return colors.accent;
            case 'success': return colors.success;
            case 'danger': return colors.danger;
            case 'warning': return colors.warning;
            case 'onAccent': return colors.textOnAccent;
        }
    })();

    return (
        <RNText
            {...rest}
            style={[
                variantStyle,
                { color },
                weight ? { fontWeight: font.weight[weight] } : null,
                style,
            ]}
        >
            {children}
        </RNText>
    );
});