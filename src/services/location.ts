import * as Location from 'expo-location';
import { STATION_TASK } from './locationTask';

const UPDATE_OPTIONS: Location.LocationTaskOptions = {
  accuracy: Location.Accuracy.Balanced,
  distanceInterval: 120, // metres moved before a new update — battery friendly
  deferredUpdatesInterval: 120_000,
  pausesUpdatesAutomatically: true,
  showsBackgroundLocationIndicator: false,
  foregroundService: {
    notificationTitle: 'Fuelio station detection',
    notificationBody: "Watching for fuel stations. Turn this off anytime in Settings.",
  },
};

/** Request permissions and start the opt-in station watch. Returns whether it started. */
export async function enableStationDetection(): Promise<boolean> {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== 'granted') return false;
  const bg = await Location.requestBackgroundPermissionsAsync();
  if (bg.status !== 'granted') return false;

  const started = await Location.hasStartedLocationUpdatesAsync(STATION_TASK).catch(() => false);
  if (!started) {
    await Location.startLocationUpdatesAsync(STATION_TASK, UPDATE_OPTIONS);
  }
  return true;
}

/** Stop the station watch (does not revoke OS permission). */
export async function disableStationDetection(): Promise<void> {
  const started = await Location.hasStartedLocationUpdatesAsync(STATION_TASK).catch(() => false);
  if (started) {
    await Location.stopLocationUpdatesAsync(STATION_TASK).catch(() => undefined);
  }
}

/**
 * On app start: if the user previously opted in AND permission is still granted,
 * make sure the watch is running again — without prompting.
 */
export async function resumeStationDetection(): Promise<void> {
  const fg = await Location.getForegroundPermissionsAsync();
  const bg = await Location.getBackgroundPermissionsAsync();
  if (fg.status !== 'granted' || bg.status !== 'granted') return;
  const started = await Location.hasStartedLocationUpdatesAsync(STATION_TASK).catch(() => false);
  if (!started) {
    await Location.startLocationUpdatesAsync(STATION_TASK, UPDATE_OPTIONS).catch(() => undefined);
  }
}
