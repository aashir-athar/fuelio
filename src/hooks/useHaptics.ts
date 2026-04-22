import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { Platform } from 'react-native';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

/**
 * Centralized haptic dispatcher. No-ops on web.
 * Psychology: crisp haptic = trust signal + perceived responsiveness.
 */
export function useHaptics() {
    return useCallback((type: HapticType = 'light') => {
        if (Platform.OS === 'web') return;
        try {
            switch (type) {
                case 'light':
                    return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                case 'medium':
                    return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                case 'heavy':
                    return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                case 'success':
                    return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                case 'warning':
                    return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                case 'error':
                    return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                case 'selection':
                    return Haptics.selectionAsync();
            }
        } catch {
            /* swallow — haptics are a nice-to-have */
        }
    }, []);
}