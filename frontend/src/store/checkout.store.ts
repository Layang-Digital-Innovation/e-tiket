import { AttendeeData, BuyerData, CheckoutState } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CheckoutStore {
  // Checkout session data (persisted)
  checkoutSession: CheckoutState | null;

  // UI state (not persisted)
  currentStep: 1 | 2 | 3;
  paymentUrl: string | null;
  orderCreatedAt: number | null;

  // Timer state (persisted)
  timeLeft: number;
  timerActive: boolean;

  // Actions for checkout session
  setCheckoutSession: (session: CheckoutState | null) => void;
  updateAttendees: (attendees: AttendeeData[]) => void;
  updateBuyer: (buyer: BuyerData) => void;
  clearCheckoutSession: () => void;

  // Actions for UI state
  setStep: (step: 1 | 2 | 3 | ((prev: 1 | 2 | 3) => 1 | 2 | 3)) => void;
  setPaymentUrl: (url: string) => void;
  setOrderCreatedAt: (timestamp: number) => void;
  reset: () => void;

  // Timer actions
  startTimer: (seconds: number) => void;
  stopTimer: () => void;
  decrementTimer: () => void;
}

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set, get) => ({
      // Persisted state
      checkoutSession: null,

      // Non-persisted state
      currentStep: 1,
      paymentUrl: null,
      orderCreatedAt: null,
      timeLeft: 0,
      timerActive: false,

      // Actions
      setCheckoutSession: (session) => set({ checkoutSession: session }),

      updateAttendees: (attendees) =>
        set((state) => ({
          checkoutSession: state.checkoutSession
            ? { ...state.checkoutSession, attendees }
            : null
        })),

      updateBuyer: (buyer) =>
        set((state) => ({
          checkoutSession: state.checkoutSession
            ? { ...state.checkoutSession, buyer }
            : null
        })),

      clearCheckoutSession: () => set({ checkoutSession: null }),

      setStep: (step) =>
        set((state) => ({
          currentStep: typeof step === 'function' ? step(state.currentStep) : step
        })),

      setPaymentUrl: (url) => set({ paymentUrl: url }),

      setOrderCreatedAt: (timestamp) => set({ orderCreatedAt: timestamp }),

      reset: () => set({
        checkoutSession: null,
        currentStep: 1,
        paymentUrl: null,
        orderCreatedAt: null,
        timeLeft: 0,
        timerActive: false,
      }),

      // Timer actions
      startTimer: (seconds) => set({ timeLeft: seconds, timerActive: true }),

      stopTimer: () => set({ timerActive: false }),

      decrementTimer: () =>
        set((state) => ({
          timeLeft: Math.max(0, state.timeLeft - 1),
        })),
    }),
    {
      name: 'checkout-storage',
      partialize: (state) => ({
        checkoutSession: state.checkoutSession,
        currentStep: state.currentStep,
        paymentUrl: state.paymentUrl,
        orderCreatedAt: state.orderCreatedAt,
        timeLeft: state.timeLeft,
        // Note: timerActive is not persisted as timer state should be managed on app restart
      }),
    }
  )
);

// Global timer effect that runs across all components
if (typeof window !== 'undefined') {
  let timerInterval: NodeJS.Timeout | null = null;

  // Subscribe to store changes
  const unsubscribe = useCheckoutStore.subscribe((state, prevState) => {
    // Start timer when timerActive becomes true
    if (state.timerActive && !prevState.timerActive && state.timeLeft > 0) {
      console.log('Starting global timer');
      timerInterval = setInterval(() => {
        const currentState = useCheckoutStore.getState();
        if (currentState.timerActive && currentState.timeLeft > 0) {
          useCheckoutStore.getState().decrementTimer();
        } else {
          // Stop timer if not active or time is up
          if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
          }
        }
      }, 1000);
    }

    // Stop timer when timerActive becomes false
    if (!state.timerActive && prevState.timerActive) {
      console.log('Stopping global timer');
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }

    // Stop timer when time reaches 0
    if (state.timeLeft === 0 && prevState.timeLeft > 0) {
      console.log('Timer reached zero, stopping');
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      // Auto-stop timer
      useCheckoutStore.getState().stopTimer();
    }
  });

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    unsubscribe();
  });
}