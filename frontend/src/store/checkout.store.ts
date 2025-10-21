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
      }),
    }),
    {
      name: 'checkout-storage',
      partialize: (state) => ({
        checkoutSession: state.checkoutSession,
      }),
    }
  )
);