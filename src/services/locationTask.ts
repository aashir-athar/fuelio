import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LocationObject } from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { notifyAtFuelStation } from './notifications';
import { findNearbyFuelStation } from './overpass';

/**
 * Background location task. MUST be defined at module scope (not inside a component)
 * so the OS can invoke it after the app is killed. This module is imported for its
 * side effect from app/_layout.tsx.
 *
 * Strategy: location updates arrive only after meaningful movement (distanceInterval).
 * On each batch we (1) throttle how often we hit Overpass, (2) ask Overpass whether a
 * fuel station sits within ~70 m, and (3) fire the "Are you fueling?" prompt at most
 * once per debounce window so we never nag.
 */
export const STATION_TASK = 'fuelio-station-watch';

const LAST_CHECK_KEY = 'fuelio.station.lastCheck';
const LAST_PROMPT_KEY = 'fuelio.station.lastPrompt';
const LAST_SEEN_KEY = 'fuelio.station.lastSeen'; // dwell marker: previous batch was in-radius
const MIN_CHECK_INTERVAL_MS = 3 * 60 * 1000; // don't query Overpass more than every 3 min
const MIN_PROMPT_INTERVAL_MS = 30 * 60 * 1000; // don't prompt more than every 30 min
// A confirming second batch must arrive within this window of the first to count as a
// genuine dwell — otherwise the marker is treated as stale and the count restarts.
const DWELL_WINDOW_MS = 12 * 60 * 1000;
const STATION_RADIUS_M = 70;

TaskManager.defineTask<{ locations?: LocationObject[] }>(STATION_TASK, async ({ data, error }) => {
  if (error || !data) return;
  const locations = data.locations;
  const loc = locations?.[locations.length - 1];
  if (!loc) return;

  try {
    const now = Date.now();

    const lastCheck = Number((await AsyncStorage.getItem(LAST_CHECK_KEY)) ?? '0');
    if (now - lastCheck < MIN_CHECK_INTERVAL_MS) return;
    await AsyncStorage.setItem(LAST_CHECK_KEY, String(now));

    const station = await findNearbyFuelStation(
      loc.coords.latitude,
      loc.coords.longitude,
      STATION_RADIUS_M,
    );
    if (!station) {
      // Out of radius — break the dwell streak so drive-bys can't accumulate
      // a phantom "second" hit later.
      await AsyncStorage.removeItem(LAST_SEEN_KEY);
      return;
    }

    // ── Dwell gate ────────────────────────────────────────────────────────
    // Require TWO consecutive in-radius batches before prompting. A single hit
    // (driving past / stopped at a red light next to a station) only records the
    // marker; the prompt fires on the second consecutive confirmation.
    const lastSeen = Number((await AsyncStorage.getItem(LAST_SEEN_KEY)) ?? '0');
    const isConsecutive = lastSeen > 0 && now - lastSeen <= DWELL_WINDOW_MS;
    if (!isConsecutive) {
      // First sighting (or a stale marker): arm the dwell and wait for confirmation.
      await AsyncStorage.setItem(LAST_SEEN_KEY, String(now));
      return;
    }
    // Confirmed dwell — clear the marker so the next visit starts a fresh streak.
    await AsyncStorage.removeItem(LAST_SEEN_KEY);

    const lastPrompt = Number((await AsyncStorage.getItem(LAST_PROMPT_KEY)) ?? '0');
    if (now - lastPrompt < MIN_PROMPT_INTERVAL_MS) return;
    await AsyncStorage.setItem(LAST_PROMPT_KEY, String(now));

    await notifyAtFuelStation(station.name);
  } catch {
    // best-effort; never crash the OS task
  }
});
