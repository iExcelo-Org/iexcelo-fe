import { ICheckoutStore } from "@/types";
import { api } from "@/lib/api";
import { handleAxiosError } from "@/utils/error-handler";
import { create } from "zustand";

export const useCheckoutStore = create<ICheckoutStore>()((set) => ({
  userId: null,
  userType: null,
  planId: null,
  examTypeId: null,
  studentId: null, // For sponsors sponsoring a specific student

  verificationState: "idle",

  setCheckoutData: (data) => set(data),

  clearCheckout: () =>
    set({
      userId: null,
      userType: null,
      planId: null,
      examTypeId: null,
      studentId: null,
      verificationState: "idle",
    }),

  verifyPayment: async ({ sessionId, reference }) => {
    // No session_id or reference — assume success (e.g., bank transfer)
    if (!sessionId && !reference) {
      set({ verificationState: "success" });
      return;
    }

    set({ verificationState: "loading" });

    try {
      const params = new URLSearchParams();
      if (sessionId) params.append("session_id", sessionId);
      if (reference) params.append("reference", reference);

      const response = await api.get<{
        success: boolean;
        message: string;
        data?: { subscriptionId?: string };
      }>(`/subscriptions/checkout/verify?${params.toString()}`);

      if (response.data.success) {
        set({ verificationState: "success" });
      } else {
        set({ verificationState: "error" });
      }
    } catch (error) {
      set({ verificationState: "error" });
      handleAxiosError(
        error,
        "Unable to verify payment. Please contact support.",
      );
    }
  },
}));
