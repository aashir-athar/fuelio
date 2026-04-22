/**
 * Centralized image registry so assets are type-safe and imported once.
 */
export const IMAGES = {
  onboarding: require('../../assets/images/onboarding.png'),
  fueling: require('../../assets/images/fueling.png'),
  oilChange: require('../../assets/images/oil-change.png'),
  analysis: require('../../assets/images/analysis.png'),
  addVehicle: require('../../assets/images/add-vehicle.png'),
  carMaintenance: require('../../assets/images/car-maintainance.png'),
} as const;