import React from 'react';
import { Pressable, View } from 'react-native';
import { useSettingsStore } from '../../store/settings.store';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, space } from '../../theme/tokens';
import { formatCurrency, formatDistance, formatEfficiency, formatRelativeDate, formatVolume } from '../../utils/format';
import type { ComputedFuelEntry } from '../../utils/fuelAlgorithm';
import { Text } from '../primitives/Text';

interface Props {
    entry: ComputedFuelEntry;
    onPress?: () => void;
}

export const FuelEntryRow = React.memo(function FuelEntryRow({ entry, onPress }: Props) {
    const { colors } = useTheme();
    const { distanceUnit, volumeUnit, currency } = useSettingsStore();

    const hasAnomaly = entry.anomalies.length > 0;

    const effColor =
        hasAnomaly ? colors.warning :
            !entry.isEfficiencyValid ? colors.textMuted :
                entry.efficiency > 14 ? colors.success :
                    entry.efficiency > 10 ? colors.accent :
                        colors.warning;

    const iconBgColor = hasAnomaly ? 'rgba(255,159,28,0.12)' : colors.accentSoft;
    const iconTextTone = hasAnomaly ? 'warning' : 'accent';

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: space[4],
                paddingVertical: space[4],
                paddingHorizontal: space[5],
                backgroundColor: pressed ? colors.surfaceElevated : colors.surface,
                borderRadius: radius.md,
            })}
        >
            <View
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: radius.md,
                    backgroundColor: iconBgColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Text variant="bodyLg" weight="bold" tone={iconTextTone}>
                    {formatVolume(entry.liters, volumeUnit).split(' ')[0]}
                </Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text variant="body" weight="semibold">
                    {formatCurrency(entry.totalCost, currency, 2)}
                </Text>
                <Text variant="caption" tone="secondary" style={{ marginTop: 2 }}>
                    {formatRelativeDate(entry.date)} · {formatDistance(entry.odometer, distanceUnit)}
                </Text>
                {hasAnomaly ? (
                    <Text variant="micro" tone="warning" style={{ marginTop: 2 }}>
                        ⚠ {anomalyLabel(entry.anomalies[0]!)}
                    </Text>
                ) : null}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text variant="body" weight="semibold" style={{ color: effColor }}>
                    {entry.isEfficiencyValid
                        ? `${entry.isEfficiencyEstimated ? '~' : ''}${formatEfficiency(entry.efficiency, distanceUnit)}`
                        : '—'}
                </Text>
                <Text variant="micro" tone="muted" style={{ marginTop: 2 }}>
                    {entry.fullTank ? 'FULL' : 'PARTIAL'}
                </Text>
            </View>
        </Pressable>
    );
});

function anomalyLabel(reason: ComputedFuelEntry['anomalies'][number]): string {
    switch (reason) {
        case 'odometer_regression': return 'Odometer went back';
        case 'duplicate_odometer': return 'Same odometer reading';
        case 'excessive_distance': return 'Unusually large distance';
        case 'overfill': return 'Exceeds tank capacity';
        case 'implausible_efficiency': return 'Unusual efficiency';
    }
}