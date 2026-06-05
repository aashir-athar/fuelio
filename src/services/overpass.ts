/**
 * Minimal OpenStreetMap Overpass lookup for "is there a fuel station right here?".
 * No API key, no account. Called only from the throttled background location task,
 * and only when the user has explicitly opted in.
 */

const ENDPOINT = 'https://overpass-api.de/api/interpreter';

export interface NearbyStation {
  name?: string;
  lat: number;
  lon: number;
}

/** Returns the nearest fuel station within `radiusM` metres, or null. Never throws. */
export async function findNearbyFuelStation(
  lat: number,
  lon: number,
  radiusM = 70,
): Promise<NearbyStation | null> {
  const query = `[out:json][timeout:10];node["amenity"="fuel"](around:${radiusM},${lat},${lon});out tags 1;`;
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      elements?: { lat?: number; lon?: number; tags?: { name?: string } }[];
    };
    const el = json.elements?.[0];
    if (!el || typeof el.lat !== 'number' || typeof el.lon !== 'number') return null;
    return { name: el.tags?.name, lat: el.lat, lon: el.lon };
  } catch {
    return null;
  }
}
