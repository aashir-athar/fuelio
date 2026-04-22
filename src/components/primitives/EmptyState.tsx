import React from 'react';
import { View, type ImageSourcePropType } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { space } from '../../theme/tokens';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Text } from './Text';

interface Props {
    image: ImageSourcePropType;
    title: string;
    subtitle?: string;
    ctaLabel?: string;
    onCta?: () => void;
}

/**
 * Empty state with character art.
 * Psychology: personifying empty states reduces frustration and invites action.
 */
export const EmptyState = React.memo(function EmptyState({
    image, title, subtitle, ctaLabel, onCta,
}: Props) {
    return (
        <Animated.View
            entering={FadeIn.duration(360)}
            style={{ alignItems: 'center', paddingVertical: space[10], paddingHorizontal: space[6] }}
        >
            <Avatar source={image} size={160} tinted={false} />
            <Text variant="heading" style={{ textAlign: 'center', marginTop: space[5] }}>
                {title}
            </Text>
            {subtitle ? (
                <Text
                    variant="body"
                    tone="secondary"
                    style={{ textAlign: 'center', marginTop: space[2], maxWidth: 300 }}
                >
                    {subtitle}
                </Text>
            ) : null}
            {ctaLabel && onCta ? (
                <View style={{ marginTop: space[6] }}>
                    <Button label={ctaLabel} onPress={onCta} variant="primary" size="lg" />
                </View>
            ) : null}
        </Animated.View>
    );
});