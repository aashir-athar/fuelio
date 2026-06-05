import { create } from 'zustand';

interface UiState {
  /**
   * Bumped whenever something outside the Home screen (e.g. tapping an
   * "Are you fueling?" notification) asks to open the quick fuel-log sheet.
   * Home watches the value and opens the sheet on change. Transient — not persisted.
   */
  logFuelRequest: number;
  requestLogFuel: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  logFuelRequest: 0,
  requestLogFuel: () => set({ logFuelRequest: get().logFuelRequest + 1 }),
}));
