"use client";

import { StatusChip, SVGClient } from "@/components/atoms";
import { Chart } from "@/components/molecules";
import { PayoutStatus } from "@/types";
import { useAuthStore, useAffiliateStore } from "@/store";
import {
  CURRENCY_SYMBOLS,
  BRAND_COLORS,
  GRANULARITY_OPTIONS,
  formatPeriodLabel,
} from "@/utils";
import { Icon } from "@iconify/react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import EarningsSkeleton from "./EarningsSkeleton";
import { WithdrawModal } from "@/app/(dashboard)/affiliates/settings/payouts/WithdrawModal";

const Earnings = () => {
  const { accessToken } = useAuthStore();
  const {
    dashboard,
    isLoadingDashboard,
    earningsOverTime,
    earningsByPlan,
    isLoadingEarningsByPlan,
    payouts,
    payoutsTotal,
    payoutsPage,
    isLoadingPayouts,
    selectedCurrency,
    fetchDashboard,
    fetchEarningsOverTime,
    fetchEarningsByPlan,
    fetchPayouts,
  } = useAffiliateStore();

  const currencySymbol = CURRENCY_SYMBOLS[selectedCurrency] || "$";

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [granularity, setGranularity] = useState<"day" | "week" | "month">(
    "week",
  );
  const [isChartLoading, setIsChartLoading] = useState(false);

  const activeOption =
    GRANULARITY_OPTIONS.find((p) => p.value === granularity) ??
    GRANULARITY_OPTIONS[1];

  useEffect(() => {
    if (!accessToken) return;
    fetchDashboard();
    fetchEarningsByPlan();
    fetchPayouts(1, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, selectedCurrency]);

  useEffect(() => {
    if (!accessToken) return;
    const load = async () => {
      setIsChartLoading(true);
      // Backend computes its own date range — we just pass granularity + currency
      await fetchEarningsOverTime(undefined, undefined, granularity);
      setIsChartLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, selectedCurrency, granularity]);

  // Format earnings over time for area chart
  const areaChartData = earningsOverTime.map((item) => ({
    name: formatPeriodLabel(item.period, granularity),
    Earnings: Number(item.earnings) || 0,
  }));

  // Format earnings by plan for pie chart
  const pieChartData = earningsByPlan.map((item, index) => ({
    name: item.planName || "Unknown",
    value: Number(item.totalEarnings) || 0,
    fill: BRAND_COLORS[index % BRAND_COLORS.length],
  }));

  const payoutsPerPage = 10;
  const payoutsTotalPages = Math.ceil(payoutsTotal / payoutsPerPage);

  if (isLoadingDashboard) {
    return <EarningsSkeleton />;
  }

  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
      <section className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-[600] text-[#171717]">
            Earnings Tracking
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitor your commission and financial performance
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Wallet Balance Card */}
        <div
          style={{
            background: "linear-gradient(226deg, #182B3F 39.68%, #000 99.02%)",
            boxShadow:
              "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
          }}
          className="p-6 min-h-65 flex justify-between flex-col rounded-[.75rem]"
        >
          <div>
            <span className="text-[#D6D6D6] leading-7 font-[500] text-[1.125rem]">
              Wallet Balance
            </span>
            <h3 className="tracking-[-.8px] mt-1 leading-12 font-[600] text-[2.5rem] text-white">
              {isLoadingDashboard
                ? "..."
                : `${currencySymbol}${(dashboard?.pendingBalance ?? 0).toLocaleString()}`}
            </h3>
          </div>
          <div className="flex flex-col gap-[1rem]">
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="w-full text-[1rem] font-[600] leading-6 text-black flex justify-center items-center gap-[.5rem] p-3 rounded-[.5rem] bg-white hover:bg-[#F2F4F7] transition-colors"
            >
              <Icon className="text-inherit w-6 h-6" icon="hugeicons:money-04" />
              Withdraw
            </button>
            <Link
              href="/affiliates/settings/payouts"
              className="flex text-white text-[1rem] font-[600] leading-6 gap-[.5rem] items-center w-fit mx-auto hover:underline"
            >
              <Icon className="h-6 w-6" icon="hugeicons:plus-sign-circle" />
              Add payout account
            </Link>
          </div>
        </div>

        {/* Lifetime Commission Card */}
        <div
          style={{
            boxShadow:
              "0 4px 4px 0 rgba(0, 0, 0, 0.00), 0 7px 12px 0 rgba(0, 0, 0, 0.02)",
          }}
          className="bg-white flex items-center rounded-xl py-5 px-4 border border-[#D6D6D6]"
        >
          <div>
            <div
              className={`bg-[#E7F6EC] rounded-lg flex p-[.875rem] w-fit items-center justify-center mb-4`}
            >
              <Icon
                icon={"hugeicons:money-receive-02"}
                height={"1.5rem"}
                width={"1.5rem"}
                className={"text-[#099137]"}
              />
            </div>
            <p className="text-[#575757] text-sm mb-1">
              Lifetime Commission Earned
            </p>
            <p className="text-[1.75rem] mb-4 leading-[2.25rem] font-[500] text-[#2B2B2B]">
              {isLoadingDashboard
                ? "..."
                : `${currencySymbol}${(dashboard?.totalEarnings ?? 0).toLocaleString()}`}
            </p>
            <div className="flex gap-[.25rem] items-center">
              {dashboard && (
                <>
                  <span
                    className={cn(
                      "p-[.125rem_.375rem] text-[.75rem] flex items-center gap-[.25rem] rounded-[.625rem] leading-5 font-[500]",
                      (dashboard.totalEarnings ?? 0) >=
                        (dashboard.previousMonth?.earnings ?? 0)
                        ? "bg-[#E7F6EC] text-[#036B26]"
                        : "bg-red-100 text-red-500",
                    )}
                  >
                    <Icon
                      icon={
                        (dashboard.totalEarnings ?? 0) >=
                        (dashboard.previousMonth?.earnings ?? 0)
                          ? "hugeicons:arrow-up-right-01"
                          : "hugeicons:arrow-down-left-01"
                      }
                      className="w-4 h-4"
                    />
                    {dashboard.previousMonth?.earnings
                      ? (
                          (Math.abs(
                            (dashboard.totalEarnings ?? 0) -
                              (dashboard.previousMonth?.earnings ?? 0),
                          ) /
                            (dashboard.previousMonth?.earnings || 1)) *
                          100
                        ).toFixed(1)
                      : "0"}
                    %
                  </span>
                  <span className="text-[#757575] font-[500] leading-5 text-[.75rem]">
                    from last month
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Payout Account Placeholder */}
        <div
          style={{
            boxShadow:
              "0 4px 4px 0 rgba(0, 0, 0, 0.00), 0 7px 12px 0 rgba(0, 0, 0, 0.02)",
          }}
          className="bg-white flex items-center rounded-xl py-5 px-4 border flex-col border-[#D6D6D6]"
        >
          <SVGClient src="/svg/payout.svg" />
          <p className="leading-5 text-center max-w-60 font-[400] text-[#757575] text-[.875rem]">
            Add a payout account to start earning commission based on referrals
            and invites. Your payout account will appear here
          </p>
        </div>
      </section>

      {/* Monthly Performance Chart */}
      <section
        style={{
          boxShadow:
            "0 4px 4px 0 rgba(0, 0, 0, 0.00), 0 7px 12px 0 rgba(0, 0, 0, 0.02)",
        }}
        className="bg-white rounded-xl p-4 border border-[#D6D6D6]"
      >
        <div className="flex items-center px-[.5rem] justify-between mb-6">
          <div>
            <h3 className="font-[500] leading-7 text-[1.125rem] text-gray-900">
              Earnings Performance
            </h3>
            <p className="text-[#757575] text-[.875rem] font-[400] leading-5">
              {activeOption.hint} — {currencySymbol} earnings
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setPeriodOpen(!periodOpen)}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              {activeOption.label}
              <Icon icon="hugeicons:arrow-down-01" className="w-4 h-4" />
            </button>
            {periodOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                {GRANULARITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setGranularity(option.value);
                      setPeriodOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      granularity === option.value
                        ? "bg-[#F3F3F3] text-[#A12161] font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="block">{option.label}</span>
                    <span className="block text-xs text-gray-400">
                      {option.hint}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="h-[400px] relative">
          {isChartLoading ? (
            <div className="flex items-center justify-center h-full">
              <Icon
                icon="svg-spinners:ring-resize"
                className="w-12 h-12 text-[#3399FF]"
              />
            </div>
          ) : areaChartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Icon
                icon="hugeicons:chart-evaluation"
                className="w-12 h-12 text-gray-300 mb-3"
              />
              <p className="text-[#757575] text-sm">
                No earnings data for this period
              </p>
            </div>
          ) : (
            <Chart
              type="area"
              data={areaChartData}
              labelProps={[
                {
                  title: "Earnings",
                  color: "#3399FF",
                  colorId: "earnings",
                },
              ]}
              prefersToolTip
              legendInfo={{
                prefers: true,
                align: "horizontal",
                offset: "out-context",
              }}
            />
          )}
        </div>
      </section>

      {/* Bottom Row: Withdrawal History + Earnings by Package */}
      <section className="flex flex-col xl:flex-row mt-6 gap-6 justify-between">
        {/* Withdrawal History */}
        <div
          style={{
            boxShadow:
              "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
          }}
          className="xl:w-[59%] w-full flex flex-col max-h-129.5 bg-white rounded-[.75rem] p-[2rem_1.5rem]"
        >
          <div className="flex justify-between items-center mb-8.5">
            <h4 className="text-[1.125rem] font-[500] leading-7">
              Withdrawal History
            </h4>
          </div>
          <div className="flex flex-1 flex-col gap-[.75rem] no-scrollbar overflow-auto">
            {isLoadingPayouts ? (
              <div className="flex items-center justify-center py-12">
                <Icon
                  icon="svg-spinners:ring-resize"
                  className="w-8 h-8 text-blue-500"
                />
              </div>
            ) : payouts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Icon
                  icon="hugeicons:money-send-02"
                  className="w-12 h-12 text-gray-300 mb-3"
                />
                <p className="text-[#757575] text-sm">No withdrawals yet</p>
              </div>
            ) : (
              payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="p-4 bg-white border h-fit w-full border-[#DCDFE4] rounded-[.625rem] flex justify-between"
                >
                  <div className="flex flex-col justify-between gap-[.25rem]">
                    <span className="font-[600] text-[1rem] leading-6">
                      {payout.id.slice(0, 14).toUpperCase()}
                    </span>
                    <span className="text-[.875rem] font-[400] leading-5">
                      {new Date(payout.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-col justify-between items-end gap-[.25rem]">
                    <span className="leading-7 text-[1.125rem] font-[600] text-[#2B2B2B]">
                      {currencySymbol}
                      {payout.amount.toLocaleString()}
                    </span>
                    <StatusChip
                      type="payout"
                      id={payout.status as PayoutStatus}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Pagination */}
          {payoutsTotalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#EAECF0]">
              <span className="text-sm text-[#757575]">
                Page {payoutsPage} of {payoutsTotalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={payoutsPage <= 1}
                  onClick={() => fetchPayouts(payoutsPage - 1, payoutsPerPage)}
                  className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={payoutsPage >= payoutsTotalPages}
                  onClick={() => fetchPayouts(payoutsPage + 1, payoutsPerPage)}
                  className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Earnings by Package */}
        <div
          style={{
            boxShadow:
              "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
          }}
          className="xl:w-[39%] w-full border border-[#D6D6D6] flex flex-col bg-white rounded-[.75rem] p-[2rem_1.5rem]"
        >
          <div className="flex flex-col">
            <span className="text-[1.125rem] font-[500] leading-7">
              Earnings by Package
            </span>
            <span className="leading-5 text-[.875rem] text-[#757575] font-[400]">
              Commission breakdown by student package type
            </span>
          </div>
          <div className="flex-1 min-h-[300px] relative">
            {isLoadingEarningsByPlan && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                <Icon
                  icon="svg-spinners:ring-resize"
                  className="w-8 h-8 text-blue-500"
                />
              </div>
            )}
            {pieChartData.length === 0 && !isLoadingEarningsByPlan ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Icon
                  icon="hugeicons:chart-evaluation"
                  className="w-12 h-12 text-gray-300 mb-3"
                />
                <p className="text-[#757575] text-sm">No earnings data yet</p>
              </div>
            ) : (
              <Chart
                type="pie"
                data={pieChartData}
                pieChartProps={{ isHollow: true }}
              />
            )}
          </div>
        </div>
      </section>

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        settingsPath="/affiliates/settings/payouts"
      />
    </section>
  );
};

export default Earnings;
