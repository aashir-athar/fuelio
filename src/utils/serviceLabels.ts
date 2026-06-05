import type { ServiceType } from '../types';

/** Canonical display labels for service types — single source of truth for the UI. */
export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  'oil-change': 'Oil Change',
  'tire-rotation': 'Tire Rotation',
  brake: 'Brakes',
  battery: 'Battery',
  'air-filter': 'Air Filter',
  'timing-belt': 'Timing Belt',
  alignment: 'Alignment',
  coolant: 'Coolant',
  other: 'Other',
};

export const serviceTypeLabel = (t: ServiceType): string => SERVICE_TYPE_LABELS[t] ?? 'Service';
