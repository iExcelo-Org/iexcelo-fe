/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms";
import { Modal } from "@/components/molecules";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { useStudentStore } from "@/store";
import { formatDate } from "@/utils";

const currencySymbols: Record<string, string> = {
  NGN: "\u20A6",
  USD: "$",
  GBP: "\u00A3",
  EUR: "\u20AC",
  CAD: "C$",
  AUD: "A$",
  GHS: "GH\u20B5",
  ZAR: "R",
  KES: "KSh",
  UGX: "USh",
  TZS: "TSh",
  XOF: "CFA",
  XAF: "CFA",
  GMD: "D",
};

// Map currency to a default region for checkout-info override
const currencyToRegion: Record<string, string> = {
  NGN: "NG",
  USD: "US",
  GBP: "GB",
  EUR: "DE",
  CAD: "CA",
  AUD: "AU",
  GHS: "GH",
  ZAR: "ZA",
  KES: "KE",
  UGX: "UG",
  TZS: "TZ",
  XOF: "SN",
  XAF: "CM",
  GMD: "GM",
};

const planStyles = [
  {
    badge: {
      text: "Starter",
      color: "text-[#5925DC] bg-[#F4F3FF] border-[#D9D6FE]",
    },
    icon: { icon: "hugeicons:star", bg: "gradients-subtle-hue-2" },
  },
  {
    badge: {
      text: "Most Popular",
      color: "text-[#175CD3] bg-[#EFF8FF] border-[#B2DDFF]",
    },
    icon: { icon: "hugeicons:crown", bg: "gradients-subtle-hue-5" },
  },
  {
    badge: {
      text: "Best Value",
      color: "bg-[#FEF6EE] text-[#B93815] border-[#F9DBAF]",
    },
    icon: { icon: "hugeicons:sparkles", bg: "gradients-subtle-hue-9" },
  },
];

const defaultFeatures = [
  "Unlimited revision and mock tests",
  "Real-time performance tracking",
  "Access to all subjects",
  "Detailed answer explanations",
];

function durationLabel(days: number) {
  const months = Math.round(days / 30);
  return months === 1 ? "1 month" : `${months} months`;
}

function SubscriptionsSkeleton() {
  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
      <div className="mb-6 sm:mb-8">
        {/* h1: text-[1.125rem] sm:text-xl md:text-2xl → h-6/h-7 */}
        <div className="h-6 sm:h-7 w-36 sm:w-48 bg-gray-200 rounded-lg animate-pulse" />
        {/* subtitle: text-[.8125rem] sm:text-sm → h-4/h-5 */}
        <div className="h-4 sm:h-5 w-56 sm:w-80 max-w-full bg-gray-100 rounded-md animate-pulse mt-1.5" />
      </div>

      {/* Current Subscription card */}
      <div
        style={{
          boxShadow:
            "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
        }}
        className="rounded-[1rem] mb-8 sm:mb-13 overflow-hidden animate-pulse"
      >
        {/* Header strip: p-[1rem_1rem_.75rem_1rem] sm:p-[1.5rem_1.25rem...] → h-10 sm:h-13 */}
        <div className="h-10 sm:h-[3.25rem] md:h-14 bg-gray-200" />
        <div className="bg-white p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">
          <div className="flex gap-3 sm:gap-4 items-start sm:items-center">
            {/* Icon circle: p-2.5 sm:p-3.5 = 10/14px + icon 20/24px = 40/52px */}
            <div className="w-10 h-10 sm:w-[3.25rem] sm:h-[3.25rem] bg-gray-200 rounded-full shrink-0" />
            <div className="flex-1 min-w-0">
              {/* Plan name: text-[1.125rem] sm:text-[1.5rem] leading-7/8 → h-6/h-8 */}
              <div className="h-6 sm:h-8 w-32 sm:w-40 bg-gray-200 rounded mb-1.5" />
              {/* Subtitle: text-[.8125rem] sm:text-[1rem] → h-4/h-5 */}
              <div className="h-4 sm:h-5 w-48 sm:w-64 max-w-full bg-gray-100 rounded" />
            </div>
          </div>
          <div className="h-[1px] bg-[#EDEDED] w-full" />
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* "Renews on:" text-[.9375rem] sm:text-[1.125rem] → h-5/h-6 */}
            <div className="h-5 sm:h-6 w-40 sm:w-52 bg-gray-200 rounded" />
            {/* Price: text-[1.375rem] sm:text-[1.75rem] → h-7/h-9 */}
            <div className="h-7 sm:h-8 w-20 sm:w-28 bg-gray-200 rounded" />
          </div>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Status: same h-5/h-6 */}
            <div className="h-5 sm:h-6 w-24 sm:w-32 bg-gray-200 rounded" />
            <div className="h-5 w-24 sm:w-32 bg-gray-100 rounded" />
          </div>
        </div>
      </div>

      {/* "Available Subscriptions" heading: text-[1.125rem] sm:text-xl → h-6/h-7 */}
      <div className="h-6 sm:h-7 w-40 sm:w-56 bg-gray-200 rounded-lg animate-pulse mb-4 sm:mb-5" />

      {/* Plan cards */}
      <div className="flex flex-wrap justify-center gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
            <div
              style={{
                boxShadow:
                  "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
              }}
              className="p-[.625rem_.5rem_.875rem_.5rem] sm:p-[1rem_.75rem_1.25rem_.75rem] rounded-[1.5rem] bg-white animate-pulse"
            >
              {/* Inner header */}
              <div className="p-[1rem_.875rem] sm:p-[1.5rem_1.25rem] mb-4 sm:mb-6 rounded-[1.25rem] bg-gray-100">
                {/* Badge: h-5 */}
                <div className="h-5 w-20 sm:w-24 bg-gray-200 rounded-full mb-3" />
                {/* Icon circle: p-2.5/3.5 + icon 20/24 = ~40/52px */}
                <div className="w-10 h-10 sm:w-[3.25rem] sm:h-[3.25rem] bg-gray-200 rounded-full mb-3" />
                {/* Plan name: text-[.9375rem] sm:text-[1.125rem] → h-5/h-6 */}
                <div className="h-5 sm:h-6 w-24 sm:w-32 bg-gray-200 rounded mb-1.5" />
                {/* Price: text-[1.625rem] sm:text-[2rem] leading-9/10 → h-8/h-9 */}
                <div className="h-8 sm:h-9 w-20 sm:w-24 bg-gray-200 rounded" />
              </div>
              {/* Features: mb-16 sm:mb-24 */}
              <div className="flex flex-col gap-2 sm:gap-3 mb-14 sm:mb-24">
                {[0, 1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-200 rounded-full shrink-0" />
                    <div className="h-4 flex-1 max-w-[12rem] bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
              {/* Button: h-10 */}
              <div className="h-9 sm:h-10 w-full bg-gray-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const Subscriptions = () => {
  const router = useRouter();
  const {
    lastExamTypeId,
    activeSubscription,
    isLoadingSubscription,
    fetchActiveSubscription,
    cancelSubscription,
    reactivateSubscription,
    isReactivating,
    checkoutInfo,
    isLoadingCheckoutInfo,
    fetchCheckoutInfo,
    initiateCheckout,
    isCheckingOut,
    profile,
  } = useStudentStore();

  const isSponsored = profile?.isSponsored ?? false;

  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<
    "stripe" | "paystack" | null
  >(null);

  useEffect(() => {
    if (!lastExamTypeId) return;
    fetchActiveSubscription(lastExamTypeId);
  }, [lastExamTypeId]);

  // Fetch checkout info once we know subscription status
  useEffect(() => {
    if (!lastExamTypeId || isLoadingSubscription) return;

    const region = activeSubscription?.currency
      ? currencyToRegion[activeSubscription.currency] || "US"
      : undefined;

    fetchCheckoutInfo(lastExamTypeId, region);
  }, [lastExamTypeId, isLoadingSubscription, activeSubscription?.currency]);

  const currencySymbol = checkoutInfo
    ? currencySymbols[checkoutInfo.currency] || ""
    : "\u20A6";

  const handleCancelSubscription = async () => {
    if (!lastExamTypeId || isCancelling) return;
    setIsCancelling(true);
    await cancelSubscription(lastExamTypeId, () => {
      setShowCancelModal(false);
      setIsCancelling(false);
    });
  };

  const handleSelectPlan = (planId: string) => {
    if (!lastExamTypeId || !checkoutInfo) return;

    if (activeSubscription && activeSubscription.status === "active") {
      // Has active sub → go to update page
      router.push(`/student/subscriptions/update/${planId}`);
    } else {
      // No sub, cancelled, or suspended → new subscription flow
      const plan = checkoutInfo.plans.find((p) => p.id === planId);
      // Auto-select the first available provider for this plan
      const firstProvider = plan?.providers[0]?.provider ?? null;
      setSelectedPlanId(planId);
      setSelectedProvider(firstProvider);
      setShowPayment(true);
    }
  };

  const selectedPlan = checkoutInfo?.plans.find((p) => p.id === selectedPlanId);
  const selectedPlanPrice = selectedPlan
    ? `${currencySymbol}${selectedPlan.price.toLocaleString()}`
    : `${currencySymbol}0`;
  const availableProviders = selectedPlan?.providers ?? [];

  const handleSubscribe = () => {
    if (!selectedPlanId || !lastExamTypeId || !checkoutInfo || !selectedProvider)
      return;

    initiateCheckout(
      {
        planId: selectedPlanId,
        examTypeId: lastExamTypeId,
        region: checkoutInfo.region,
        provider: selectedProvider,
      },
      (url) => {
        window.location.href = url;
      },
    );
  };

  if (isLoadingSubscription || isLoadingCheckoutInfo) {
    return <SubscriptionsSkeleton />;
  }

  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-[1.125rem] sm:text-xl md:text-2xl font-[600] text-[#171717]">Subscriptions</h1>
        <p className="text-gray-500 text-[.8125rem] sm:text-sm mt-1">
          Keep track of your subscription details, update your billing
          information, and control your accounts payments
        </p>
      </div>

      {/* Sponsored badge */}
      {isSponsored && (
        <div className="mb-6 flex items-start gap-3 p-3 sm:p-4 bg-[#E5E8F8] border border-[#007FFF] rounded-[.75rem]">
          <Icon
            icon="hugeicons:healtcare"
            className="w-4 h-4 sm:w-5 sm:h-5 text-[#007FFF] shrink-0 mt-0.5"
          />
          <div>
            <p className="text-[.8125rem] sm:text-[.875rem] font-[600] text-[#2B2B2B]">
              Sponsored Account
            </p>
            <p className="text-[.75rem] sm:text-[.8125rem] text-[#575757]">
              Your subscription is managed by your sponsor. You cannot
              self-subscribe.
            </p>
          </div>
        </div>
      )}

      {/* Current Subscription or Free Plan Banner */}
      {activeSubscription ? (
        <>
          {/* SUSPENDED warning */}
          {activeSubscription.status === "suspended" && (
            <div className="mb-4 flex items-start gap-3 p-3 sm:p-4 bg-[#FFF3CD] border border-[#F3A218] rounded-[.75rem]">
              <Icon
                icon="hugeicons:alert-02"
                className="w-4 h-4 sm:w-5 sm:h-5 text-[#F3A218] shrink-0 mt-0.5"
              />
              <div>
                <p className="text-[.8125rem] sm:text-[.875rem] font-[600] text-[#2B2B2B]">
                  Subscription Suspended
                </p>
                <p className="text-[.75rem] sm:text-[.8125rem] text-[#575757]">
                  Your last payment failed. Please update your payment method to
                  restore access.
                </p>
              </div>
            </div>
          )}

          <div
            style={{
              boxShadow:
                "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
            }}
            className="rounded-[1rem] mb-13 overflow-hidden"
          >
            <div
              className={cn(
                "p-[1rem_1rem_.75rem_1rem] sm:p-[1.5rem_1.25rem_.875rem_1.25rem] md:p-[2rem_1.5rem_1rem_1.5rem] text-white font-[500] leading-6 sm:leading-7 text-[.9375rem] sm:text-[1.125rem]",
                activeSubscription.status === "cancelled"
                  ? "bg-[#F59E0B]"
                  : activeSubscription.status === "suspended"
                    ? "bg-[#D42620]"
                    : "bg-[#007FFF]",
              )}
            >
              {activeSubscription.status === "cancelled"
                ? "Subscription Cancelled"
                : activeSubscription.status === "suspended"
                  ? "Subscription Suspended"
                  : "Current Subscription"}
            </div>
            <div className="bg-white p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">
              <div className="flex gap-3 sm:gap-4 items-start sm:items-center">
                <div className="gradients-subtle-hue-2 p-2.5 sm:p-3.5 rounded-full flex-shrink-0">
                  <Icon icon="hugeicons:star" className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-[#212636] text-[1.125rem] sm:text-[1.5rem] font-[600] leading-7 sm:leading-8 tracking-[-.48px]">
                    {activeSubscription.plan?.name ?? "Sponsored Access"}
                  </h5>
                  <p className="text-[#757575] text-[.8125rem] sm:text-[1rem] md:text-[1.125rem] font-[400] leading-5 sm:leading-7 mt-0.5">
                    {activeSubscription.status === "cancelled"
                      ? `Your subscription was cancelled. Access expires on ${formatDate(
                          activeSubscription.endDate,
                          { month: "long", day: "numeric" },
                          "en-US",
                        )}`
                      : activeSubscription.status === "suspended"
                        ? "Your subscription is suspended due to a failed payment."
                        : `You are on the ${activeSubscription.plan?.name ?? "Sponsored Access"}${
                            activeSubscription.nextPaymentDate
                              ? `, renews automatically on ${formatDate(
                                  activeSubscription.nextPaymentDate,
                                  { month: "long", day: "numeric" },
                                  "en-US",
                                )}`
                              : ""
                          }`}
                  </p>
                  {activeSubscription.status === "cancelled" &&
                    activeSubscription.upcomingSubscription?.plan && (
                      <p className="text-[#007FFF] text-[.8125rem] sm:text-[.875rem] font-[500] leading-5 mt-1 flex items-center gap-1.5">
                        <Icon
                          icon="hugeicons:arrow-right-02"
                          className="w-4 h-4"
                        />
                        Upcoming:{" "}
                        {activeSubscription.upcomingSubscription.plan.name}{" "}
                        starts after expiry
                      </p>
                    )}
                </div>
              </div>
              <div className="h-[1px] bg-[#EDEDED] w-full" />
              <div className="flex items-start sm:items-center justify-between gap-2 flex-wrap">
                <p className="tracking-[-.4px] text-[#2B2B2B] font-[500] leading-6 sm:leading-7 text-[.9375rem] sm:text-[1.125rem] md:text-[1.25rem]">
                  {activeSubscription.status === "cancelled" ||
                  !activeSubscription.autoRenew
                    ? `Expires on: ${formatDate(
                        activeSubscription.endDate,
                        { month: "long", day: "numeric" },
                        "en-US",
                      )}`
                    : activeSubscription.nextPaymentDate
                      ? `Renews on: ${formatDate(
                          activeSubscription.nextPaymentDate,
                          { month: "long", day: "numeric" },
                          "en-US",
                        )}`
                      : `Expires on: ${formatDate(
                          activeSubscription.endDate,
                          { month: "long", day: "numeric" },
                          "en-US",
                        )}`}
                </p>
                <div className="flex items-baseline">
                  <span className="text-[#2B2B2B] leading-8 sm:leading-9 text-[1.375rem] sm:text-[1.75rem] font-[500] tracking-[-.65px]">
                    {currencySymbol}
                    {(activeSubscription.amountPaid ?? 0).toLocaleString()}
                  </span>
                  <span className="text-[#757575] leading-6 font-[400] text-[.8125rem] sm:text-[1rem]">
                    {activeSubscription.plan?.durationDays
                      ? `/${durationLabel(activeSubscription.plan.durationDays)}`
                      : ""}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="tracking-[-.4px] text-[#2B2B2B] font-[500] leading-6 sm:leading-7 text-[.9375rem] sm:text-[1.125rem] md:text-[1.25rem]">
                  Status:{" "}
                  {activeSubscription.status === "cancelled"
                    ? "Cancelled"
                    : activeSubscription.status === "suspended"
                      ? "Suspended"
                      : "Active"}
                </p>
                {isSponsored ? null : activeSubscription.status ===
                  "cancelled" ? (
                  !activeSubscription.upcomingSubscription ? (
                    <button
                      onClick={() => {
                        if (!lastExamTypeId) return;
                        reactivateSubscription(lastExamTypeId);
                      }}
                      disabled={isReactivating}
                      className="text-[#007FFF] text-[.875rem] sm:text-[1rem] font-[600] leading-6 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isReactivating && (
                        <Icon
                          icon="svg-spinners:ring-resize"
                          className="w-4 h-4"
                        />
                      )}
                      Reactivate Subscription
                    </button>
                  ) : null
                ) : activeSubscription.status === "active" ? (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="text-[#D42620] text-[.875rem] sm:text-[1rem] font-[600] leading-6 flex items-center gap-2"
                  >
                    Cancel Subscription
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div
          style={{
            boxShadow:
              "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
          }}
          className="rounded-[1rem] mb-13 overflow-hidden"
        >
          <div className="p-[1rem_1rem_.75rem_1rem] sm:p-[1.5rem_1.25rem_.875rem_1.25rem] md:p-[2rem_1.5rem_1rem_1.5rem] text-white font-[500] leading-6 sm:leading-7 text-[.9375rem] sm:text-[1.125rem] bg-[#007FFF]">
            Current Plan
          </div>
          <div className="bg-white p-4 sm:p-6 flex gap-3 sm:gap-4 items-start sm:items-center">
            <div className="bg-gray-100 p-2.5 sm:p-3.5 rounded-full flex-shrink-0">
              <Icon
                icon="hugeicons:shield-user"
                className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500"
              />
            </div>
            <div>
              <h5 className="text-[#212636] text-[1.125rem] sm:text-[1.5rem] font-[600] leading-7 sm:leading-8 tracking-[-.48px]">
                Free Plan
              </h5>
              <p className="text-[#757575] text-[.8125rem] sm:text-[1rem] md:text-[1.125rem] font-[400] leading-5 sm:leading-7 mt-0.5">
                You&apos;re on the free plan. Upgrade to unlock full access to
                all subjects and features.
              </p>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-[1.125rem] sm:text-xl md:text-2xl mb-5 sm:mb-7 font-[600] text-[#171717]">
        Available Subscriptions
      </h2>

      {checkoutInfo && checkoutInfo.plans.length > 0 ? (
        <div
          className={cn(
            "flex flex-wrap justify-center gap-6",
            isSponsored && "opacity-50 pointer-events-none select-none",
          )}
        >
          {checkoutInfo.plans.map((plan, index) => {
            const style = planStyles[index] || planStyles[0];
            const isCurrentPlan = activeSubscription?.planId === plan.id;
            const isUpcomingPlan =
              activeSubscription?.upcomingSubscription?.planId === plan.id;
            const formattedPrice = `${currencySymbol}${plan.price.toLocaleString()}`;

            return (
              <div key={plan.id} className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
                <div
                  style={{
                    boxShadow:
                      "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
                  }}
                  className="p-[.625rem_.5rem_.875rem_.5rem] sm:p-[1rem_.75rem_1.25rem_.75rem] rounded-[1.5rem] bg-white"
                >
                  <div
                    style={{
                      boxShadow:
                        "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
                    }}
                    className="p-[1rem_.875rem] sm:p-[1.5rem_1.25rem] mb-4 sm:mb-6 rounded-[1.25rem] gradients-linear-grey"
                  >
                    <span
                      className={cn(
                        "block mb-3 sm:mb-3.5 font-[500] text-[.8125rem] sm:text-[.875rem] leading-5 p-[.125rem_.625rem] border w-fit mix-blend-multiply rounded-[1rem] bg-[#EFF8FF]",
                        isUpcomingPlan
                          ? "text-[#007FFF] bg-[#EFF8FF] border-[#B2DDFF]"
                          : style.badge.color,
                      )}
                    >
                      {isCurrentPlan
                        ? "Current Plan"
                        : isUpcomingPlan
                          ? "Upcoming Plan"
                          : style.badge.text}
                    </span>
                    <div
                      className={cn(
                        "w-fit h-fit p-3.5 rounded-full",
                        style.icon.bg,
                      )}
                    >
                      <Icon
                        icon={style.icon.icon}
                        className="w-6 h-6 text-white"
                      />
                    </div>
                    <p className="text-[.9375rem] sm:text-[1.125rem] mt-3 sm:mt-3.5 mb-1 sm:mb-2 font-[500] leading-6 sm:leading-7 text-[#2B2B2B]">
                      {plan.name}
                    </p>
                    <h6 className="tracking-[-.64px] text-[1.625rem] sm:text-[2rem] leading-9 sm:leading-10 font-[500]">
                      {formattedPrice}
                    </h6>
                  </div>

                  <ul className="flex mb-16 sm:mb-24 flex-col gap-2 sm:gap-3">
                    {defaultFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Icon
                          icon="hugeicons:checkmark-circle-01"
                          className="w-4 h-4 sm:w-5 sm:h-5 text-[#2B2B2B] flex-shrink-0"
                        />
                        <p className="text-[#2B2B2B] text-[.8125rem] sm:text-[.875rem] font-[400] leading-5">
                          {feature}
                        </p>
                      </li>
                    ))}
                  </ul>

                  {isSponsored ? (
                    <Button className="w-full justify-center" disabled>
                      Managed by Sponsor
                    </Button>
                  ) : isCurrentPlan ? (
                    <Button className="w-full justify-center" disabled>
                      Current Plan
                    </Button>
                  ) : isUpcomingPlan ? (
                    <Button className="w-full justify-center" disabled>
                      Upcoming Plan
                    </Button>
                  ) : activeSubscription?.upcomingSubscription ? (
                    <Button className="w-full justify-center" disabled>
                      Select Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full justify-center"
                      onClick={() => handleSelectPlan(plan.id)}
                    >
                      Select Plan
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500">No plans available at the moment.</p>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && activeSubscription && (
        <Modal isOpen onClose={() => setShowCancelModal(false)} className="rounded-2xl w-full max-w-md overflow-hidden">
          <div className="p-4 sm:p-6 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-red-50 flex items-center justify-center">
              <Icon icon="line-md:alert-loop" className="w-6 h-6 sm:w-8 sm:h-8 text-[#D42620]" />
            </div>
            <h3 className="text-[1.0625rem] sm:text-[1.25rem] font-[600] text-[#171717] mb-2">
              Cancel Subscription?
            </h3>
            <p className="text-[#757575] text-[.8125rem] sm:text-[.9375rem] leading-5 sm:leading-6 mb-1">
              Your{" "}
              <span className="font-[600] text-[#2B2B2B]">
                {activeSubscription.plan?.name ?? "subscription"}
              </span>{" "}
              will be cancelled immediately. Access to paid features will be revoked right away.
            </p>
            <p className="text-[#757575] text-[.75rem] sm:text-[.875rem] leading-5">
              You can resubscribe at any time to regain access.
            </p>
          </div>
          <div className="p-3 sm:p-4 border-t border-gray-100 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outlined"
              onClick={() => setShowCancelModal(false)}
              disabled={isCancelling}
              className="flex-1"
            >
              Keep Subscription
            </Button>
            <Button
              onClick={handleCancelSubscription}
              loading={isCancelling}
              className="flex-1 !bg-[#D42620] !border-[#FBCFCE] hover:!bg-[#B91C17] focus-within:!bg-[#991B13] focus:!bg-[#991B13] focus-visible:!bg-[#991B13] !shadow-[0_0_0_1px_#B91C17] disabled:!bg-[#E86960] disabled:!border-[#EDEDED]"
            >
              Yes, Cancel
            </Button>
          </div>
        </Modal>
      )}

      {/* Payment Modal */}
      {showPayment && selectedPlan && (
        <Modal isOpen onClose={() => setShowPayment(false)} className="rounded-2xl w-full max-w-3xl">
            <div className="p-4 md:p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <button
                onClick={() => setShowPayment(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon icon="hugeicons:cancel-01" className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Payment Method
                </h3>
                <div className="space-y-3">
                  {availableProviders.map(({ provider: p }) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSelectedProvider(p)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 md:p-4 rounded-xl border cursor-pointer transition-colors",
                        selectedProvider === p
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {p === "paystack" ? (
                          <span className="text-cyan-500 font-bold">
                            ≡ paystack
                          </span>
                        ) : (
                          <span className="text-purple-600 font-bold text-lg">
                            stripe
                          </span>
                        )}
                      </div>
                      {selectedProvider === p && (
                        <Icon
                          icon="hugeicons:checkmark-circle-02"
                          className="w-5 h-5 text-blue-500"
                        />
                      )}
                    </button>
                  ))}
                  {availableProviders.length === 0 && (
                    <p className="text-sm text-gray-400">
                      No payment methods available for this plan.
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 md:p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Subscribe to iExcelo {selectedPlan.name}
                </p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-2xl md:text-3xl font-bold text-gray-900">
                    {selectedPlanPrice}
                  </span>
                  <span className="text-sm text-gray-500">
                    for {selectedPlan.durationDays} days
                  </span>
                </div>

                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900">{selectedPlanPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span className="text-gray-900">{currencySymbol}0.00</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold border-t border-gray-200 pt-3">
                    <span className="text-gray-900">Today&apos;s Total</span>
                    <span className="text-gray-900">{selectedPlanPrice}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 border-t border-gray-100">
              <Button
                className="w-full justify-center"
                onClick={handleSubscribe}
                loading={isCheckingOut}
                disabled={!selectedProvider || availableProviders.length === 0}
              >
                Subscribe
              </Button>
              <p className="text-center text-xs text-gray-500 mt-4">
                By subscribing, you authorize iExcelo to charge you according to
                the terms until you cancel.
              </p>
              <div className="flex items-center justify-center gap-2 md:gap-4 mt-4 text-xs text-gray-400">
                <span>
                  Powered by{" "}
                  {selectedProvider === "stripe" ? (
                    <span className="text-purple-600 font-bold">stripe</span>
                  ) : (
                    <span className="text-cyan-500 font-bold">paystack</span>
                  )}
                </span>
                <span>|</span>
                <a href="#" className="hover:text-gray-600">
                  Terms
                </a>
                <a href="#" className="hover:text-gray-600">
                  Privacy
                </a>
              </div>
            </div>
        </Modal>
      )}
    </section>
  );
};

export default Subscriptions;
