import React from 'react';
import { View } from 'react-native';
import { IMAGES } from '../../constants/images';
import { useSettingsStore } from '../../store/settings.store';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, space } from '../../theme/tokens';
import { formatDistance } from '../../utils/format';
import { Avatar } from '../primitives/Avatar';
import { Card } from '../primitives/Card';
import { Text } from '../primitives/Text';

interface Props {
    title: string;
    kmRemaining: number;
    overdue?: boolean;
}

export const ServiceReminderCard = React.memo(function ServiceReminderCard({
    title, kmRemaining, overdue = false,
}: Props) {
    const { colors } = useTheme();
    const distanceUnit = useSettingsStore((s) => s.distanceUnit);

    const tone = overdue ? 'danger' : kmRemaining < 500 ? 'warning' : 'accent';
    const tintBg =
        tone === 'danger' ? 'rgba(255, 71, 87, 0.12)' :
            tone === 'warning' ? 'rgba(255, 159, 28, 0.12)' :
                colors.accentMuted;

    return (
        <Card elevated style={{ flexDirection: 'row', alignItems: 'center', gap: space[4] }}>
            <Avatar source={IMAGES.oilChange} size={56} tinted />
            <View style={{ flex: 1 }}>
                <Text variant="bodyLg" weight="semibold" numberOfLines={1}>{title}</Text>
                <Text variant="caption" tone="secondary" style={{ marginTop: 2 }}>
                    {overdue
                        ? `Overdue by ${formatDistance(Math.abs(kmRemaining), distanceUnit)}`
                        : `Due in ${formatDistance(kmRemaining, distanceUnit)}`}
                </Text>
            </View>
            <View
                style={{
                    paddingHorizontal: space[3],
                    paddingVertical: space[2],
                    backgroundColor: tintBg,
                    borderRadius: radius.pill,
                }}
            >
                <Text variant="micro" weight="bold" tone={tone}>
                    {overdue ? 'OVERDUE' : 'SOON'}
                </Text>
            </View>
        </Card>
    );
});