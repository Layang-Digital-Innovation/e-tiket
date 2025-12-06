import { create } from 'zustand';

interface NavigationState {
  isNavigating: boolean;
  progress: number;
  startNavigation: () => void;
  setProgress: (progress: number) => void;
  finishNavigation: () => void;
  resetNavigation: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  isNavigating: false,
  progress: 0,
  
  startNavigation: () => set({ isNavigating: true, progress: 10 }),
  
  setProgress: (progress: number) => set({ progress }),
  
  finishNavigation: () => set({ progress: 100 }),
  
  resetNavigation: () => set({ isNavigating: false, progress: 0 }),
}));
