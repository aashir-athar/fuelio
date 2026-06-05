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

type Tone = 'danger' | 'warning' | 'accent';

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

    const tone: Tone = overdue ? 'danger' : kmRemaining < 500 ? 'warning' : 'accent';
    const toneColor =
        tone === 'danger' ? colors.danger :
            tone === 'warning' ? colors.warning :
                colors.accent;
    const toneTextTone = tone === 'danger' ? 'danger' : tone === 'warning' ? 'warning' : 'accent';

    const remaining = formatDistance(Math.abs(kmRemaining), distanceUnit);

    return (
        <Card elevated style={{ flexDirection: 'row', alignItems: 'center', gap: space[4] }}>
            {/* Status rail carries the urgency cue as color, not chrome — pre-attentive scan. */}
            <View
                style={{
                    width: 4,
                    alignSelf: 'stretch',
                    borderRadius: radius.pill,
                    backgroundColor: toneColor,
                }}
            />
            <Avatar source={IMAGES.oilChange} size={52} tinted />
            <View style={{ flex: 1 }}>
                <Text variant="bodyLg" weight="semibold" numberOfLines={1}>{title}</Text>
                <Text variant="caption" tone="secondary" style={{ marginTop: 2 }}>
                    {overdue ? `Overdue by ${remaining}` : `Due in ${remaining}`}
                </Text>
            </View>
            <View
                style={{
                    paddingHorizontal: space[3],
                    paddingVertical: space[1],
                    borderWidth: 1,
                    borderColor: toneColor,
                    backgroundColor: colors.surface,
                    borderRadius: radius.pill,
                }}
            >
                <Text variant="micro" weight="bold" tone={toneTextTone}>
                    {overdue ? 'OVERDUE' : 'SOON'}
                </Text>
            </View>
        </Card>
    );
});
