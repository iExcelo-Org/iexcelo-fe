"use client";

import { useState, useMemo, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms";
import { Modal } from "@/components/molecules";
import { cn } from "@/lib/utils";
import { useStudentStore } from "@/store";
import type { ICheckoutInfo } from "@/types";

// Currency symbols mapping
const currencySymbols: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  EUR: "€",
  CAD: "C$",
  AUD: "A$",
  GHS: "GH₵",
  ZAR: "R",
  KES: "KSh",
  UGX: "USh",
  TZS: "TSh",
  XOF: "CFA",
  XAF: "CFA",
  GMD: "D",
};

// Plan styling configurations (matching Subscriptions.tsx design)
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

interface UpgradeProps {
  examTypeId: string;
  checkoutInfo: ICheckoutInfo | null;
}

export default function Upgrade({ examTypeId, checkoutInfo }: UpgradeProps) {
  const router = useRouter();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<
    "stripe" | "paystack" | null
  >(null);

  // Transform checkout info into display format
  const plans = useMemo(() => {
    if (!checkoutInfo?.plans) return [];
    return checkoutInfo.plans.map((plan, index) => ({
      ...plan,
      style: planStyles[index] || planStyles[0],
      formattedPrice: `${currencySymbols[checkoutInfo.currency] || ""}${plan.price.toLocaleString()}`,
    }));
  }, [checkoutInfo]);

  // Set default selected plan on initial load
  useEffect(() => {
    if (plans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, selectedPlanId]);

  const currentPlan = plans.find((p) => p.id === selectedPlanId);
  const currency = checkoutInfo?.currency || "NGN";
  const currencySymbol = currencySymbols[currency] || "₦";

  const availableProviders = currentPlan?.providers ?? [];

  const { initiateCheckout, isCheckingOut } = useStudentStore();

  const handleSubscribe = () => {
    if (!currentPlan || !checkoutInfo || !selectedProvider) return;

    initiateCheckout(
      {
        planId: currentPlan.id,
        examTypeId,
        region: checkoutInfo.region,
        provider: selectedProvider,
      },
      (url) => {
        window.location.href = url;
      },
    );
  };

  // Show error state if checkout info failed to load
  if (!checkoutInfo || plans.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <Icon
            icon="hugeicons:alert-circle"
            className="w-16 h-16 text-red-500 mx-auto mb-4"
          />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Unable to Load Plans
          </h1>
          <p className="text-gray-500 mb-4">
            We couldn&apos;t load the subscription plans. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-gray-600 mb-8"
          >
            <Icon icon="hugeicons:cancel-01" className="w-8 h-8" />
          </button>

          <div className="text-center mb-10">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Choose your plan with us!
            </h1>
            <p className="text-gray-500">
              Which package options fits you best?
            </p>
            {checkoutInfo.region && (
              <p className="text-xs text-gray-400 mt-2">
                Prices shown in {currency}
              </p>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {plans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <div
                  key={plan.id}
                  className="w-full md:w-[calc(33.333%-1rem)] cursor-pointer"
                  onClick={() => {
                    setSelectedPlanId(plan.id);
                    const firstProv = plan.providers[0]?.provider ?? null;
                    setSelectedProvider(firstProv);
                    setShowPayment(true);
                  }}
                >
                  <div
                    style={{
                      boxShadow: isSelected
                        ? "0 0 0 2px #007FFF, 0 5px 22px 0 rgba(0, 0, 0, 0.04)"
                        : "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
                    }}
                    className="p-[1rem_.75rem_1.25rem_.75rem] rounded-[1.5rem] bg-white transition-shadow"
                  >
                    <div
                      style={{
                        boxShadow:
                          "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
                      }}
                      className="p-[1.5rem_1.25rem] mb-6 rounded-[1.25rem] gradients-linear-grey"
                    >
                      <span
                        className={cn(
                          "block mb-3.5 font-[500] text-[.875rem] leading-5 p-[.125rem_.625rem] border w-fit mix-blend-multiply rounded-[1rem] bg-[#EFF8FF]",
                          plan.style.badge.color,
                        )}
                      >
                        {plan.style.badge.text}
                      </span>
                      <div
                        className={cn(
                          "w-fit h-fit p-3.5 rounded-full",
                          plan.style.icon.bg,
                        )}
                      >
                        <Icon
                          icon={plan.style.icon.icon}
                          className="w-6 h-6 text-white"
                        />
                      </div>
                      <p className="text-[1.125rem] mt-3.5 mb-2 font-[500] leading-7 text-[#2B2B2B]">
                        {plan.name}
                      </p>
                      <h6 className="tracking-[-.64px] text-[2rem] leading-10 font-[500]">
                        {plan.formattedPrice}
                      </h6>
                    </div>

                    <ul className="flex mb-24 flex-col gap-3">
                      {defaultFeatures.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Icon
                            icon="hugeicons:checkmark-circle-01"
                            className="w-5 h-5 text-[#2B2B2B]"
                          />
                          <p className="text-[#2B2B2B] text-[.875rem] font-[400] leading-5">
                            {feature}
                          </p>
                        </li>
                      ))}
                    </ul>

                    <Button className="w-full justify-center">
                      Select Plan
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* PaymentMethodSelector inline */}
      {showPayment && (
        <Modal
          isOpen
          onClose={() => setShowPayment(false)}
          className="rounded-2xl w-full max-w-3xl"
        >
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
                Subscribe to iExcelo {currentPlan?.name || "Plan"}
              </p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-2xl md:text-3xl font-bold text-gray-900">
                  {currentPlan?.formattedPrice || `${currencySymbol}0`}
                </span>
                <span className="text-sm text-gray-500">
                  for {currentPlan?.durationDays || 0} days
                </span>
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">
                    {currentPlan?.formattedPrice || `${currencySymbol}0`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="text-gray-900">{currencySymbol}0.00</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-gray-200 pt-3">
                  <span className="text-gray-900">Today&apos;s Total</span>
                  <span className="text-gray-900">
                    {currentPlan?.formattedPrice || `${currencySymbol}0`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 border-t border-gray-100">
            <Button
              className="w-full justify-center"
              onClick={handleSubscribe}
              loading={isCheckingOut}
              disabled={!currentPlan || !selectedProvider}
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
    </>
  );
}
