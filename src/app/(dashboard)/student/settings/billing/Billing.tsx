/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/atoms";
import { useStudentStore, useSettingsStore } from "@/store";
import { CARD_SHADOW, formatDate } from "@/utils";
import type { ISubscriptionSummary } from "@/types";

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ boxShadow: CARD_SHADOW }}
      className="rounded-[.75rem] bg-white p-[1.5rem]"
    >
      <div className="mb-[1.25rem]">
        <h2 className="text-[1rem] font-[600] text-[#101828]">{title}</h2>
        {description && (
          <p className="text-[.875rem] text-[#667085] mt-[.25rem]">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CARD_BRAND_ICONS: Record<string, string> = {
  visa: "logos:visa",
  mastercard: "logos:mastercard",
  verve: "hugeicons:credit-card",
  "american express": "logos:amex",
  amex: "logos:amex",
};

function cardBrandIcon(brand?: string | null) {
  if (!brand) return "hugeicons:credit-card";
  return CARD_BRAND_ICONS[brand.toLowerCase()] ?? "hugeicons:credit-card";
}

const SUB_STATUS: Record<string, { pill: string; dot: string; label: string }> =
  {
    active: {
      pill: "bg-[#ECFDF3] text-[#099137]",
      dot: "bg-[#099137]",
      label: "Active",
    },
    cancelled: {
      pill: "bg-[#FEF3F2] text-[#D42620]",
      dot: "bg-[#D42620]",
      label: "Cancelled",
    },
    suspended: {
      pill: "bg-[#FFFAEB] text-[#F3A218]",
      dot: "bg-[#F3A218]",
      label: "Suspended",
    },
  };

const TX_STATUS: Record<string, string> = {
  success: "bg-[#ECFDF3] text-[#099137]",
  failed: "bg-[#FEF3F2] text-[#D42620]",
  pending: "bg-[#FFFAEB] text-[#F3A218]",
  refunded: "bg-[#F0F9FF] text-[#007FFF]",
};

const CURRENCY: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  EUR: "€",
  CAD: "C$",
  AUD: "A$",
};

function formatAmount(amount: number, currency: string) {
  return `${CURRENCY[currency.toUpperCase()] ?? currency}${amount.toLocaleString()}`;
}

function cap(s?: string | null) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function renewalText(sub: ISubscriptionSummary) {
  if (sub.status === "suspended") return "Suspended";
  if (sub.status === "cancelled") return `Expires ${formatDate(sub.endDate)}`;
  return sub.autoRenew
    ? `Renews ${formatDate(sub.endDate)}`
    : `Expires ${formatDate(sub.endDate)}`;
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function SubSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-4">
      {[0, 1].map((i) => (
        <div key={i} className={i > 0 ? "pt-4 border-t border-[#F2F4F7]" : ""}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-gray-200 rounded-[.5rem]" />
              <div>
                <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-28 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function BillingRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-[.875rem] border-b border-[#F2F4F7] animate-pulse last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-[.5rem]" />
        <div>
          <div className="h-4 w-28 bg-gray-200 rounded mb-1.5" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-5 w-16 bg-gray-100 rounded-full" />
        <div className="h-4 w-20 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

// ─── Single subscription card ─────────────────────────────────────────────────

function SubscriptionRow({
  sub,
  onManageCard,
  managing,
}: {
  sub: ISubscriptionSummary;
  onManageCard: (examTypeId: string) => void;
  managing: string | null; // examTypeId being managed
}) {
  const status =
    SUB_STATUS[(sub.status ?? "").toLowerCase()] ?? SUB_STATUS.cancelled;
  // Stripe subs: Customer Portal shows/manages card — no need for stored cardLast4.
  // Paystack subs: button only if we have cardLast4 (Paystack has no web portal).
  const isStripe = sub.paymentProvider === "stripe";
  const showManageCard =
    sub.status === "active" &&
    sub.autoRenew &&
    !sub.isSponsored &&
    (isStripe || !!sub.cardLast4);

  return (
    <div className="flex flex-col gap-4">
      {/* Plan + exam type row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-[.5rem] bg-[#F0F9FF] border border-[#B2DDFF] flex items-center justify-center shrink-0">
            <Icon
              icon="hugeicons:diamond"
              className="w-[1.125rem] h-[1.125rem] text-[#007FFF]"
            />
          </div>
          <div>
            <p className="text-[.875rem] font-[600] text-[#344054]">
              {sub.examTypeName ?? "Unknown exam type"}{" "}
              <span className="font-[400] text-[#667085]">
                · {sub.plan?.name ?? "—"}
              </span>
            </p>
            <p className="text-[.8125rem] text-[#667085] mt-[.125rem]">
              {renewalText(sub)}
              {sub.plan?.durationDays
                ? ` · ${sub.plan.durationDays} days`
                : ""}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-[.625rem] py-[.25rem] rounded-full text-[.75rem] font-[500] ${status.pill}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      {/* Card or sponsored row */}
      {sub.isSponsored ? (
        <>
          <div className="border-t border-[#F2F4F7]" />
          <div className="flex items-center gap-3 p-3 bg-[#F0F9FF] rounded-[.75rem]">
            <Icon
              icon="hugeicons:gift"
              className="w-5 h-5 text-[#007FFF] shrink-0"
            />
            <div>
              <p className="text-[.875rem] font-[500] text-[#344054]">
                Sponsored
              </p>
              <p className="text-[.8125rem] text-[#667085]">
                This subscription was gifted — no payment method on file
              </p>
            </div>
          </div>
        </>
      ) : sub.cardLast4 ? (
        <>
          <div className="border-t border-[#F2F4F7]" />
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-[#F9FAFB] border border-[#E4E7EC] rounded-[.375rem] flex items-center justify-center shrink-0">
                <Icon
                  icon={cardBrandIcon(sub.cardBrand)}
                  className="w-8 h-5"
                />
              </div>
              <div>
                <p className="text-[.875rem] font-[500] text-[#344054]">
                  {cap(sub.cardBrand)} •••• {sub.cardLast4}
                </p>
                <p className="text-[.8125rem] text-[#667085]">
                  Expires {sub.cardExpMonth}/{sub.cardExpYear}
                  {sub.cardBank ? ` · ${sub.cardBank}` : ""}
                </p>
              </div>
            </div>
            {showManageCard && (
              <Button
                onClick={() => onManageCard(sub.examTypeId)}
                loading={managing === sub.examTypeId}
                disabled={!!managing}
                className="bg-white! text-[#344054]! border border-[#D0D5DD] hover:bg-[#F9FAFB]! text-[.8125rem]"
              >
                Manage Card
              </Button>
            )}
          </div>
        </>
      ) : showManageCard ? (
        /* Stripe sub: no card info stored locally, but Customer Portal manages it */
        <>
          <div className="border-t border-[#F2F4F7]" />
          <div className="flex justify-end">
            <Button
              onClick={() => onManageCard(sub.examTypeId)}
              loading={managing === sub.examTypeId}
              disabled={!!managing}
              className="bg-white! text-[#344054]! border border-[#D0D5DD] hover:bg-[#F9FAFB]! text-[.8125rem]"
            >
              Manage Card
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Billing() {
  const {
    fetchManageLink,
    allSubscriptions,
    fetchAllSubscriptions,
    isLoadingAllSubscriptions,
  } = useStudentStore();

  const {
    billingHistory,
    billingTotal,
    billingPage,
    loadingBilling,
    fetchBillingHistory,
  } = useSettingsStore();

  // examTypeId of the subscription whose card is being managed
  const [managingCard, setManagingCard] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingHistory(1);
    fetchAllSubscriptions();
  }, []);

  const handleManageCard = (examTypeId: string) => {
    if (managingCard) return;
    setManagingCard(examTypeId);
    fetchManageLink(examTypeId, (link) => {
      window.open(link, "_blank", "noopener,noreferrer");
      setManagingCard(null);
    });
    setTimeout(() => setManagingCard(null), 5000);
  };

  const totalPages = Math.ceil(billingTotal / 20);

  return (
    <div className="flex flex-col gap-5">
      {/* Current Subscriptions */}
      <SectionCard
        title="Current Subscriptions"
        description="Your active plans and payment details across exam types"
      >
        {isLoadingAllSubscriptions ? (
          <SubSkeleton />
        ) : allSubscriptions.length === 0 ? (
          <div className="flex items-center gap-3 text-[.875rem] text-[#667085]">
            <Icon
              icon="hugeicons:subscription"
              className="w-5 h-5 text-[#98A2B3]"
            />
            No active subscriptions
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {allSubscriptions.map((sub, idx) => (
              <div key={sub.id}>
                {idx > 0 && (
                  <div className="mb-6 border-t-2 border-dashed border-[#F2F4F7]" />
                )}
                <SubscriptionRow
                  sub={sub}
                  onManageCard={handleManageCard}
                  managing={managingCard}
                />
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Billing History */}
      <SectionCard
        title="Billing History"
        description="All past payments and transactions"
      >
        {loadingBilling && billingHistory.length === 0 ? (
          <div className="flex flex-col">
            {[0, 1, 2, 3].map((i) => (
              <BillingRowSkeleton key={i} />
            ))}
          </div>
        ) : billingHistory.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Icon
              icon="hugeicons:receipt"
              className="w-10 h-10 text-[#D0D5DD]"
            />
            <p className="text-[.875rem] text-[#667085]">
              No billing history yet
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col">
              {billingHistory.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-[.875rem] border-b border-[#F2F4F7] last:border-b-0 gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[.5rem] bg-[#F9FAFB] border border-[#E4E7EC] flex items-center justify-center shrink-0">
                      <Icon
                        icon="hugeicons:receipt-text"
                        className="w-4 h-4 text-[#667085]"
                      />
                    </div>
                    <div>
                      <p className="text-[.875rem] font-[500] text-[#344054] capitalize">
                        {tx.type.replace(/_/g, " ")}
                      </p>
                      <p className="text-[.75rem] text-[#667085]">
                        {tx.paidAt
                          ? formatDate(tx.paidAt)
                          : formatDate(tx.createdAt)}
                        {tx.isSponsored
                          ? " · Sponsored"
                          : tx.cardLast4
                            ? ` · •••• ${tx.cardLast4}`
                            : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-[.5rem] py-[.125rem] rounded-full text-[.75rem] font-[500] capitalize ${TX_STATUS[tx.status.toLowerCase()] ?? "bg-[#F2F4F7] text-[#344054]"}`}
                    >
                      {tx.status}
                    </span>
                    <span className="text-[.875rem] font-[600] text-[#101828]">
                      {formatAmount(tx.amount, tx.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F2F4F7]">
                <p className="text-[.8125rem] text-[#667085]">
                  Page {billingPage} of {totalPages} ·{" "}
                  <span className="font-[500]">{billingTotal}</span>{" "}
                  transactions
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => fetchBillingHistory(billingPage - 1)}
                    disabled={billingPage === 1 || loadingBilling}
                    className="bg-white text-[#344054] border border-[#D0D5DD] hover:bg-[#F9FAFB] px-3 py-1.5 text-[.8125rem]"
                  >
                    <Icon icon="hugeicons:arrow-left-01" className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => fetchBillingHistory(billingPage + 1)}
                    disabled={billingPage === totalPages || loadingBilling}
                    className="bg-white text-[#344054] border border-[#D0D5DD] hover:bg-[#F9FAFB] px-3 py-1.5 text-[.8125rem]"
                  >
                    <Icon icon="hugeicons:arrow-right-01" className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </SectionCard>
    </div>
  );
}
