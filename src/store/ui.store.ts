import { create } from 'zustand';

interface UiState {
  /**
   * Whether the quick fuel-log sheet should be open. Held in the store (not local
   * Home state) so an "Are you fueling?" notification tap can open it from anywhere.
   * Transient — not persisted.
   */
  logFuelOpen: boolean;
  openLogFuel: () => void;
  closeLogFuel: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  logFuelOpen: false,
  openLogFuel: () => set({ logFuelOpen: true }),
  closeLogFuel: () => set({ logFuelOpen: false }),
}));
