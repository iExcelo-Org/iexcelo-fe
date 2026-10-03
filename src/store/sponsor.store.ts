import {
  ISponsorStore,
  ISponsorDashboard,
  ISponsorStudentRow,
  ISponsorStudentStats,
  ISponsorUrl,
  ISponsorGiveback,
  IExpiringGiveback,
  IInitiateGivebackResult,
  IInitiateRenewalResult,
} from "@/types";

const PAGE_LIMIT = 20;
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authRequest } from "@/lib/api";
import { handleAxiosError } from "@/utils";
import { toast } from "sonner";

export const useSponsorStore = create<ISponsorStore>()(
  persist(
    (set, get) => ({
      hydrated: false,
      profile: null,

      // Dashboard
      dashboard: null,
      isLoadingDashboard: false,

      // Students
      students: [],
      studentsTotal: 0,
      studentsPage: 1,
      studentStats: null,
      isLoadingStudents: false,
      isLoadingStats: false,
      isAddingStudent: false,

      // Sponsor URLs
      sponsorUrls: [],
      isLoadingUrls: false,
      isCreatingUrl: false,

      // Givebacks — per-tab
      givebacksAll: [],
      givebacksAllTotal: 0,
      givebacksAllPage: 1,
      isLoadingGivebacksAll: false,
      givebacksActive: [],
      givebacksActiveTotal: 0,
      givebacksActivePage: 1,
      isLoadingGivebacksActive: false,
      givebacksExpired: [],
      givebacksExpiredTotal: 0,
      givebacksExpiredPage: 1,
      isLoadingGivebacksExpired: false,
      givebackStats: null,
      isLoadingGivebackStats: false,
      isInitiatingGiveback: false,
      expiringGivebacks: [],
      isLoadingExpiringGivebacks: false,
      isInitiatingRenewal: false,

      // Setters
      setHydrated: () => set({ hydrated: true }),
      setProfile: (profile) => set({ profile }),
      clearProfile: () =>
        set({
          profile: null,
          dashboard: null,
          students: [],
          studentsTotal: 0,
          studentsPage: 1,
          studentStats: null,
          sponsorUrls: [],
          givebacksAll: [],
          givebacksAllTotal: 0,
          givebacksAllPage: 1,
          givebacksActive: [],
          givebacksActiveTotal: 0,
          givebacksActivePage: 1,
          givebacksExpired: [],
          givebacksExpiredTotal: 0,
          givebacksExpiredPage: 1,
          givebackStats: null,
          expiringGivebacks: [],
        }),

      // Dashboard
      fetchDashboard: async () => {
        set({ isLoadingDashboard: true });
        try {
          const res = await authRequest({
            method: "GET",
            url: "/sponsors/dashboard",
          });
          const data = (res as any).data?.data as ISponsorDashboard | null;
          set({ dashboard: data, isLoadingDashboard: false });
        } catch (error) {
          set({ isLoadingDashboard: false });
          handleAxiosError(error, "Failed to load dashboard");
        }
      },

      // Students
      fetchStudents: async (page = 1, limit = 20) => {
        set({ isLoadingStudents: true });
        try {
          const res = await authRequest({
            method: "GET",
            url: `/sponsors/students?page=${page}&limit=${limit}`,
          });
          const data = (res as any).data?.data as {
            students: ISponsorStudentRow[];
            total: number;
          };
          set({
            students: data.students,
            studentsTotal: data.total,
            studentsPage: page,
            isLoadingStudents: false,
          });
        } catch (error) {
          set({ isLoadingStudents: false });
          handleAxiosError(error, "Failed to load students");
        }
      },

      fetchStudentStats: async () => {
        set({ isLoadingStats: true });
        try {
          const res = await authRequest({
            method: "GET",
            url: "/sponsors/students/stats",
          });
          const data = (res as any).data?.data as ISponsorStudentStats | null;
          set({ studentStats: data, isLoadingStats: false });
        } catch (error) {
          set({ isLoadingStats: false });
          handleAxiosError(error, "Failed to load student stats");
        }
      },

      addStudent: async (data, callback) => {
        set({ isAddingStudent: true });
        try {
          await authRequest({
            method: "POST",
            url: "/sponsors/students",
            data,
          });
          set({ isAddingStudent: false });
          toast.success("Student added successfully. Activation email sent.");
          get().fetchStudents(get().studentsPage);
          get().fetchStudentStats();
          callback?.();
        } catch (error) {
          set({ isAddingStudent: false });
          handleAxiosError(error, "Failed to add student");
        }
      },

      // Sponsor URLs
      fetchSponsorUrls: async () => {
        set({ isLoadingUrls: true });
        try {
          const res = await authRequest({
            method: "GET",
            url: "/sponsors/urls",
          });
          const data = (res as any).data?.data as ISponsorUrl[];
          set({ sponsorUrls: data || [], isLoadingUrls: false });
        } catch (error) {
          set({ isLoadingUrls: false });
          handleAxiosError(error, "Failed to load sponsor URLs");
        }
      },

      createSponsorUrl: async (data, callback) => {
        set({ isCreatingUrl: true });
        try {
          const res = await authRequest({
            method: "POST",
            url: "/sponsors/urls",
            data,
          });
          const newUrl = (res as any).data?.data as ISponsorUrl;
          set((state) => ({
            sponsorUrls: [newUrl, ...state.sponsorUrls],
            isCreatingUrl: false,
          }));
          toast.success("Sponsor link created successfully");
          callback?.();
        } catch (error) {
          set({ isCreatingUrl: false });
          handleAxiosError(error, "Failed to create sponsor link");
        }
      },

      toggleSponsorUrl: async (urlId) => {
        try {
          const res = await authRequest({
            method: "PATCH",
            url: `/sponsors/urls/${urlId}/toggle`,
          });
          const updated = (res as any).data?.data as ISponsorUrl;
          set((state) => ({
            sponsorUrls: state.sponsorUrls.map((u) =>
              u.id === urlId ? updated : u,
            ),
          }));
        } catch (error) {
          handleAxiosError(error, "Failed to toggle sponsor link");
        }
      },

      // Givebacks
      fetchGivebackStats: async () => {
        set({ isLoadingGivebackStats: true });
        try {
          const res = await authRequest({
            method: "GET",
            url: "/sponsors/givebacks/stats",
          });
          const data = (res as any).data?.data;
          set({ givebackStats: data, isLoadingGivebackStats: false });
        } catch (error) {
          set({ isLoadingGivebackStats: false });
          handleAxiosError(error, "Failed to load giveback stats");
        }
      },

      fetchGivebacksAll: async (page = 1, limit = PAGE_LIMIT) => {
        set({ isLoadingGivebacksAll: true });
        try {
          const res = await authRequest({
            method: "GET",
            url: `/sponsors/givebacks?page=${page}&limit=${limit}`,
          });
          const data = (res as any).data?.data as {
            givebacks: ISponsorGiveback[];
            total: number;
          };
          set({
            givebacksAll: data.givebacks,
            givebacksAllTotal: data.total,
            givebacksAllPage: page,
            isLoadingGivebacksAll: false,
          });
        } catch (error) {
          set({ isLoadingGivebacksAll: false });
          handleAxiosError(error, "Failed to load givebacks");
        }
      },

      fetchGivebacksActive: async (page = 1, limit = PAGE_LIMIT) => {
        set({ isLoadingGivebacksActive: true });
        try {
          const res = await authRequest({
            method: "GET",
            url: `/sponsors/givebacks?page=${page}&limit=${limit}&status=active`,
          });
          const data = (res as any).data?.data as {
            givebacks: ISponsorGiveback[];
            total: number;
          };
          set({
            givebacksActive: data.givebacks,
            givebacksActiveTotal: data.total,
            givebacksActivePage: page,
            isLoadingGivebacksActive: false,
          });
        } catch (error) {
          set({ isLoadingGivebacksActive: false });
          handleAxiosError(error, "Failed to load active givebacks");
        }
      },

      fetchGivebacksExpired: async (page = 1, limit = PAGE_LIMIT) => {
        set({ isLoadingGivebacksExpired: true });
        try {
          const res = await authRequest({
            method: "GET",
            url: `/sponsors/givebacks?page=${page}&limit=${limit}&status=expired`,
          });
          const data = (res as any).data?.data as {
            givebacks: ISponsorGiveback[];
            total: number;
          };
          set({
            givebacksExpired: data.givebacks,
            givebacksExpiredTotal: data.total,
            givebacksExpiredPage: page,
            isLoadingGivebacksExpired: false,
          });
        } catch (error) {
          set({ isLoadingGivebacksExpired: false });
          handleAxiosError(error, "Failed to load expired givebacks");
        }
      },

      initGivebackTabs: async (limit = PAGE_LIMIT) => {
        await Promise.all([
          get().fetchGivebacksAll(1, limit),
          get().fetchGivebacksActive(1, limit),
          get().fetchGivebacksExpired(1, limit),
        ]);
      },

      initiateGiveback: async (data, callback) => {
        set({ isInitiatingGiveback: true });
        try {
          const res = await authRequest({
            method: "POST",
            url: "/sponsors/givebacks/initiate",
            data,
          });
          const result = (res as any).data?.data as IInitiateGivebackResult;
          set({ isInitiatingGiveback: false });
          callback?.(result);
        } catch (error) {
          set({ isInitiatingGiveback: false });
          handleAxiosError(error, "Failed to initiate giveback");
        }
      },

      fetchExpiringGivebacks: async () => {
        set({ isLoadingExpiringGivebacks: true });
        try {
          const res = await authRequest({
            method: "GET",
            url: "/sponsors/givebacks/expiring",
          });
          const data = (res as any).data?.data as IExpiringGiveback[];
          set({
            expiringGivebacks: data || [],
            isLoadingExpiringGivebacks: false,
          });
        } catch (error) {
          set({ isLoadingExpiringGivebacks: false });
          handleAxiosError(error, "Failed to load expiring givebacks");
        }
      },

      initiateRenewal: async (originalGivebackId, data, callback) => {
        set({ isInitiatingRenewal: true });
        try {
          const res = await authRequest({
            method: "POST",
            url: `/sponsors/givebacks/${originalGivebackId}/resub`,
            data,
          });
          const result = (res as any).data?.data as IInitiateRenewalResult;
          set({ isInitiatingRenewal: false });
          callback?.(result);
        } catch (error) {
          set({ isInitiatingRenewal: false });
          handleAxiosError(error, "Failed to initiate renewal");
        }
      },

      verifyGiveback: async (reference, callback) => {
        try {
          const res = await authRequest({
            method: "POST",
            url: "/sponsors/givebacks/verify",
            data: { reference },
          });
          const result = (res as any).data?.data as {
            success: boolean;
            activatedCount: number;
          };
          if (result.success) {
            callback?.(result.activatedCount);
            // Refresh all tabs from page 1 after verification — new giveback now active
            void get().initGivebackTabs();
            void get().fetchGivebackStats();
            void get().fetchExpiringGivebacks();
          } else {
            toast.error(
              "Payment could not be verified. Please contact support.",
            );
          }
        } catch (error) {
          handleAxiosError(error, "Failed to verify giveback payment");
        }
      },
    }),
    {
      name: "sponsor-profile",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        hydrated: state.hydrated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
