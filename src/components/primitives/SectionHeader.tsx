import React from 'react';
import { View } from 'react-native';
import { space } from '../../theme/tokens';
import { Text } from './Text';

interface Props {
    title: string;
    action?: React.ReactNode;
}

export const SectionHeader = React.memo(function SectionHeader({ title, action }: Props) {
    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: space[3],
                marginTop: space[5],
            }}
        >
            <Text variant="label" tone="secondary" weight="semibold">
                {title.toUpperCase()}
            </Text>
            {action}
        </View>
    );
});