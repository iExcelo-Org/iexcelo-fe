import {
  IStudentStore,
  IDashboardData,
  ISubjectScores,
  IActiveSubscription,
  ISubscriptionSummary,
  ICheckoutInfo,
  ICardInfo,
  IExamAttempt,
  IExamAttemptDetail,
  IAnalyticsSubjectScore,
  IAnalyticsProgressOverTime,
  IAnalyticsQuestionDistribution,
  IAnalyticsRanking,
  IAnalyticsSubjectAttempt,
} from "@/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authRequest } from "@/lib/api";
import { handleAxiosError, EXAM_PAGE_SIZE } from "@/utils";

export const useStudentStore = create<IStudentStore>()(
  persist(
    (set, get) => ({
      hydrated: false,
      profile: null,
      lastExamTypeId: null,
      dashboardData: null,
      isLoadingDashboard: false,
      granularity: "week" as const,
      isLoadingSubjectScores: false,
      activeSubscription: null,
      isLoadingSubscription: false,
      allSubscriptions: [] as ISubscriptionSummary[],
      isLoadingAllSubscriptions: false,
      checkoutInfo: null,
      isLoadingCheckoutInfo: false,
      cardInfo: null,
      isLoadingCardInfo: false,
      isCheckingOut: false,
      isUpgrading: false,
      isReactivating: false,
      examHistory: [],
      examHistoryTotal: 0,
      examHistoryPage: 1,
      isLoadingExamHistory: false,
      examAttemptDetail: null,
      isLoadingAttemptDetail: false,
      reviewCache: {} as Record<number, any[]>,
      reviewLoadingPages: [] as number[],
      analyticsSubjectScores: [] as IAnalyticsSubjectScore[],
      analyticsSubjectScoresRange: null as
        | { name: string; Score: number }[]
        | null,
      analyticsProgressOverTime: null as IAnalyticsProgressOverTime | null,
      analyticsQuestionDistribution:
        null as IAnalyticsQuestionDistribution | null,
      analyticsRanking: null as IAnalyticsRanking | null,
      analyticsSubjectAttempts: [] as IAnalyticsSubjectAttempt[],
      isLoadingAnalytics: false,
      isLoadingProgressOverTime: false,
      isLoadingSubjectAttempts: false,
      isLoadingSubjectScoreAnalytics: false,
      isLoadingRankingAnalytics: false,

      setHydrated: () => set({ hydrated: true }),

      setProfile: (profile) => set({ profile }),

      clearProfile: () =>
        set({
          profile: null,
          lastExamTypeId: null,
          dashboardData: null,
          isLoadingDashboard: false,
          granularity: "week" as const,
          isLoadingSubjectScores: false,
          activeSubscription: null,
          isLoadingSubscription: false,
          allSubscriptions: [],
          isLoadingAllSubscriptions: false,
          checkoutInfo: null,
          isLoadingCheckoutInfo: false,
          cardInfo: null,
          isLoadingCardInfo: false,
          isCheckingOut: false,
          isUpgrading: false,
          isReactivating: false,
          examHistory: [],
          examHistoryTotal: 0,
          examHistoryPage: 1,
          isLoadingExamHistory: false,
          examAttemptDetail: null,
          isLoadingAttemptDetail: false,
          reviewCache: {},
          reviewLoadingPages: [] as number[],
          analyticsSubjectScores: [],
          analyticsSubjectScoresRange: null as
            | { name: string; Score: number }[]
            | null,
          analyticsProgressOverTime: null,
          analyticsQuestionDistribution: null,
          analyticsRanking: null,
          analyticsSubjectAttempts: [],
          isLoadingAnalytics: false,
          isLoadingProgressOverTime: false,
          isLoadingSubjectAttempts: false,
          isLoadingSubjectScoreAnalytics: false,
          isLoadingRankingAnalytics: false,
        }),

      setLastExamTypeId: (id) => set({ lastExamTypeId: id }),

      switchExamType: async (examTypeId) => {
        try {
          await authRequest({
            method: "PATCH",
            url: "/students/exam-type",
            data: { examTypeId },
          });

          // Update the exam type ID immediately, then refetch dashboard
          set({ lastExamTypeId: examTypeId });
          await get().fetchDashboard(get().granularity);
        } catch (error) {
          handleAxiosError(error, "Failed to switch exam type");
        }
      },

      setDashboardData: (data) => set({ dashboardData: data }),

      setGranularity: (granularity) => set({ granularity }),

      fetchDashboard: async (granularity = "week") => {
        const { lastExamTypeId, profile } = get();

        // Use lastExamTypeId, fallback to profile's defaultExamTypeId
        const examTypeId = lastExamTypeId || profile?.defaultExamTypeId;

        set({ isLoadingDashboard: true });

        try {
          const tz = encodeURIComponent(
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          );
          const params = new URLSearchParams();
          if (examTypeId) params.set("examTypeId", examTypeId);
          params.set("granularity", granularity);
          params.set("timezone", tz);

          const res = await authRequest({
            method: "GET",
            url: `/students/dashboard?${params.toString()}`,
          });

          const data = (res as any).data?.data as IDashboardData | null;

          // Sync lastExamTypeId from backend; keep granularity from the request
          if (data?.student?.lastExamTypeId) {
            set({
              dashboardData: data,
              lastExamTypeId: data.student.lastExamTypeId,
              granularity,
              isLoadingDashboard: false,
            });
          } else {
            set({
              dashboardData: data,
              granularity,
              isLoadingDashboard: false,
            });
          }

          // Sync hasEverSubscribed + isSponsored + sponsorDisplayName into profile
          // so pages stay current without needing a separate profile fetch.
          if (
            data?.student?.hasEverSubscribed !== undefined ||
            data?.student?.isSponsored !== undefined ||
            data?.student?.sponsorDisplayName !== undefined
          ) {
            const currentProfile = get().profile;
            if (currentProfile) {
              set({
                profile: {
                  ...currentProfile,
                  ...(data.student.hasEverSubscribed !== undefined && {
                    hasEverSubscribed: data.student.hasEverSubscribed,
                  }),
                  ...(data.student.isSponsored !== undefined && {
                    isSponsored: data.student.isSponsored,
                  }),
                  ...(data.student.sponsorDisplayName !== undefined && {
                    sponsorDisplayName: data.student.sponsorDisplayName,
                  }),
                },
              });
            }
          }
        } catch (error) {
          set({ isLoadingDashboard: false });
          handleAxiosError(error, "Failed to load dashboard");
        }
      },

      fetchSubjectScores: async (granularity) => {
        const { lastExamTypeId, dashboardData } = get();

        if (!lastExamTypeId) return;

        set({ isLoadingSubjectScores: true });

        try {
          const tz = encodeURIComponent(
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          );
          const params = new URLSearchParams();
          params.set("examTypeId", lastExamTypeId);
          params.set("granularity", granularity);
          params.set("timezone", tz);

          const res = await authRequest({
            method: "GET",
            url: `/students/analytics/subject-scores?${params.toString()}`,
          });

          const subjectScores = (res as any).data
            ?.data as ISubjectScores | null;

          if (subjectScores && dashboardData) {
            // Spread new subject scores over existing dashboard data
            set({
              dashboardData: {
                ...dashboardData,
                analytics: {
                  ...dashboardData.analytics,
                  subjectScores,
                },
              },
              granularity,
              isLoadingSubjectScores: false,
            });
          } else {
            set({ isLoadingSubjectScores: false });
          }
        } catch (error) {
          set({ isLoadingSubjectScores: false });
          handleAxiosError(error, "Failed to load subject scores");
        }
      },

      fetchActiveSubscription: async (examTypeId) => {
        set({ isLoadingSubscription: true });

        try {
          const res = await authRequest({
            method: "GET",
            url: `/subscriptions/my-subscription?examTypeId=${examTypeId}`,
          });

          const subscription = (res as any).data
            ?.data as IActiveSubscription | null;

          set({
            activeSubscription: subscription,
            isLoadingSubscription: false,
          });
        } catch (error) {
          set({ isLoadingSubscription: false });
          handleAxiosError(error, "Failed to load subscription");
        }
      },

      fetchAllSubscriptions: async () => {
        set({ isLoadingAllSubscriptions: true });
        try {
          const res = await authRequest({
            method: "GET",
            url: "/subscriptions/my-subscriptions",
          });
          const subs = (res as any).data?.data as ISubscriptionSummary[];
          set({ allSubscriptions: subs ?? [], isLoadingAllSubscriptions: false });
        } catch (error) {
          set({ isLoadingAllSubscriptions: false });
          handleAxiosError(error, "Failed to load subscriptions");
        }
      },

      cancelSubscription: async (examTypeId, preFlight) => {
        try {
          await authRequest({
            method: "POST",
            url: `/subscriptions/my-subscription/cancel?examTypeId=${examTypeId}`,
          });

          preFlight?.();

          // Refetch to get updated status (now CANCELLED)
          await get().fetchActiveSubscription(examTypeId);
          await get().fetchDashboard(get().granularity);
        } catch (error) {
          handleAxiosError(error, "Failed to cancel subscription");
        }
      },

      reactivateSubscription: async (examTypeId) => {
        set({ isReactivating: true });

        try {
          await authRequest({
            method: "POST",
            url: `/subscriptions/my-subscription/reactivate?examTypeId=${examTypeId}`,
          });

          // Refetch to get updated state after reactivation
          await get().fetchActiveSubscription(examTypeId);
          set({ isReactivating: false });
        } catch (error) {
          set({ isReactivating: false });
          handleAxiosError(error, "Failed to reactivate subscription");
        }
      },

      fetchCheckoutInfo: async (examTypeId, region) => {
        set({ isLoadingCheckoutInfo: true });

        try {
          const params = new URLSearchParams();
          params.set("examTypeId", examTypeId);
          if (region) params.set("region", region);

          const res = await authRequest({
            method: "GET",
            url: `/subscriptions/checkout-info?${params.toString()}`,
          });

          const data = (res as any).data?.data as ICheckoutInfo | null;
          set({ checkoutInfo: data, isLoadingCheckoutInfo: false });
        } catch {
          set({ isLoadingCheckoutInfo: false });
        }
      },

      fetchCardInfo: async (examTypeId) => {
        set({ isLoadingCardInfo: true });

        try {
          const res = await authRequest({
            method: "GET",
            url: `/subscriptions/my-subscription/card-info?examTypeId=${examTypeId}`,
          });

          const data = (res as any).data?.data as ICardInfo | null;
          set({ cardInfo: data, isLoadingCardInfo: false });
        } catch {
          set({ isLoadingCardInfo: false });
        }
      },

      fetchManageLink: async (examTypeId, callback) => {
        try {
          const res = await authRequest({
            method: "GET",
            url: `/subscriptions/my-subscription/manage-link?examTypeId=${examTypeId}`,
          });

          const link = (res as any).data?.data?.link as string | null;
          if (link) callback?.(link);
        } catch (error) {
          handleAxiosError(error, "Failed to get manage link");
        }
      },

      initiateCheckout: async (data, callback) => {
        set({ isCheckingOut: true });

        try {
          const res = await authRequest({
            method: "POST",
            url: "/subscriptions/checkout",
            data: {
              planId: data.planId,
              examTypeId: data.examTypeId,
              region: data.region,
              provider: data.provider,
              redirectUrl: window.location.origin,
            },
          });

          const responseData = (res as any).data as {
            success: boolean;
            data?: {
              authorizationUrl?: string;
            };
          };

          if (responseData?.success && responseData.data?.authorizationUrl) {
            callback?.(responseData.data.authorizationUrl);
          }

          set({ isCheckingOut: false });
        } catch (error) {
          set({ isCheckingOut: false });
          handleAxiosError(error, "Failed to initiate checkout");
        }
      },

      upgradeSubscription: async (data, callback) => {
        set({ isUpgrading: true });

        try {
          await authRequest({
            method: "POST",
            url: "/subscriptions/my-subscription/upgrade",
            data: {
              targetPlanId: data.targetPlanId,
              examTypeId: data.examTypeId,
            },
          });

          callback?.();
          set({ isUpgrading: false });

          // Refetch subscription to get updated state
          await get().fetchActiveSubscription(data.examTypeId);
        } catch (error) {
          set({ isUpgrading: false });
          handleAxiosError(error, "Failed to upgrade subscription");
        }
      },

      fetchExamHistory: async (page = 1, limit = 10) => {
        set({ isLoadingExamHistory: true });

        try {
          const res = await authRequest({
            method: "GET",
            url: `/students/exam-history?page=${page}&limit=${limit}`,
          });

          const result = (res as any).data?.data as {
            data: IExamAttempt[];
            total: number;
            page: number;
          };

          set({
            examHistory: result.data,
            examHistoryTotal: result.total,
            examHistoryPage: result.page,
            isLoadingExamHistory: false,
          });
        } catch (error) {
          set({ isLoadingExamHistory: false });
          handleAxiosError(error, "Failed to load exam history");
        }
      },

      fetchExamAttemptDetail: async (examAttemptId) => {
        set({
          isLoadingAttemptDetail: true,
          reviewCache: {},
          reviewLoadingPages: [],
        });

        try {
          const res = await authRequest({
            method: "GET",
            url: `/students/exam-history/${examAttemptId}?offset=0&limit=20`,
          });

          const data = (res as any).data?.data as IExamAttemptDetail | null;
          // Seed page 0 of the review cache from the initial response
          const seedCache: Record<number, any[]> = {};
          if (data?.detailedResults?.length) {
            seedCache[0] = data.detailedResults;
          }
          set({
            examAttemptDetail: data,
            isLoadingAttemptDetail: false,
            reviewCache: seedCache,
          });
        } catch (error) {
          set({ isLoadingAttemptDetail: false });
          handleAxiosError(error, "Failed to load exam attempt details");
        }
      },

      fetchReviewPage: async (attemptId, page) => {
        const { reviewCache, reviewLoadingPages } = get();
        if (reviewCache[page] !== undefined) return;
        if (reviewLoadingPages.includes(page)) return;

        set({ reviewLoadingPages: [...reviewLoadingPages, page] });

        const PAGE_SIZE = EXAM_PAGE_SIZE;
        try {
          const res = await authRequest({
            method: "GET",
            url: `/students/exam-history/${attemptId}/questions?offset=${page * PAGE_SIZE}&limit=${PAGE_SIZE}`,
          });
          const results = (res as any).data?.data?.detailedResults ?? [];
          const { reviewCache: cache, reviewLoadingPages: loading } = get();
          set({
            reviewCache: { ...cache, [page]: results },
            reviewLoadingPages: loading.filter((p) => p !== page),
          });
        } catch {
          const { reviewLoadingPages: loading } = get();
          set({ reviewLoadingPages: loading.filter((p) => p !== page) });
        }
      },

      prefetchReviewAround: (attemptId, questionIndex) => {
        const PAGE_SIZE = EXAM_PAGE_SIZE;
        const currentPage = Math.floor(questionIndex / PAGE_SIZE);
        const totalCount = get().examAttemptDetail?.totalCount ?? 0;
        const totalPages = Math.ceil(totalCount / PAGE_SIZE);
        const { fetchReviewPage } = get();
        const pagesToFetch = [
          currentPage - 1,
          currentPage,
          currentPage + 1,
          currentPage + 2,
        ].filter((p) => p >= 0 && p < totalPages);
        pagesToFetch.forEach((p) => fetchReviewPage(attemptId, p));
      },

      getReviewQuestion: (questionIndex) => {
        const PAGE_SIZE = EXAM_PAGE_SIZE;
        const page = Math.floor(questionIndex / PAGE_SIZE);
        const indexInPage = questionIndex % PAGE_SIZE;
        return get().reviewCache[page]?.[indexInPage] ?? null;
      },

      fetchAnalytics: async ({ examTypeId }) => {
        set({ isLoadingAnalytics: true });
        try {
          const distRes = await authRequest({
            method: "GET",
            url: `/students/analytics/question-distribution?examTypeId=${examTypeId}`,
          });
          set({
            analyticsQuestionDistribution:
              ((distRes as any).data?.data as IAnalyticsQuestionDistribution) ??
              null,
            isLoadingAnalytics: false,
          });
        } catch {
          set({ isLoadingAnalytics: false });
        }
      },

      fetchAnalyticsProgressOverTime: async ({
        examTypeId,
        granularity,
        timezone,
      }) => {
        set({ isLoadingProgressOverTime: true });
        const tz = encodeURIComponent(
          timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
        );
        const base = `examTypeId=${examTypeId}&granularity=${granularity}&timezone=${tz}`;
        try {
          const res = await authRequest({
            method: "GET",
            url: `/students/analytics/progress-over-time?${base}`,
          });
          set({
            analyticsProgressOverTime:
              ((res as any).data?.data as IAnalyticsProgressOverTime) ?? null,
            isLoadingProgressOverTime: false,
          });
        } catch {
          set({ isLoadingProgressOverTime: false });
        }
      },

      fetchAnalyticsSubjectAttempts: async ({
        examTypeId,
        granularity,
        date,
        timezone,
      }) => {
        set({ isLoadingSubjectAttempts: true });
        const tz = encodeURIComponent(
          timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
        );
        const params = new URLSearchParams({
          examTypeId,
          granularity,
          timezone: tz,
        });
        if (date) params.set("period", date);
        try {
          const res = await authRequest({
            method: "GET",
            url: `/students/analytics/subject-attempts?${params.toString()}`,
          });
          set({
            analyticsSubjectAttempts:
              ((res as any).data?.data as IAnalyticsSubjectAttempt[]) ?? [],
            isLoadingSubjectAttempts: false,
          });
        } catch {
          set({ isLoadingSubjectAttempts: false });
        }
      },

      fetchAnalyticsSubjectScoresRange: async ({
        examTypeId,
        startDate,
        endDate,
        timezone,
      }) => {
        set({ isLoadingSubjectScoreAnalytics: true });
        const tz = encodeURIComponent(
          timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
        );
        const params = new URLSearchParams({ examTypeId, timezone: tz });
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
        try {
          const res = await authRequest({
            method: "GET",
            url: `/students/analytics/subject-accuracy?${params.toString()}`,
          });
          set({
            analyticsSubjectScoresRange:
              ((res as any).data?.data as { name: string; Score: number }[]) ??
              null,
            isLoadingSubjectScoreAnalytics: false,
          });
        } catch {
          set({ isLoadingSubjectScoreAnalytics: false });
        }
      },

      fetchAnalyticsRankingRange: async ({
        examTypeId,
        startDate,
        endDate,
      }) => {
        set({ isLoadingRankingAnalytics: true });
        const params = new URLSearchParams({ examTypeId });
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
        try {
          const res = await authRequest({
            method: "GET",
            url: `/students/analytics/ranking?${params.toString()}`,
          });
          set({
            analyticsRanking:
              ((res as any).data?.data as IAnalyticsRanking) ?? null,
            isLoadingRankingAnalytics: false,
          });
        } catch {
          set({ isLoadingRankingAnalytics: false });
        }
      },
    }),
    {
      name: "student-profile",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
