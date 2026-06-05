import React from 'react';
import { Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { font, fontFamily } from '../../theme/tokens';

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

// Custom fonts don't respond to fontWeight — map a requested weight to its Inter family.
const WEIGHT_FAMILY: Record<keyof typeof font.weight, string> = {
    regular: fontFamily.regular,
    medium: fontFamily.medium,
    semibold: fontFamily.semibold,
    bold: fontFamily.bold,
    heavy: fontFamily.bold,
};

// Variants that use the Manjari display family (weight prop is ignored for these).
const DISPLAY_VARIANTS: ReadonlySet<Variant> = new Set(['display', 'title', 'heading']);

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
                return { fontFamily: fontFamily.display, fontSize: font.size.display, letterSpacing: -1.5, lineHeight: font.size.display * 1.02 };
            case 'title':
                return { fontFamily: fontFamily.display, fontSize: font.size.xxl, letterSpacing: -0.8, lineHeight: font.size.xxl * 1.06 };
            case 'heading':
                return { fontFamily: fontFamily.display, fontSize: font.size.xl, letterSpacing: -0.4, lineHeight: font.size.xl * 1.12 };
            case 'bodyLg':
                return { fontFamily: fontFamily.regular, fontSize: font.size.md, lineHeight: 25 };
            case 'body':
                return { fontFamily: fontFamily.regular, fontSize: font.size.base, lineHeight: 22 };
            case 'label':
                return { fontFamily: fontFamily.semibold, fontSize: font.size.xs, letterSpacing: 1.1, lineHeight: 16 };
            case 'caption':
                return { fontFamily: fontFamily.regular, fontSize: font.size.sm, lineHeight: 18 };
            case 'micro':
                return { fontFamily: fontFamily.medium, fontSize: font.size.xs, letterSpacing: 0.6, lineHeight: 14 };
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

    // Weight overrides the family only for Inter (body/label) variants.
    const weightFamily = weight && !DISPLAY_VARIANTS.has(variant) ? { fontFamily: WEIGHT_FAMILY[weight] } : null;

    return (
        <RNText
            {...rest}
            style={[variantStyle, { color }, weightFamily, style]}
        >
            {children}
        </RNText>
    );
});
