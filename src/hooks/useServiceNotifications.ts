import { useEffect, useMemo } from 'react';
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

  // `reminders` and `stats` are fresh array/object references on every store mutation,
  // so depending on them directly cancels+reschedules the OS queue constantly and can
  // interleave (leaking duplicate notifications). Collapse the inputs that actually
  // affect scheduling into a single STABLE primitive signature: when nothing relevant
  // changed, the string is identical and the effect doesn't re-run.
  const signature = useMemo(() => {
    const reminderSig = reminders
      .map((r) => `${r.type}:${r.nextDueMileage}:${r.remaining}`)
      .join('|');
    const s = stats?.stats;
    // Round km/day inputs into the signature so micro-jitter doesn't churn scheduling,
    // but real data changes still flip it.
    const ratePart = s ? `${Math.round(s.totalDistance)}:${s.avgKmBetweenFills}:${s.avgDaysBetweenFills}` : 'none';
    return `${vehicle?.nickname ?? ''}#${reminderSig}#${ratePart}`;
  }, [reminders, stats, vehicle?.nickname]);

  useEffect(() => {
    let active = true;
    // ~800 ms debounce: coalesce bursts of store mutations into a single reschedule so
    // we never cancel a half-scheduled batch midway and leave duplicate OS notifications.
    const timer = setTimeout(() => {
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
          entries: stats?.entries,
        });
      })().catch(() => {
        // Notifications are best-effort; never block the app on them.
      });
    }, 800);
    return () => {
      active = false;
      clearTimeout(timer);
    };
    // Intentionally keyed on the stable `signature` (plus `enabled`), NOT the raw
    // `reminders`/`stats` references, so unrelated store writes don't trigger a reschedule.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, enabled]);
}
