"use client";

import { Table } from "@/components/molecules";
import { StatusChip } from "@/components/atoms";
import { cn } from "@/lib/utils";
import { useAuthStore, useAffiliateStore } from "@/store";
import { CURRENCY_SYMBOLS, calculateGrowth } from "@/utils";
import { Icon } from "@iconify/react";
import React, { useEffect } from "react";
import StudentsSkeleton from "./StudentsSkeleton";

const Students = () => {
  const { accessToken } = useAuthStore();
  const {
    dashboard,
    isLoadingDashboard,
    referrals,
    referralsTotal,
    referralsPage,
    isLoadingReferrals,
    selectedCurrency,
    fetchDashboard,
    fetchReferrals,
  } = useAffiliateStore();

  const currencySymbol = CURRENCY_SYMBOLS[selectedCurrency] || "$";

  useEffect(() => {
    if (!accessToken) return;
    fetchDashboard();
    fetchReferrals(1, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, selectedCurrency]);

  const referralsMetric = calculateGrowth(
    dashboard?.totalReferrals ?? 0,
    dashboard?.previousMonth?.referrals ?? 0,
  );
  const conversionsMetric = calculateGrowth(
    dashboard?.totalConversions ?? 0,
    dashboard?.previousMonth?.conversions ?? 0,
  );
  const pendingMetric = calculateGrowth(
    dashboard?.referredNotSubscribed ?? 0,
    (dashboard?.previousMonth?.referrals ?? 0) -
      (dashboard?.previousMonth?.conversions ?? 0),
  );
  const earningsMetric = calculateGrowth(
    dashboard?.totalEarnings ?? 0,
    dashboard?.previousMonth?.earnings ?? 0,
  );

  const statCards = [
    {
      icon: "hugeicons:user-group-03",
      label: "Total Students",
      value: dashboard?.totalReferrals ?? 0,
      iconBg: "bg-[#F7F8FD]",
      iconColor: "text-[#6A7BD6]",
      metric: referralsMetric,
    },
    {
      icon: "hugeicons:chart-evaluation",
      label: "Active Students",
      value: dashboard?.totalConversions ?? 0,
      iconBg: "bg-[#F3F3F3]",
      iconColor: "text-[#E32E89]",
      metric: conversionsMetric,
    },
    {
      icon: "hugeicons:hourglass",
      label: "Pending Students",
      value: dashboard?.referredNotSubscribed ?? 0,
      iconBg: "bg-[#FEF6E7]",
      iconColor: "text-[#F3A218]",
      metric: pendingMetric,
    },
    {
      icon: "hugeicons:money-receive-02",
      label: "Total Earnings",
      value: `${currencySymbol}${(dashboard?.totalEarnings ?? 0).toLocaleString()}`,
      iconBg: "bg-[#FBFAFF]",
      iconColor: "text-[#8F78E8]",
      metric: earningsMetric,
    },
  ];

  // Map referrals to table data format
  const tableData = referrals.map((referral) => [
    {
      name:
        `${referral.referredUser?.firstName || ""} ${referral.referredUser?.lastName || ""}`.trim() ||
        "Unknown",
      email: referral.referredUser?.email || "",
    },
    referral.hasSubscribed ? "active" : "pending",
    new Date(referral.createdAt).toLocaleDateString(),
    `${currencySymbol}${(referral.totalRevenueGenerated ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `${currencySymbol}${(referral.totalCommissionGenerated ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  ]);

  const recordsPerPage = 10;
  const totalPages = Math.ceil(referralsTotal / recordsPerPage);

  if (isLoadingDashboard) {
    return <StudentsSkeleton />;
  }

  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-[600] text-[#171717]">Student Tracking</h1>
        <p className="text-gray-500 text-sm mt-1">
          Track students referred through your affiliate link
        </p>
      </div>

      {/* Stat Cards */}
      <section className="grid mt-6 grid-cols-1 xl:grid-cols-4 gap-4 mb-6">
        {statCards.map(
          ({ icon, iconBg, iconColor, label, value, metric }, index) => (
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
                <span
                  className={cn(
                    "p-[.125rem_.375rem] text-[.75rem] flex items-center gap-[.25rem] rounded-[.625rem] leading-5 font-[500]",
                    metric.isPositive
                      ? "bg-[#E7F6EC] text-[#036B26]"
                      : "bg-red-100 text-red-500",
                  )}
                >
                  <Icon
                    icon={
                      metric.isPositive
                        ? "hugeicons:arrow-up-right-01"
                        : "hugeicons:arrow-down-left-01"
                    }
                    className="w-4 h-4"
                  />
                  {metric.percentage}%
                </span>
                <span className="text-[#757575] font-[500] leading-5 text-[.75rem]">
                  from last month
                </span>
              </div>
            </div>
          ),
        )}
      </section>

      {/* Referrals Table */}
      <Table
        columns={[
          {
            title: "Students",
            customTableBody: ({
              name,
              email,
            }: {
              name: string;
              email: string;
            }) => (
              <div className="flex flex-col gap-[.25rem]">
                <span className="text-[.875rem] font-[500] text-[#2B2B2B] leading-5">
                  {name}
                </span>
                <span className="text-[.75rem] font-[400] leading-4 text-[#A6A6A6]">
                  {email}
                </span>
              </div>
            ),
          },
          {
            title: "Status",
            customTableBody: (status: string) => (
              <StatusChip id={status} type="subscription" />
            ),
          },
          "Joined Date",
          "Revenue Generated",
          "Commission Generated",
        ]}
        data={tableData}
        pagination={true}
        loading={isLoadingReferrals}
        metaData={{
          endPage: totalPages,
          currentPage: referralsPage,
          totalRecords: referralsTotal,
          onPageChange: (skip: number) => {
            const newPage = Math.floor(skip / recordsPerPage) + 1;
            fetchReferrals(newPage, recordsPerPage);
          },
        }}
        recordsPerPage={recordsPerPage}
        emptyStateProps={{
          svg: "hugeicons:shopping-cart-02",
          title: "No referrals yet",
          text: "Share your affiliate link to start getting referrals. Students who sign up through your link will appear here.",
        }}
      />
    </section>
  );
};

export default Students;
