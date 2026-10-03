"use client";

import { Button, ProgressBar, StatusChip } from "@/components/atoms";
import { cn } from "@/lib/utils";
import { useAuthStore, useAffiliateStore } from "@/store";
import { CURRENCY_SYMBOLS, buildAffiliateLink } from "@/utils";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AffiliateSkeleton from "./AffiliateSkeleton";

export default function Affiliate() {
  const { user, accessToken } = useAuthStore();
  const {
    dashboard,
    isLoadingDashboard,
    commissions,
    isLoadingCommissions,
    earningsByPlan,
    selectedCurrency,
    fetchDashboard,
    fetchCommissions,
    fetchEarningsByPlan,
  } = useAffiliateStore();

  const [copied, setCopied] = useState(false);

  const currencySymbol = CURRENCY_SYMBOLS[selectedCurrency] || "$";

  useEffect(() => {
    if (!accessToken) return;
    fetchDashboard();
    fetchCommissions(1, 6);
    fetchEarningsByPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, selectedCurrency]);

  const affiliateCode = dashboard?.affiliateCode || "";
  const affiliateLink = buildAffiliateLink(affiliateCode);

  const handleCopy = () => {
    navigator.clipboard.writeText(affiliateLink);
    toast.success("Affiliate link copied!");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const conversionRate = dashboard
    ? (dashboard.conversionRate * 100).toFixed(1)
    : "0";

  if (isLoadingDashboard) {
    return <AffiliateSkeleton />;
  }

  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
      {/* Header Banner */}
      <section
        style={{
          background: "linear-gradient(180deg, #1E8FFF 0%, #0E43FF 100%)",
        }}
        className="relative mb-5 p-[1.6875rem_1.25rem_2.25rem_1.25rem] rounded-[1rem] overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url(/images/affiliate-bg-pattern.png)] w-full h-full opacity-20 bg-center bg-cover" />
        <div className="relative z-10">
          <h1 className="text-white text-[1.5rem] leading-8 tracking-[-.48px] font-[600] mb-1">
            Welcome, {user?.firstName} {user?.lastName}
          </h1>
          <p className="leading-6 font-[400] text-[1rem] mb-4.75 text-white">
            {user?.lastLoginAt
              ? `Last login: ${new Date(user.lastLoginAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} at ${new Date(user.lastLoginAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`
              : "Welcome to your affiliate dashboard"}
          </p>
          <div className="flex items-center gap-3">
            <div className="p-[.375rem_.5rem] rounded-[1rem] bg-[#F0F7FF] w-fit text-[#0063AD] font-[500] leading-5 text-[.875rem]">
              Affiliate ID: {affiliateCode || "..."}
            </div>
            <div className="p-[.375rem_.5rem] rounded-[1rem] bg-white/20 w-fit text-white font-[500] leading-5 text-[.875rem]">
              {selectedCurrency}
            </div>
          </div>
        </div>
      </section>

      {/* Affiliate Link */}
      <section
        style={{
          boxShadow:
            "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
        }}
        className="bg-[#E5E8F8] border-[#39F] border rounded-[1rem] p-[2rem_1.5rem_1.5rem_1.5rem]"
      >
        <div className="flex gap-[1rem] mb-7 items-center">
          <div
            style={{ boxShadow: "0 3px 14px 0 rgba(0, 0, 0, 0.08)" }}
            className="w-10 flex items-center justify-center rounded-[50%] bg-[#E5E8F8] h-10"
          >
            <Icon
              className="w-6 h-6 text-[#007FFF]"
              icon={"hugeicons:link-01"}
            />
          </div>
          <div className="flex flex-col gap-[.25rem]">
            <span className="text-[#2B2B2B] text-[1.125rem] font-[500] leading-7 block">
              Your Unique Affiliate Link
            </span>
            <span className="leading-5 font-[400] text-[.875rem] text-[#757575]">
              Share this link to start earning commissions
            </span>
          </div>
        </div>
        <div className="flex gap-[.5rem] items-stretch">
          <span className="flex-1 bg-[#FAFAFA] h-full rounded-[1.5rem] p-[.75rem_1rem] border border-[#D6D6D6] text-sm truncate">
            {affiliateLink}
          </span>
          <Button onClick={handleCopy}>
            <Icon
              className="w-5 h-5"
              icon={copied ? "hugeicons:tick-01" : "hugeicons:copy-01"}
            />
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>
      </section>

      {/* Stat Cards */}
      <section className="grid mt-6 grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        {[
          {
            icon: "hugeicons:user-group-03",
            label: "Total Students",
            value: dashboard?.totalReferrals ?? 0,
            iconBg: "bg-[#F7F8FD]",
            iconColor: "text-[#6A7BD6]",
            footer: {
              text: `${dashboard?.referredNotSubscribed ?? 0} Pending`,
              chip: {
                text: `${dashboard?.totalConversions ?? 0} Active`,
              },
            },
          },
          {
            icon: "hugeicons:chart-evaluation",
            label: "Conversion Rate",
            value: `${conversionRate}%`,
            iconBg: "bg-[#F3F3F3]",
            iconColor: "text-[#E32E89]",
            footer: {
              text: "Per successful registration",
            },
          },
          {
            icon: "hugeicons:money-receive-02",
            label: "Total Earnings",
            value: `${currencySymbol}${(dashboard?.totalEarnings ?? 0).toLocaleString()}`,
            iconBg: "bg-[#E7F6EC]",
            iconColor: "text-[#099137]",
            footer: {
              text: `${currencySymbol}${(dashboard?.pendingBalance ?? 0).toLocaleString()} pending`,
            },
          },
        ].map(({ icon, iconBg, iconColor, label, value, footer }, index) => (
          <div
            key={`__item__${index}`}
            style={{
              boxShadow:
                "0 4px 4px 0 rgba(0, 0, 0, 0.00), 0 7px 12px 0 rgba(0, 0, 0, 0.02)",
            }}
            className="bg-white rounded-xl py-5 px-4 border border-[#D6D6D6]"
          >
            <div
              className={`${iconBg} rounded-lg flex p-[.875rem] w-fit items-center justify-center mb-4`}
            >
              <Icon
                icon={icon}
                height={"1.5rem"}
                width={"1.5rem"}
                className={iconColor}
              />
            </div>
            <p className="text-[#575757] text-sm mb-1">{label}</p>
            <p className="text-[1.75rem] mb-4 leading-[2.25rem] font-[500] text-[#2B2B2B]">
              {isLoadingDashboard ? "..." : value}
            </p>
            <div className="flex gap-[.25rem] items-center">
              {footer?.chip && (
                <span
                  className={cn(
                    "p-[.125rem_.375rem] text-[.75rem] flex items-center gap-[.25rem] rounded-[.625rem] leading-5 font-[500]",
                    "bg-[#E7F6EC] text-[#036B26]",
                  )}
                >
                  {footer.chip.text}
                </span>
              )}
              <span className="text-[#757575] font-[500] leading-5 text-[.75rem]">
                {footer?.text}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Bottom Section */}
      <section className="flex items-start justify-between">
        {/* Recent Commissions */}
        <div
          style={{
            boxShadow:
              "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
          }}
          className="w-[59%] flex flex-col max-h-129.5 bg-white rounded-[.75rem] p-[2rem_1.5rem]"
        >
          <div className="flex justify-between items-center mb-8.5">
            <div className="flex items-center gap-[1.25rem]">
              <span
                className="w-10 h-10 flex items-center justify-center rounded-[50%]"
                style={{ boxShadow: "0 3px 14px 0 rgba(0, 0, 0, 0.08)" }}
              >
                <Icon className="w-6 h-6" icon={"hugeicons:user-group-03"} />
              </span>
              <div className="flex flex-col">
                <span className="text-[1.125rem] font-[500] leading-7">
                  Recent Commissions
                </span>
                <span className="leading-5 text-[.875rem] text-[#757575] font-[400]">
                  Latest students from your link
                </span>
              </div>
            </div>
            <Link
              href={"/affiliates/commissions"}
              className="p-2 rounded-[.5rem] text-[.874rem] font-[600] leading-5 text-[#007FFF] border-[1.5px] border-[#007FFF]"
            >
              View All
            </Link>
          </div>
          <div className="flex flex-1 flex-col gap-[.75rem] no-scrollbar overflow-auto">
            {isLoadingCommissions ? (
              <div className="flex items-center justify-center py-8">
                <Icon
                  icon="svg-spinners:ring-resize"
                  className="w-6 h-6 text-blue-500"
                />
              </div>
            ) : commissions.length === 0 ? (
              <p className="text-center text-[#757575] text-sm py-8">
                No commissions yet. Share your link to start earning!
              </p>
            ) : (
              commissions.map((commission) => (
                <div
                  key={commission.id}
                  className="p-4 bg-white border h-fit w-full border-[#DCDFE4] rounded-[.625rem] flex justify-between"
                >
                  <div className="flex flex-col justify-between gap-[.25rem]">
                    <span className="font-[600] text-[1rem] leading-6">
                      {commission.referral?.referredUser
                        ? `${commission.referral.referredUser.firstName} ${commission.referral.referredUser.lastName}`
                        : "Unknown"}
                    </span>
                    <span className="text-[.875rem] font-[400] leading-5">
                      {commission.planName || "N/A"} &bull;{" "}
                      {new Date(commission.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-col justify-between items-end gap-[.25rem]">
                    <span className="leading-7 text-[1.125rem] font-[600] text-[#2B2B2B]">
                      {CURRENCY_SYMBOLS[commission.currency] || ""}
                      {commission.subscriptionAmount?.toLocaleString()}{" "}
                      <small>
                        ({CURRENCY_SYMBOLS[commission.currency] || ""}
                        {commission.amount?.toLocaleString()})
                      </small>
                    </span>
                    <StatusChip id={commission.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div
          style={{
            boxShadow:
              "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
          }}
          className="w-[39%] flex flex-col max-h-129.5 bg-white rounded-[.75rem] p-[2rem_1.5rem]"
        >
          <div className="flex items-center gap-[1.25rem] mb-8.5">
            <span
              className="w-10 h-10 flex items-center justify-center rounded-[50%]"
              style={{ boxShadow: "0 3px 14px 0 rgba(0, 0, 0, 0.08)" }}
            >
              <Icon className="w-6 h-6" icon={"hugeicons:chart-evaluation"} />
            </span>
            <div className="flex flex-col">
              <span className="text-[1.125rem] font-[500] leading-7">
                Performance Metrics
              </span>
              <span className="leading-5 text-[.875rem] text-[#757575] font-[400]">
                Your conversion and engagement stats
              </span>
            </div>
          </div>

          <div className="flex justify-between mb-2 items-center">
            <span className="text-[#2B2B2B] leading-5 text-[.875rem] font-[500]">
              Conversion Rate
            </span>
            <span className="font-[600] text-[.875rem] leading-5 text-[#757575]">
              {conversionRate}%
            </span>
          </div>
          <ProgressBar value={parseFloat(conversionRate)} height={12} />

          <div className="my-3 bg-[#EDEDED] h-[1px] w-full" />

          <div className="flex gap-[1rem]">
            <div className="h-21 flex-1 p-4 flex flex-col gap-[.25rem] rounded-[.625rem] bg-[#F1FCFF] items-center justify-center">
              <span className="font-[700] text-[1.5rem] leading-8 text-[#41BCE2] tracking-[-.48px]">
                {dashboard?.totalConversions ?? 0}
              </span>
              <span className="text-[.75rem] font-[400] text-[#757575] leading-5">
                Conversions
              </span>
            </div>
            <div className="h-21 flex-1 p-4 flex flex-col gap-[.25rem] rounded-[.625rem] bg-[#E7F6EC] items-center justify-center">
              <span className="font-[700] text-[1.5rem] leading-8 text-[#0F973D] tracking-[-.48px]">
                {currencySymbol}
                {dashboard && dashboard.totalConversions > 0
                  ? (
                      dashboard.totalEarnings / dashboard.totalConversions
                    ).toLocaleString(undefined, { maximumFractionDigits: 0 })
                  : "0"}
              </span>
              <span className="text-[.75rem] font-[400] text-[#757575] leading-5">
                Avg Per Student
              </span>
            </div>
          </div>

          <div className="my-3 bg-[#EDEDED] h-[1px] w-full" />

          <div className="p-[.75rem_.5rem]">
            <h6 className="text-[.874rem] font-[400] leading-5 text-[#2B2B2B] mb-3 mt-2">
              Earnings Breakdown
            </h6>
            <div className="flex flex-col gap-[.5rem]">
              {earningsByPlan.length === 0 ? (
                <p className="text-[.875rem] text-[#757575]">
                  No earnings data yet
                </p>
              ) : (
                earningsByPlan.map((plan, index) => (
                  <div
                    key={`___plan_breakdown__${index}`}
                    className="flex items-center justify-between"
                  >
                    <span className="text-[.875rem] text-[#757575] font-[400] leading-5">
                      {plan.planName || "Unknown Plan"}
                    </span>
                    <span className="text-[.875rem] font-[600] text-[#2B2B2B] leading-5">
                      {currencySymbol}
                      {parseFloat(plan.totalEarnings).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
