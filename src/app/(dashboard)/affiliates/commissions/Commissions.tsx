"use client";

import { Table } from "@/components/molecules";
import { StatusChip } from "@/components/atoms";
import { useAuthStore, useAffiliateStore } from "@/store";
import { CURRENCY_SYMBOLS, getColorsFromWord } from "@/utils";
import React, { useEffect } from "react";
import CommissionsSkeleton from "./CommissionsSkeleton";

const Commissions = () => {
  const { accessToken } = useAuthStore();
  const {
    commissions,
    commissionsTotal,
    commissionsPage,
    isLoadingCommissions,
    selectedCurrency,
    fetchCommissions,
  } = useAffiliateStore();

  const currencySymbol = CURRENCY_SYMBOLS[selectedCurrency] || "$";

  useEffect(() => {
    if (!accessToken) return;
    fetchCommissions(1, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, selectedCurrency]);

  // Map commissions to table data format
  const tableData = commissions.map((commission) => [
    {
      name:
        `${commission.referral?.referredUser?.firstName || ""} ${commission.referral?.referredUser?.lastName || ""}`.trim() ||
        "Unknown",
      email: commission.referral?.referredUser?.email || "",
    },
    commission.planName || "N/A",
    commission.status,
    commission.subscription?.status || "N/A",
    `${currencySymbol}${(commission.subscriptionAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `${currencySymbol}${(commission.amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  ]);

  const recordsPerPage = 10;
  const totalPages = Math.ceil(commissionsTotal / recordsPerPage);

  if (isLoadingCommissions && commissionsPage === 1) {
    return <CommissionsSkeleton />;
  }

  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-[600] text-[#171717]">
          Commission History
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Track all commissions earned from student referrals
        </p>
      </div>

      {/* Commissions Table */}
      <Table
        columns={[
          {
            title: "Student",
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
            title: "Plan",
            customTableBody: (planName: string) => {
              const colors = getColorsFromWord(planName);
              return (
                <span
                  style={{
                    backgroundColor: colors.bg,
                    color: colors.text,
                  }}
                  className="text-[.75rem] font-[500] leading-5 px-2 py-1 rounded-md"
                >
                  {planName}
                </span>
              );
            },
          },
          {
            title: "Commission Status",
            customTableBody: (status: string) => (
              <StatusChip id={status} type="commission" />
            ),
          },
          {
            title: "Subscription Status",
            customTableBody: (status: string) => (
              <StatusChip id={status.toLowerCase()} type="subscription" />
            ),
          },
          "Plan Cost",
          "Your Commission",
        ]}
        data={tableData}
        pagination={true}
        loading={isLoadingCommissions}
        metaData={{
          endPage: totalPages,
          currentPage: commissionsPage,
          totalRecords: commissionsTotal,
          onPageChange: (skip: number) => {
            const newPage = Math.floor(skip / recordsPerPage) + 1;
            fetchCommissions(newPage, recordsPerPage);
          },
        }}
        recordsPerPage={recordsPerPage}
        emptyStateProps={{
          svg: "hugeicons:shopping-cart-02",
          title: "No commissions yet",
          text: "Commissions will appear here once your referred students subscribe to a plan.",
        }}
      />
    </section>
  );
};

export default Commissions;
