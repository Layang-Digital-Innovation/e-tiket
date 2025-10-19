import { create } from 'zustand';

interface NavigationState {
  isNavigating: boolean;
}

interface NavigationActions {
  startNavigation: () => void;
  finishNavigation: () => void;
}

type NavigationStore = NavigationState & NavigationActions;

export const useNavigationStore = create<NavigationStore>((set) => ({
  // Initial state
  isNavigating: false,

  // Actions
  startNavigation: () => {
    set({ isNavigating: true });
  },

  finishNavigation: () => {
    set({ isNavigating: false });
  },
}));
