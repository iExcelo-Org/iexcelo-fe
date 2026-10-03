import { API_URL, api, tempAuthRequest, authRequest } from "@/lib/api";
import { IAuthStore, UserType, UserTypeOrNull } from "@/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { useStudentStore } from "./student.store";
import { useSponsorStore } from "./sponsor.store";
import { useAffiliateStore } from "./affiliate.store";
import { handleAxiosError } from "@/utils";

// Helper to save profile data to appropriate store
const saveProfileData = (userRole: UserType, profileData: any) => {
  if (!profileData) return;

  switch (userRole) {
    case UserType.STUDENT:
      useStudentStore.getState().setProfile(profileData);
      useStudentStore
        .getState()
        .setLastExamTypeId(
          profileData.lastExamTypeId || profileData.defaultExamTypeId,
        );
      break;
    case UserType.SPONSOR:
      useSponsorStore.getState().setProfile(profileData);
      break;
    case UserType.AFFILIATE:
      useAffiliateStore.getState().setProfile(profileData);
      break;
  }
};

export const useAuthStore = create<IAuthStore>()(
  persist(
    (set, get) => ({
      hydrated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      tempToken: null,
      isAuthenticated: false,
      userType: null,
      signupEmail: null,

      setHydrated: () => set({ hydrated: true }),

      setUserType: (type) => set({ userType: type }),

      setTempToken: (token) => set({ tempToken: token }),

      setSignupEmail: (email) => set({ signupEmail: email }),

      initGoogle: () => {
        // Unified flow: backend creates user if not exists, redirects to onboarding if needed
        window.location.href = `${API_URL}/auth/google`;
      },

      login: async (data, callback) => {
        try {
          const response = await api.post("/auth/login", data);
          const { accessToken, refreshToken, user, profile } =
            response.data.data;

          // Admin accounts must not access the student frontend
          if (!Object.values(UserType).includes(user?.role)) {
            toast.error(
              "This account doesn't have access to this platform. Please use the admin panel.",
            );
            callback?.(false, null);
            return;
          }

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
          });

          // Save profile data to appropriate store
          if (profile && user?.role) {
            saveProfileData(user.role as UserType, profile);
          }

          toast.success(response.data.message || "Login successful");
          callback?.(true, user.role as UserType);
        } catch (error) {
          const axiosError = error as AxiosError<{ message?: string }>;

          // Check if error is EMAIL_NOT_VERIFIED
          if (axiosError.response?.data?.message === "EMAIL_NOT_VERIFIED") {
            // Store email in authStore and redirect to verify-email page
            set({ signupEmail: (data as { email: string }).email });
            toast.error("Please verify your email before logging in.");
            // The router will handle redirect in the component
            callback?.(false, null);
            return;
          }

          handleAxiosError(error, "Failed to login, try again!");
        }
      },

      signup: async (data, callback) => {
        const {
          firstName,
          lastName,
          email,
          password,
          phoneNumber,
          countryCode,
          examTypeId,
        } = data as any;
        const { userType } = get();

        if (!userType) {
          toast.error("Please select how you want to use iExcelo first.");
          return;
        }

        // Get referral code from localStorage (saved from ?ref= URL param)
        const referralCode = localStorage.getItem("referralCode");
        // Get sponsor code from localStorage (saved from ?sponsor= URL param via /signup/s/:code)
        const sponsorCode = localStorage.getItem("sponsorCode");

        try {
          const response = await api.post("/auth/signup", {
            email,
            password,
            firstName,
            lastName,
            userType,
            // Optional fields based on user type
            ...(phoneNumber && { phoneNumber }),
            ...(countryCode && { countryCode }),
            ...(examTypeId && { examTypeId }),
            ...(referralCode && { referralCode }),
            ...(sponsorCode && { sponsorCode }),
          });

          // Clear referral + sponsor codes after successful signup
          localStorage.removeItem("referralCode");
          localStorage.removeItem("sponsorCode");

          // Store email for verification page
          set({ signupEmail: email });

          toast.success(
            response.data?.message ||
              "Registration successful! Check your email for the verification code.",
          );

          callback?.();
        } catch (error) {
          handleAxiosError(
            error,
            "Failed to create your account, please try again!",
          );
        }
      },

      exchangeToken: async (token, callback) => {
        try {
          // First set the tempToken so the interceptor can use it
          set({ tempToken: token });

          // Use tempAuthRequest to send the token via interceptor, the token in the interceptor might be null here so I'm passing it as a payload instead, reason explained in Callback.tsx file.
          const response = await tempAuthRequest({
            method: "POST",
            url: "/auth/exchange",
            data: { token },
          });

          const { accessToken, refreshToken, user, profile } =
            response.data.data;

          // Admin accounts must not access the student frontend
          if (!Object.values(UserType).includes(user?.role)) {
            set({ tempToken: null });
            toast.error(
              "This account doesn't have access to this platform. Please use the admin panel.",
            );
            return;
          }

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            tempToken: null, // Clear tempToken after success
          });

          // Save profile data to appropriate store
          if (profile && user?.role) {
            saveProfileData(user.role as UserType, profile);
          }

          toast.success(response.data.message || "Signed in successfully!");
          callback?.(user.role as UserType);
        } catch (error) {
          // Clear tempToken on error too
          set({ tempToken: null });
          handleAxiosError(
            error,
            "Failed to complete sign in, please try again!",
          );
        }
      },

      completeOnboarding: async (payload, callback) => {
        // Get referral code from localStorage (saved from ?ref= URL param before Google OAuth)
        const referralCode = localStorage.getItem("referralCode");
        // Get sponsor code from localStorage (saved from ?sponsor= URL param via /signup/s/:code)
        const sponsorCode = localStorage.getItem("sponsorCode");

        try {
          // Use tempAuthRequest to automatically use tempToken from store
          const response = await tempAuthRequest({
            method: "POST",
            url: "/auth/onboarding/complete",
            data: {
              ...payload,
              ...(referralCode && { referralCode }),
              ...(sponsorCode && { sponsorCode }),
            },
          });

          // Clear referral + sponsor codes after successful onboarding
          localStorage.removeItem("referralCode");
          localStorage.removeItem("sponsorCode");

          const { accessToken, refreshToken, user, profile } =
            response.data.data;

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            tempToken: null, // Clear tempToken after success
            userType: null as UserTypeOrNull,
          });

          // Save profile data to appropriate store
          if (profile && user?.role) {
            saveProfileData(user.role as UserType, profile);
          }

          toast.success(
            response.data.message ||
              "Onboarding completed! Welcome to iExcelo.",
          );

          callback?.(user.role as UserType);
        } catch (error) {
          // Clear tempToken on error too
          set({ tempToken: null });
          handleAxiosError(
            error,
            "Failed to complete onboarding, please try again!",
          );
        }
      },

      verifyEmail: async (data, callback) => {
        try {
          const response = await api.post("/auth/verify-email", data);
          toast.success(
            response.data.message ||
              "Email verified successfully! Please log in.",
          );
          set({ signupEmail: null });
          callback?.();
        } catch (error) {
          handleAxiosError(error, "Verification failed. Please try again.");
        }
      },

      resendVerificationCode: async (email, callback) => {
        try {
          const response = await api.post("/auth/resend-verification", {
            email,
          });
          toast.success(
            response.data.message ||
              "Verification code resent successfully. Please check your email.",
          );
          callback?.();
        } catch (error) {
          handleAxiosError(error, "Failed to resend code. Please try again.");
        }
      },

      refreshTokens: async () => {
        try {
          const { refreshToken } = get();

          if (!refreshToken) {
            return null;
          }

          const response = await api.post("/auth/refresh", {
            refreshToken,
          });

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            response.data.data;

          set({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          });

          return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          };
        } catch {
          return null;
        }
      },

      updateTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
          isAuthenticated: !!accessToken,
        }),

      requestPasswordReset: async (email, callback) => {
        try {
          const response = await api.post("/auth/forgot-password", {
            email,
          });
          toast.success(
            response.data.message ||
              "If an account exists with this email, you will receive a password reset link.",
          );
          callback?.();
        } catch (error) {
          handleAxiosError(
            error,
            "Failed to send password reset email. Please try again.",
          );
        }
      },

      resetPassword: async (token, newPassword, callback) => {
        try {
          const response = await api.post("/auth/reset-password", {
            token,
            newPassword,
          });
          toast.success(
            response.data.message ||
              "Password reset successful! Please login with your new password.",
          );
          callback?.();
        } catch (error) {
          handleAxiosError(
            error,
            "Failed to reset password. Please try again.",
          );
        }
      },

      logout: async () => {
        try {
          // Call backend to invalidate refresh token
          await authRequest({
            method: "POST",
            url: "/auth/logout",
          });
        } catch (error) {
          // Even if backend call fails, clear local state
          handleAxiosError(error, "Logout API call failed!");
        } finally {
          // Clear profile stores
          useStudentStore.getState().clearProfile();
          useSponsorStore.getState().clearProfile();
          useAffiliateStore.getState().clearProfile();

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            tempToken: null,
            isAuthenticated: false,
            userType: null,
            signupEmail: null,
          });
        }
      },

      clearAuth: () => {
        // Clear profile stores
        useStudentStore.getState().clearProfile();
        useSponsorStore.getState().clearProfile();
        useAffiliateStore.getState().clearProfile();

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          tempToken: null,
          isAuthenticated: false,
          userType: null,
          signupEmail: null,
        });
      },

      setUser: (user) => set({ user }),

      refreshUser: async () => {
        try {
          const res = await authRequest({ method: "GET", url: "/auth/me" });
          const user = res.data.data;
          if (user) set({ user });
        } catch {
          // Silently fail — stale user state is acceptable vs showing an error
        }
      },
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
