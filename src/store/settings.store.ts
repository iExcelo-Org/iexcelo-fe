import { create } from "zustand";
import { authRequest } from "@/lib/api";
import { handleAxiosError } from "@/utils";
import { toast } from "sonner";
import { useAuthStore } from "./auth.store";
import type { ISettingsStore, ICardInfo } from "@/types";

export const useSettingsStore = create<ISettingsStore>()((set) => ({
  // ── Profile ──────────────────────────────────────────────────────────────
  updatingProfile: false,
  updateProfile: async (data, onSuccess) => {
    set({ updatingProfile: true });
    try {
      const res = await authRequest({
        method: "PATCH",
        url: "/auth/profile",
        data,
      });
      const updated = res.data.data;
      useAuthStore.getState().setUser({
        ...useAuthStore.getState().user,
        ...updated,
      });
      toast.success("Profile updated");
      onSuccess?.();
    } catch (error) {
      handleAxiosError(error, "Failed to update profile");
    } finally {
      set({ updatingProfile: false });
    }
  },

  // ── Password ─────────────────────────────────────────────────────────────
  changingPassword: false,
  changePassword: async (currentPassword, newPassword, onSuccess) => {
    set({ changingPassword: true });
    try {
      await authRequest({
        method: "POST",
        url: "/auth/change-password",
        data: { currentPassword, newPassword },
      });
      toast.success("Password changed. Please log in again.");
      onSuccess?.();
      // After success backend invalidates all sessions → logout client
      await useAuthStore.getState().logout();
    } catch (error) {
      handleAxiosError(error, "Failed to change password");
    } finally {
      set({ changingPassword: false });
    }
  },

  // ── Delete Account ────────────────────────────────────────────────────────
  deletingAccount: false,
  deleteAccount: async (onSuccess) => {
    set({ deletingAccount: true });
    try {
      await authRequest({ method: "DELETE", url: "/auth/account" });
      toast.success("Account deleted");
      onSuccess?.();
      useAuthStore.getState().clearAuth();
    } catch (error) {
      handleAxiosError(error, "Failed to delete account");
    } finally {
      set({ deletingAccount: false });
    }
  },

  // ── Notification Preferences ──────────────────────────────────────────────
  updatingNotifPrefs: false,
  updateNotificationPreferences: async (data) => {
    set({ updatingNotifPrefs: true });
    try {
      const res = await authRequest({
        method: "PATCH",
        url: "/auth/notification-preferences",
        data,
      });
      useAuthStore.getState().setUser({
        ...useAuthStore.getState().user,
        ...res.data.data,
      });
    } catch (error) {
      handleAxiosError(error, "Failed to update notification preferences");
    } finally {
      set({ updatingNotifPrefs: false });
    }
  },

  // ── Set Password (Google-only) ────────────────────────────────────────────
  requestingSetPassword: false,
  requestSetPassword: async () => {
    set({ requestingSetPassword: true });
    try {
      await authRequest({ method: "POST", url: "/auth/set-password/request" });
      toast.success("Verification code sent to your email");
      return true;
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      if (status === 429) {
        const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
          || "A code was already sent — check your inbox and enter it below";
        toast.info(msg);
        return 'rate-limited';
      }
      handleAxiosError(error, "Failed to send verification code");
      return false;
    } finally {
      set({ requestingSetPassword: false });
    }
  },

  confirmingSetPassword: false,
  confirmSetPassword: async (code, newPassword, onSuccess) => {
    set({ confirmingSetPassword: true });
    try {
      await authRequest({
        method: "POST",
        url: "/auth/set-password/confirm",
        data: { code, newPassword },
      });
      useAuthStore.getState().setUser({
        ...useAuthStore.getState().user,
        provider: "dual",
      });
      toast.success("Password set! You can now sign in with email and password.");
      onSuccess?.();
      return true;
    } catch (error) {
      handleAxiosError(error, "Failed to set password");
      return false;
    } finally {
      set({ confirmingSetPassword: false });
    }
  },

  // ── Disconnect Google ─────────────────────────────────────────────────────
  disconnectingGoogle: false,
  disconnectGoogle: async (onSuccess) => {
    set({ disconnectingGoogle: true });
    try {
      await authRequest({ method: "DELETE", url: "/auth/google" });
      useAuthStore.getState().setUser({
        ...useAuthStore.getState().user,
        provider: "local",
        googleId: null,
      });
      toast.success("Google account disconnected");
      onSuccess?.();
    } catch (error) {
      handleAxiosError(error, "Failed to disconnect Google");
    } finally {
      set({ disconnectingGoogle: false });
    }
  },

  // ── Billing History ───────────────────────────────────────────────────────
  billingHistory: [],
  billingTotal: 0,
  billingPage: 1,
  loadingBilling: false,
  fetchBillingHistory: async (page = 1) => {
    set({ loadingBilling: true, billingPage: page });
    try {
      const res = await authRequest({
        method: "GET",
        url: `/subscriptions/billing-history?page=${page}&limit=20`,
      });
      const { items, total } = res.data.data as {
        items: ISettingsStore["billingHistory"];
        total: number;
      };
      set({ billingHistory: items, billingTotal: total, billingPage: page });
    } catch (error) {
      handleAxiosError(error, "Failed to load billing history");
    } finally {
      set({ loadingBilling: false });
    }
  },

  // ── Card Info ─────────────────────────────────────────────────────────────
  cardInfo: null,
  loadingCardInfo: false,
  fetchCardInfo: async (examTypeId) => {
    set({ loadingCardInfo: true });
    try {
      const res = await authRequest({
        method: "GET",
        url: `/subscriptions/my-subscription/card-info?examTypeId=${examTypeId}`,
      });
      set({ cardInfo: res.data.data as ICardInfo | null });
    } catch {
      set({ cardInfo: null });
    } finally {
      set({ loadingCardInfo: false });
    }
  },
}));
