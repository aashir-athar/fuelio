// Lever: loss aversion + goal gradient — a big confident distance number and a thin
// status bar that empties as service nears makes "don't let this lapse" feel tangible.
import React from 'react';
import { View } from 'react-native';
import { IMAGES } from '../../constants/images';
import { useSettingsStore } from '../../store/settings.store';
import { useTheme } from '../../theme/ThemeProvider';
import { fontFamily, radius, space } from '../../theme/tokens';
import { formatDistance } from '../../utils/format';
import { Avatar } from '../primitives/Avatar';
import { Card } from '../primitives/Card';
import { Text } from '../primitives/Text';

type Tone = 'danger' | 'warning' | 'accent';

// The reminder lead-time window used to scale the progress bar (km). Once a service
// gets this far out it reads as "full"; the bar drains toward the due point.
const WINDOW_KM = 5000;

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

    // Distance string carries its unit (e.g. "412 km"); split so the number reads big.
    const remainingStr = formatDistance(Math.abs(kmRemaining), distanceUnit);
    const [remainingValue, ...unitParts] = remainingStr.split(' ');
    const remainingUnit = unitParts.join(' ');

    // Bar fills with how much runway is left; overdue clamps to empty.
    const fill = overdue ? 0 : Math.max(0.06, Math.min(1, kmRemaining / WINDOW_KM));

    return (
        <Card tone="elevated">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[4] }}>
                <Avatar source={IMAGES.oilChange} size={52} tinted />
                <View style={{ flex: 1 }}>
                    <Text variant="micro" tone="muted">{overdue ? 'OVERDUE SERVICE' : 'NEXT SERVICE'}</Text>
                    <Text variant="heading" numberOfLines={1} style={{ marginTop: 2 }}>{title}</Text>
                </View>
                <View
                    style={{
                        paddingHorizontal: space[3],
                        paddingVertical: 5,
                        backgroundColor: toneColor,
                        borderRadius: radius.pill,
                    }}
                >
                    <Text variant="micro" weight="bold" tone="onAccent">
                        {overdue ? 'OVERDUE' : 'SOON'}
                    </Text>
                </View>
            </View>

            <View style={{ marginTop: space[5], flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space[2] }}>
                    <Text style={{ fontFamily: fontFamily.display, fontSize: 40, lineHeight: 42, letterSpacing: -1, color: toneColor }}>
                        {remainingValue}
                    </Text>
                    <Text variant="bodyLg" weight="semibold" tone="secondary">{remainingUnit}</Text>
                </View>
                <Text variant="caption" tone="secondary" style={{ marginBottom: 4 }}>
                    {overdue ? 'past due' : 'remaining'}
                </Text>
            </View>

            <View
                style={{
                    height: 6,
                    borderRadius: radius.pill,
                    backgroundColor: colors.divider,
                    marginTop: space[3],
                    overflow: 'hidden',
                }}
            >
                <View
                    style={{
                        width: `${Math.round(fill * 100)}%`,
                        minWidth: overdue ? 0 : 6,
                        height: '100%',
                        borderRadius: radius.pill,
                        backgroundColor: toneColor,
                    }}
                />
            </View>

            <Text variant="micro" tone={toneTextTone} weight="semibold" style={{ marginTop: space[3] }}>
                {overdue
                    ? `Past due by ${remainingStr} — book it in`
                    : `Service in about ${remainingStr}`}
            </Text>
        </Card>
    );
});
