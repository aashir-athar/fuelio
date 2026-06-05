import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { ServiceReminder } from '../hooks/useServiceReminders';
import type { EfficiencyStat } from '../types';
import { serviceTypeLabel } from '../utils/serviceLabels';

/**
 * Local, OS-scheduled notifications — they fire even when the app is fully killed
 * (no server, stays offline). Two uses:
 *   1. Service reminders: mileage-based, so we estimate the calendar date the vehicle
 *      will reach the due odometer from its own km/day rate and schedule a dated
 *      trigger. Rescheduled whenever the data changes.
 *   2. "Are you fueling?" prompts (fired immediately from the geofence task).
 */

export const SERVICE_CHANNEL_ID = 'service-reminders';
export const FUELING_CHANNEL_ID = 'fueling-prompts';

const KIND_SERVICE = 'service-reminder';
const KIND_FUELING = 'fueling-prompt';
const MS_PER_DAY = 86_400_000;
/** Don't schedule reminders further out than this (keeps the OS queue sane). */
const MAX_HORIZON_DAYS = 730;

/** Foreground presentation. Call once at app start. */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** Android requires channels (8.0+) or notifications are silently dropped. */
export async function ensureAndroidChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(SERVICE_CHANNEL_ID, {
    name: 'Service reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 120, 200],
  });
  await Notifications.setNotificationChannelAsync(FUELING_CHANNEL_ID, {
    name: 'Fuel-up prompts',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function hasNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/** Request permission (idempotent). Returns whether it's granted. */
export async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.status === 'granted') return true;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted || next.status === 'granted';
}

async function cancelByKind(kind: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.content.data?.kind === kind)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

/**
 * Reschedule all service-reminder notifications for the active vehicle. Cancels any
 * previously scheduled ones first so edits/new fills don't pile up duplicates.
 */
export async function rescheduleServiceReminders(params: {
  enabled: boolean;
  vehicleName: string;
  reminders: ServiceReminder[];
  stats: EfficiencyStat | null;
}): Promise<void> {
  await cancelByKind(KIND_SERVICE);
  if (!params.enabled) return;
  if (!(await hasNotificationPermission())) return;

  const { stats, vehicleName } = params;
  const kmPerDay =
    stats && stats.avgDaysBetweenFills > 0 ? stats.avgKmBetweenFills / stats.avgDaysBetweenFills : 0;

  for (const r of params.reminders) {
    const label = serviceTypeLabel(r.type);

    if (r.remaining <= 0) {
      // Already due — surface it shortly (survives an immediate app kill).
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${label} is due`,
          body: `${vehicleName} has reached its ${label.toLowerCase()} interval. Time to book it in.`,
          data: { kind: KIND_SERVICE, type: r.type },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 5,
          channelId: SERVICE_CHANNEL_ID,
        },
      });
      continue;
    }

    if (kmPerDay <= 0) continue; // not enough driving history to estimate a date yet

    const days = r.remaining / kmPerDay;
    if (days > MAX_HORIZON_DAYS) continue;
    // Nudge a little before it's actually due.
    const fireInDays = Math.max(0.02, days - 3);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${label} coming up`,
        body: `${vehicleName}: ${label.toLowerCase()} is due in about ${Math.round(r.remaining).toLocaleString()} km.`,
        data: { kind: KIND_SERVICE, type: r.type },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(Date.now() + fireInDays * MS_PER_DAY),
        channelId: SERVICE_CHANNEL_ID,
      },
    });
  }
}

/** Fired by the geofence task when the user appears to be at a fuel station. */
export async function notifyAtFuelStation(stationName?: string): Promise<void> {
  if (!(await hasNotificationPermission())) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Are you fueling up?',
      body: stationName ? `Looks like you're at ${stationName}. Tap to log this fill.` : 'Tap to log this fill while the numbers are fresh.',
      data: { kind: KIND_FUELING },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
      channelId: FUELING_CHANNEL_ID,
    },
  });
}
