import {
  IAffiliateStore,
  IAffiliateDashboard,
  IAffiliateCommission,
  IAffiliateReferral,
  IEarningsByPlan,
  IEarningsByCurrency,
  IEarningsOverTime,
  IAffiliatePayout,
  IPayoutAccount,
  ICurrencyBalance,
} from "@/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authRequest } from "@/lib/api";
import { handleAxiosError } from "@/utils";
import { toast } from "sonner";

export const useAffiliateStore = create<IAffiliateStore>()(
  persist(
    (set, get) => ({
      hydrated: false,
      profile: null,

      // Currency
      availableCurrencies: [],
      selectedCurrency: "NGN",
      currencyManuallySet: false,

      // Dashboard
      dashboard: null,
      isLoadingDashboard: false,

      // Commissions
      commissions: [],
      commissionsTotal: 0,
      commissionsPage: 1,
      isLoadingCommissions: false,

      // Referrals
      referrals: [],
      referralsTotal: 0,
      referralsPage: 1,
      isLoadingReferrals: false,

      // Earnings by plan
      earningsByPlan: [],
      isLoadingEarningsByPlan: false,

      // Earnings by currency
      earningsByCurrency: [] as IEarningsByCurrency[],

      // Earnings over time
      earningsOverTime: [],
      isLoadingEarningsOverTime: false,

      // Payouts
      payouts: [],
      payoutsTotal: 0,
      payoutsPage: 1,
      isLoadingPayouts: false,

      // Payout accounts
      payoutAccounts: [] as IPayoutAccount[],
      isLoadingPayoutAccounts: false,
      isManagingPayoutAccount: false,

      // Currency balances
      currencyBalances: [] as ICurrencyBalance[],
      isLoadingBalances: false,

      // Actions
      isWithdrawing: false,
      isUpdatingCode: false,

      // Setters
      setHydrated: () => set({ hydrated: true }),
      setProfile: (profile) => set({ profile }),
      clearProfile: () =>
        set({
          profile: null,
          dashboard: null,
          commissions: [],
          referrals: [],
          earningsByPlan: [],
          earningsByCurrency: [],
          earningsOverTime: [],
          payouts: [],
          payoutAccounts: [],
          currencyBalances: [],
        }),

      setCurrencies: (currencies) => set({ availableCurrencies: currencies }),
      setSelectedCurrency: (currency) => set({ selectedCurrency: currency, currencyManuallySet: true }),

      fetchCurrencies: async () => {
        try {
          const res = await authRequest({
            method: "GET",
            url: "/subscriptions/available-currencies",
          });
          const data = (res as any).data?.data as {
            currencies: string[];
            defaultCurrency: string;
          } | null;
          if (data) {
            set({ availableCurrencies: data.currencies });
            // Only override if user has never explicitly chosen a currency
            if (!get().currencyManuallySet) {
              set({ selectedCurrency: data.defaultCurrency });
            }
          }
        } catch (error) {
          handleAxiosError(error, "Failed to load currencies");
        }
      },

      // Dashboard
      fetchDashboard: async () => {
        set({ isLoadingDashboard: true });
        try {
          const currency = get().selectedCurrency;
          const res = await authRequest({
            method: "GET",
            url: `/affiliates/dashboard?currency=${currency}`,
          });
          const data = (res as any).data?.data as IAffiliateDashboard | null;
          set({ dashboard: data, isLoadingDashboard: false });
        } catch (error) {
          set({ isLoadingDashboard: false });
          handleAxiosError(error, "Failed to load dashboard");
        }
      },

      // Commissions
      fetchCommissions: async (page = 1, limit = 10) => {
        set({ isLoadingCommissions: true });
        try {
          const currency = get().selectedCurrency;
          const res = await authRequest({
            method: "GET",
            url: `/affiliates/commissions?page=${page}&limit=${limit}&currency=${currency}`,
          });
          const result = (res as any).data as {
            data: IAffiliateCommission[];
            total: number;
            page: number;
          };
          set({
            commissions: result.data,
            commissionsTotal: result.total,
            commissionsPage: result.page,
            isLoadingCommissions: false,
          });
        } catch (error) {
          set({ isLoadingCommissions: false });
          handleAxiosError(error, "Failed to load commissions");
        }
      },

      // Referrals
      fetchReferrals: async (page = 1, limit = 10) => {
        set({ isLoadingReferrals: true });
        try {
          const currency = get().selectedCurrency;
          const res = await authRequest({
            method: "GET",
            url: `/affiliates/referrals?page=${page}&limit=${limit}&currency=${currency}`,
          });
          const result = (res as any).data as {
            data: IAffiliateReferral[];
            total: number;
            page: number;
          };
          set({
            referrals: result.data,
            referralsTotal: result.total,
            referralsPage: result.page,
            isLoadingReferrals: false,
          });
        } catch (error) {
          set({ isLoadingReferrals: false });
          handleAxiosError(error, "Failed to load referrals");
        }
      },

      // Earnings by plan
      fetchEarningsByPlan: async () => {
        set({ isLoadingEarningsByPlan: true });
        try {
          const currency = get().selectedCurrency;
          const res = await authRequest({
            method: "GET",
            url: `/affiliates/earnings-by-plan?currency=${currency}`,
          });
          const data = (res as any).data?.data as IEarningsByPlan[];
          set({ earningsByPlan: data || [], isLoadingEarningsByPlan: false });
        } catch (error) {
          set({ isLoadingEarningsByPlan: false });
          handleAxiosError(error, "Failed to load earnings by plan");
        }
      },

      // Earnings by currency — drives the currency selector
      fetchEarningsByCurrency: async () => {
        try {
          const res = await authRequest({
            method: "GET",
            url: "/affiliates/earnings-by-currency",
          });
          const data = (res as any).data?.data as IEarningsByCurrency[];
          if (data?.length) {
            set({ earningsByCurrency: data });
          }
        } catch (error) {
          handleAxiosError(error, "Failed to load currency data");
        }
      },

      // Earnings over time — backend owns the date range, we just pass granularity + timezone
      fetchEarningsOverTime: async (_startDate, _endDate, granularity) => {
        set({ isLoadingEarningsOverTime: true });
        try {
          const currency = get().selectedCurrency;
          const tz = encodeURIComponent(
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          );
          const url = `/affiliates/earnings-over-time?currency=${currency}&granularity=${granularity ?? "day"}&timezone=${tz}`;

          const res = await authRequest({ method: "GET", url });
          const data = (res as any).data?.data as IEarningsOverTime[];
          set({
            earningsOverTime: data || [],
            isLoadingEarningsOverTime: false,
          });
        } catch (error) {
          set({ isLoadingEarningsOverTime: false });
          handleAxiosError(error, "Failed to load earnings over time");
        }
      },

      // Payouts
      fetchPayouts: async (page = 1, limit = 10) => {
        set({ isLoadingPayouts: true });
        try {
          const res = await authRequest({
            method: "GET",
            url: `/affiliates/payouts?page=${page}&limit=${limit}`,
          });
          const result = (res as any).data as {
            data: IAffiliatePayout[];
            total: number;
            page: number;
          };
          set({
            payouts: result.data,
            payoutsTotal: result.total,
            payoutsPage: result.page,
            isLoadingPayouts: false,
          });
        } catch (error) {
          set({ isLoadingPayouts: false });
          handleAxiosError(error, "Failed to load payouts");
        }
      },

      // Withdrawal
      requestWithdrawal: async (amount, currency, payoutAccountId, callback) => {
        set({ isWithdrawing: true });
        try {
          await authRequest({
            method: "POST",
            url: "/affiliates/withdraw",
            data: { amount, currency, payoutAccountId },
          });
          set({ isWithdrawing: false });
          toast.success("Withdrawal requested successfully");
          get().fetchDashboard();
          get().fetchPayouts();
          get().fetchBalances();
          callback?.();
        } catch (error) {
          set({ isWithdrawing: false });
          handleAxiosError(error, "Failed to request withdrawal");
        }
      },

      // Payout accounts
      fetchPayoutAccounts: async () => {
        set({ isLoadingPayoutAccounts: true });
        try {
          const res = await authRequest({ method: "GET", url: "/affiliates/payout-accounts" });
          const data = (res as any).data?.data as IPayoutAccount[];
          set({ payoutAccounts: data || [], isLoadingPayoutAccounts: false });
        } catch (error) {
          set({ isLoadingPayoutAccounts: false });
          handleAxiosError(error, "Failed to load payout accounts");
        }
      },

      addPayoutAccount: async (data, callback) => {
        set({ isManagingPayoutAccount: true });
        try {
          await authRequest({ method: "POST", url: "/affiliates/payout-accounts", data });
          set({ isManagingPayoutAccount: false });
          toast.success("Payout account added");
          get().fetchPayoutAccounts();
          callback?.();
        } catch (error) {
          set({ isManagingPayoutAccount: false });
          handleAxiosError(error, "Failed to add payout account");
        }
      },

      removePayoutAccount: async (accountId) => {
        set({ isManagingPayoutAccount: true });
        try {
          await authRequest({ method: "DELETE", url: `/affiliates/payout-accounts/${accountId}` });
          set((s) => ({
            payoutAccounts: s.payoutAccounts.filter((a) => a.id !== accountId),
            isManagingPayoutAccount: false,
          }));
          toast.success("Payout account removed");
        } catch (error) {
          set({ isManagingPayoutAccount: false });
          handleAxiosError(error, "Failed to remove payout account");
        }
      },

      setDefaultPayoutAccount: async (accountId) => {
        set({ isManagingPayoutAccount: true });
        try {
          await authRequest({ method: "PATCH", url: `/affiliates/payout-accounts/${accountId}/default` });
          set((s) => ({
            payoutAccounts: s.payoutAccounts.map((a) => ({
              ...a,
              isDefault: a.id === accountId,
            })),
            isManagingPayoutAccount: false,
          }));
        } catch (error) {
          set({ isManagingPayoutAccount: false });
          handleAxiosError(error, "Failed to update default account");
        }
      },

      // Per-currency balances
      fetchBalances: async () => {
        set({ isLoadingBalances: true });
        try {
          const res = await authRequest({ method: "GET", url: "/affiliates/balances" });
          const data = (res as any).data?.data as ICurrencyBalance[];
          set({ currencyBalances: data || [], isLoadingBalances: false });
        } catch (error) {
          set({ isLoadingBalances: false });
          handleAxiosError(error, "Failed to load balances");
        }
      },

      // Update affiliate code
      checkCodeAvailability: async (code) => {
        try {
          const res = await authRequest({
            method: "GET",
            url: `/affiliates/check-code/${code}`,
          });
          const data = (res as any).data?.data as {
            available: boolean;
            message?: string;
          };
          return data;
        } catch (error) {
          handleAxiosError(error, "Failed to check code availability");
          return { available: false, message: "Error checking availability" };
        }
      },

      updateAffiliateCode: async (code, callback) => {
        set({ isUpdatingCode: true });
        try {
          const res = await authRequest({
            method: "PATCH",
            url: "/affiliates/code",
            data: { code },
          });
          const updatedProfile = (res as any).data?.data;
          const currentProfile = get().profile;
          if (currentProfile && updatedProfile) {
            set({
              profile: {
                ...currentProfile,
                affiliateCode: updatedProfile.affiliateCode,
              },
            });
          }
          get().fetchDashboard();
          set({ isUpdatingCode: false });
          toast.success("Affiliate code updated successfully");
          callback?.();
        } catch (error) {
          set({ isUpdatingCode: false });
          handleAxiosError(error, "Failed to update affiliate code");
        }
      },
    }),
    {
      name: "affiliate-profile",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        hydrated: state.hydrated,
        selectedCurrency: state.selectedCurrency,
        currencyManuallySet: state.currencyManuallySet,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
