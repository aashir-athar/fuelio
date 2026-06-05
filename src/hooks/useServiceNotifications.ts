import { useEffect } from 'react';
import { ensureAndroidChannels, requestNotificationPermission, rescheduleServiceReminders } from '../services/notifications';
import { useSettingsStore } from '../store/settings.store';
import { useActiveVehicle } from './useActiveVehicle';
import { useServiceReminders } from './useServiceReminders';
import { useVehicleStats } from './useVehicleStats';

/**
 * Keeps OS-scheduled service-reminder notifications in sync with the active
 * vehicle's data. Reschedules whenever reminders, driving stats, or the user's
 * notification preference change. Mount once near the app root.
 */
export function useServiceNotifications(): void {
  const enabled = useSettingsStore((s) => s.notificationsEnabled);
  const vehicle = useActiveVehicle();
  const reminders = useServiceReminders(vehicle?.id);
  const stats = useVehicleStats(vehicle?.id);

  useEffect(() => {
    let active = true;
    (async () => {
      await ensureAndroidChannels();
      if (!active) return;
      // Ask for permission only when reminders actually exist (a relevant moment,
      // e.g. right after logging a service) — prompts at most once.
      if (enabled && reminders.length > 0) {
        await requestNotificationPermission();
        if (!active) return;
      }
      await rescheduleServiceReminders({
        enabled,
        vehicleName: vehicle?.nickname ?? 'Your vehicle',
        reminders,
        stats: stats?.stats ?? null,
      });
    })().catch(() => {
      // Notifications are best-effort; never block the app on them.
    });
    return () => {
      active = false;
    };
  }, [enabled, vehicle?.nickname, reminders, stats]);
}
