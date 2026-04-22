/**
 * Lightweight ID generator — no crypto dep needed.
 * Base36 timestamp + random suffix = sortable and unique enough for on-device.
 */
export function createId(prefix = ''): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return `${prefix}${prefix ? '_' : ''}${t}${r}`;
}