"use client";

import { useEffect } from "react";
import { Icon } from "@iconify/react";
import { Tab } from "@/components/atoms";
import { CARD_SHADOW } from "@/utils";
import { useSponsorStore, useAuthStore } from "@/store";
import { ISponsorGiveback } from "@/types";

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  EUR: "€",
  CAD: "CA$",
  AUD: "A$",
  GHS: "₵",
  GMD: "D",
};

function formatAmount(amount: number, currency: string) {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency + " ";
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ISponsorGiveback["status"] }) {
  const styles: Record<string, string> = {
    active: "bg-[#ECFDF3] text-[#027A48]",
    pending: "bg-[#FFFAEB] text-[#B54708]",
    expired: "bg-[#F2F4F7] text-[#344054]",
    failed: "bg-[#FFF4F4] text-[#D42620]",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-[.125rem] rounded-full text-[.6875rem] font-[600] capitalize ${styles[status] ?? styles.expired}`}
    >
      {status}
    </span>
  );
}

// ─── Giveback Card ────────────────────────────────────────────────────────────

function GivebackCard({ giveback }: { giveback: ISponsorGiveback }) {
  const examTypeName =
    giveback.subscription?.examType?.name ?? "—";
  const planName = giveback.subscription?.plan?.name ?? "—";

  return (
    <div
      style={{ boxShadow: CARD_SHADOW }}
      className="rounded-[.75rem] bg-white p-5"
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        {/* Left: exam + plan info */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#EFF8FF] flex items-center justify-center shrink-0 mt-[.125rem]">
            <Icon
              icon="hugeicons:book-open-01"
              className="w-5 h-5 text-[#007FFF]"
            />
          </div>
          <div>
            <p className="text-[.9375rem] font-[600] text-[#101828]">
              {examTypeName}
            </p>
            <p className="text-[.8125rem] text-[#667085]">{planName}</p>
          </div>
        </div>

        {/* Right: status badge */}
        <StatusBadge status={giveback.status} />
      </div>

      {/* Details row */}
      <div className="mt-4 pt-4 border-t border-[#F2F4F7] grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-4">
        <div>
          <p className="text-[.75rem] text-[#98A2B3] font-[500] mb-[.125rem]">
            Amount Paid
          </p>
          <p className="text-[.875rem] font-[600] text-[#101828]">
            {formatAmount(giveback.amount, giveback.currency)}
          </p>
        </div>

        <div>
          <p className="text-[.75rem] text-[#98A2B3] font-[500] mb-[.125rem]">
            Students
          </p>
          <p className="text-[.875rem] font-[600] text-[#101828]">
            {giveback.studentCount}
          </p>
        </div>

        <div>
          <p className="text-[.75rem] text-[#98A2B3] font-[500] mb-[.125rem]">
            Date
          </p>
          <p className="text-[.875rem] font-[600] text-[#101828]">
            {formatDate(giveback.createdAt)}
          </p>
        </div>

        {giveback.endDate && (
          <div>
            <p className="text-[.75rem] text-[#98A2B3] font-[500] mb-[.125rem]">
              Expires
            </p>
            <p className="text-[.875rem] font-[600] text-[#101828]">
              {formatDate(giveback.endDate)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Giveback List ─────────────────────────────────────────────────────────────

function GivebackList({
  givebacks,
  isLoading,
  emptyLabel,
}: {
  givebacks: ISponsorGiveback[];
  isLoading: boolean;
  emptyLabel: string;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{ boxShadow: CARD_SHADOW }}
            className="rounded-[.75rem] bg-white p-5 animate-pulse"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#F2F4F7]" />
              <div className="space-y-2">
                <div className="h-4 w-36 bg-[#F2F4F7] rounded" />
                <div className="h-3 w-24 bg-[#F2F4F7] rounded" />
              </div>
            </div>
            <div className="border-t border-[#F2F4F7] pt-4 grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="space-y-1">
                  <div className="h-3 w-16 bg-[#F2F4F7] rounded" />
                  <div className="h-4 w-20 bg-[#F2F4F7] rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (givebacks.length === 0) {
    return (
      <div
        style={{ boxShadow: CARD_SHADOW }}
        className="rounded-[.75rem] bg-white p-10 flex flex-col items-center justify-center text-center"
      >
        <Icon
          icon="hugeicons:gift"
          className="w-12 h-12 text-[#D0D5DD] mb-3"
        />
        <p className="text-[.9375rem] font-[500] text-[#344054]">
          {emptyLabel}
        </p>
        <p className="text-[.8125rem] text-[#98A2B3] mt-1">
          Givebacks you make will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {givebacks.map((g) => (
        <GivebackCard key={g.id} giveback={g} />
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SponsorBilling() {
  const { accessToken } = useAuthStore();
  const {
    givebacksAll,
    isLoadingGivebacksAll,
    givebacksActive,
    isLoadingGivebacksActive,
    givebacksExpired,
    isLoadingGivebacksExpired,
    initGivebackTabs,
  } = useSponsorStore();

  useEffect(() => {
    if (!accessToken) return;
    initGivebackTabs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[1.125rem] font-[600] text-[#101828]">Billing</h2>
        <p className="text-[.875rem] text-[#667085] mt-[.125rem]">
          Your giveback history — one-time payments made for sponsored students.
        </p>
      </div>

      <Tab
        tabs={["All", "Active", "Expired"]}
        tabChildren={[
          <GivebackList
            key="all"
            givebacks={givebacksAll}
            isLoading={isLoadingGivebacksAll}
            emptyLabel="No givebacks yet"
          />,
          <GivebackList
            key="active"
            givebacks={givebacksActive}
            isLoading={isLoadingGivebacksActive}
            emptyLabel="No active givebacks"
          />,
          <GivebackList
            key="expired"
            givebacks={givebacksExpired}
            isLoading={isLoadingGivebacksExpired}
            emptyLabel="No expired givebacks"
          />,
        ]}
      />
    </div>
  );
}
