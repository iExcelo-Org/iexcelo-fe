"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { CARD_SHADOW, CURRENCY_SYMBOLS, handleAxiosError } from "@/utils";
import { useSponsorStore, useAuthStore, useUtilsStore } from "@/store";
import { StatusChip, Button, Radio, Tab, CheckBox } from "@/components/atoms";
import { Modal, Table } from "@/components/molecules";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { authRequest } from "@/lib/api";
import type {
  IExpiringGiveback,
  IExpiringGivebackStudent,
  ICheckoutInfo,
  IInitiateRenewalResult,
  ISponsorGiveback,
} from "@/types";

const PAGE_LIMIT = 20;

// ─── Renew Giveback Modal ─────────────────────────────────────────────────────

type RenewStep = "students" | "exam" | "plan" | "provider" | "confirm";

function RenewGivebackModal({
  giveback,
  onClose,
  onSuccess,
}: {
  giveback: IExpiringGiveback;
  onClose: () => void;
  onSuccess: (result: IInitiateRenewalResult) => void;
}) {
  const { examTypes } = useUtilsStore();
  const { initiateRenewal, isInitiatingRenewal } = useSponsorStore();
  const { user } = useAuthStore();

  // Pull original exam type from the first student's subscription (if present)
  const originalExamTypeId = giveback.subscriptions[0]?.examType?.id ?? "";
  const originalPlanName = giveback.subscriptions[0]?.plan?.name ?? "";

  // Students step: all students pre-checked
  const [includedIds, setIncludedIds] = useState<Set<string>>(
    new Set(giveback.subscriptions.map((s) => s.studentId)),
  );

  const [step, setStep] = useState<RenewStep>("students");
  const [selectedExamTypeId, setSelectedExamTypeId] =
    useState(originalExamTypeId);
  const [checkoutInfo, setCheckoutInfo] = useState<ICheckoutInfo | null>(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [selectedPlanIdx, setSelectedPlanIdx] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<
    "stripe" | "paystack" | null
  >(null);

  const loadPlans = async (examTypeId: string) => {
    setIsLoadingPlans(true);
    setSelectedPlanIdx(null);
    try {
      const res = await authRequest({
        method: "GET",
        url: `/subscriptions/checkout-info?examTypeId=${examTypeId}`,
      });
      const data =
        (res as { data?: { data?: ICheckoutInfo } }).data?.data ?? null;
      setCheckoutInfo(data);
      // Pre-select the plan matching the original plan name
      if (data) {
        const idx = data.plans.findIndex((p) => p.name === originalPlanName);
        setSelectedPlanIdx(idx >= 0 ? idx : null);
      }
    } catch (err) {
      handleAxiosError(err, "Failed to load plans");
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handleStudentsNext = () => {
    if (!includedIds.size) return;
    setStep("exam");
  };

  const handleExamNext = () => {
    if (!selectedExamTypeId) return;
    loadPlans(selectedExamTypeId);
    setStep("plan");
  };

  const handlePlanNext = () => {
    if (selectedPlanIdx === null) return;
    const plan =
      selectedPlanIdx !== null ? checkoutInfo?.plans[selectedPlanIdx] : null;
    const firstProvider = plan?.providers[0]?.provider ?? null;
    setSelectedProvider(firstProvider);
    setStep("provider");
  };

  const handleProviderNext = () => {
    if (!selectedProvider) return;
    setStep("confirm");
  };

  const toggleStudent = (studentId: string) => {
    setIncludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const selectedPlan =
    selectedPlanIdx !== null ? checkoutInfo?.plans[selectedPlanIdx] : null;
  const currSymbol =
    CURRENCY_SYMBOLS[checkoutInfo?.currency ?? ""] ??
    checkoutInfo?.currency ??
    "₦";

  const handleConfirm = () => {
    if (
      !selectedPlan ||
      !selectedExamTypeId ||
      !selectedPlan.planPriceId ||
      !selectedProvider
    )
      return;

    const callbackUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/sponsor/giveback/verify`
        : "/sponsor/giveback/verify";

    const sponsorEmail = (user as { email?: string } | null)?.email ?? "";

    initiateRenewal(
      giveback.id,
      {
        studentIds: Array.from(includedIds),
        examTypeId: selectedExamTypeId,
        planId: selectedPlan.id,
        planPriceId: selectedPlan.planPriceId,
        provider: selectedProvider,
        customerEmail: sponsorEmail,
        callbackUrl,
      },
      (result) => {
        onSuccess(result);
      },
    );
  };

  const stepLabels: Record<RenewStep, string> = {
    students: "Students",
    exam: "Exam Type",
    plan: "Plan",
    provider: "Payment",
    confirm: "Confirm",
  };
  const steps: RenewStep[] = ["students", "exam", "plan", "provider", "confirm"];
  const currentStepIdx = steps.indexOf(step);

  // Format student name helper
  const studentName = (s: IExpiringGivebackStudent) => {
    const u = s.student?.user;
    return u ? `${u.firstName} ${u.lastName}` : s.studentId;
  };

  // Days until expiry
  const daysUntil = (dateStr: string | null) => {
    if (!dateStr) return null;
    const diff = Math.ceil(
      (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    return diff;
  };

  return (
    <Modal isOpen onClose={onClose} zIndex="z-[1000]" className="rounded-[1rem] w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E4E7EC] sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-[1.125rem] font-[600] text-[#171717]">
              Renew Giveback
            </h2>
            <p className="text-sm text-[#757575] mt-0.5">
              Creates a new giveback that stacks after the current one ends
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Icon
              icon="hugeicons:cancel-01"
              className="w-5 h-5 text-[#757575]"
            />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[#F2F4F7]">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "rounded-full flex items-center justify-center font-[600]",
                    s === step
                      ? "w-6 h-6 bg-[#007FFF] text-white text-xs"
                      : currentStepIdx > i
                        ? "w-6 h-6 bg-[#007FFF] text-white"
                        : "w-6 h-6 bg-[#F2F4F7] text-[#667085] text-xs",
                  )}
                >
                  {currentStepIdx > i ? (
                    <Icon icon="hugeicons:tick-01" className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-[500]",
                    s === step ? "text-[#007FFF]" : "text-[#667085]",
                  )}
                >
                  {stepLabels[s]}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-px bg-[#E4E7EC]" />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="p-6">
          {/* Step 1: Students */}
          {step === "students" && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[#575757]">
                All students below will be included in the new giveback. Uncheck
                anyone you&apos;d like to leave out — this only affects the new
                giveback, not anything already paid for.
              </p>
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                {giveback.subscriptions.map((s) => {
                  const days = daysUntil(s.endDate);
                  return (
                    <div
                      key={s.studentId}
                      onClick={() => toggleStudent(s.studentId)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-[.75rem] border cursor-pointer transition-colors",
                        includedIds.has(s.studentId)
                          ? "border-[#007FFF] bg-[#E5F0FF]"
                          : "border-[#D6D6D6] bg-white hover:border-[#007FFF]/40",
                      )}
                    >
                      <CheckBox value={includedIds.has(s.studentId)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-[500] text-[#2B2B2B] truncate">
                          {studentName(s)}
                        </p>
                        {s.student?.user?.email && (
                          <p className="text-xs text-[#757575] truncate">
                            {s.student.user.email}
                          </p>
                        )}
                      </div>
                      {days !== null && (
                        <span
                          className={cn(
                            "text-xs font-[500] px-2 py-0.5 rounded-full flex-shrink-0",
                            days <= 3
                              ? "bg-[#FDECEA] text-[#D42620]"
                              : "bg-[#FEF6E7] text-[#F3A218]",
                          )}
                        >
                          {days}d left
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-[#757575]">
                {includedIds.size} of {giveback.subscriptions.length} student
                {giveback.subscriptions.length !== 1 ? "s" : ""} selected for
                renewal
              </p>
              <Button onClick={handleStudentsNext} disabled={!includedIds.size}>
                Continue
                <Icon icon="hugeicons:arrow-right-01" className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Step 2: Exam Type */}
          {step === "exam" && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[#575757]">
                Select the exam type for the new giveback. Pre-filled from the
                original — change if needed (e.g. JAMB batch moving to WAEC).
              </p>
              <div className="flex flex-col gap-3">
                {examTypes.map((et) => (
                  <div
                    key={et.id}
                    onClick={() => setSelectedExamTypeId(et.id)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-[.75rem] border transition-colors cursor-pointer",
                      selectedExamTypeId === et.id
                        ? "border-[#007FFF] bg-[#E5F0FF]"
                        : "border-[#D6D6D6] hover:border-[#007FFF]/40",
                    )}
                  >
                    <Radio
                      name="examType"
                      value={selectedExamTypeId === et.id}
                      onChange={() => setSelectedExamTypeId(et.id)}
                    />
                    <span className="text-sm font-[500] text-[#2B2B2B]">
                      {et.name}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outlined" onClick={() => setStep("students")}>
                  Back
                </Button>
                <Button onClick={handleExamNext} disabled={!selectedExamTypeId}>
                  Continue
                  <Icon icon="hugeicons:arrow-right-01" className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Plan */}
          {step === "plan" && (
            <div className="flex flex-col gap-4">
              {isLoadingPlans ? (
                <div className="flex justify-center py-8">
                  <Icon
                    icon="svg-spinners:ring-resize"
                    className="w-8 h-8 text-[#007FFF]"
                  />
                </div>
              ) : (
                <>
                  <p className="text-sm text-[#575757]">
                    Currency: <strong>{checkoutInfo?.currency}</strong> — billed
                    once for all {includedIds.size} student
                    {includedIds.size !== 1 ? "s" : ""}. Pre-filled from
                    original plan.
                  </p>
                  <div className="flex flex-col gap-3">
                    {(checkoutInfo?.plans ?? []).map((plan, idx) => (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlanIdx(idx)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-[.75rem] border transition-colors cursor-pointer",
                          selectedPlanIdx === idx
                            ? "border-[#007FFF] bg-[#E5F0FF]"
                            : "border-[#D6D6D6] hover:border-[#007FFF]/40",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Radio
                            name="plan"
                            value={selectedPlanIdx === idx}
                            onChange={() => setSelectedPlanIdx(idx)}
                          />
                          <div>
                            <p className="text-sm font-[600] text-[#2B2B2B]">
                              {plan.name}
                            </p>
                            <p className="text-xs text-[#757575]">
                              {plan.durationDays} days
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-[600] text-[#2B2B2B]">
                            {currSymbol}
                            {plan.price.toLocaleString()}
                          </p>
                          <p className="text-xs text-[#757575]">per student</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outlined" onClick={() => setStep("exam")}>
                      Back
                    </Button>
                    <Button
                      onClick={handlePlanNext}
                      disabled={selectedPlanIdx === null}
                    >
                      Continue
                      <Icon
                        icon="hugeicons:arrow-right-01"
                        className="w-5 h-5"
                      />
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4: Select Provider */}
          {step === "provider" && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[#575757]">
                Choose how you want to pay for this renewal.
              </p>
              <div className="flex flex-col gap-3">
                {(selectedPlan?.providers ?? []).map(({ provider: p }) => (
                  <div
                    key={p}
                    onClick={() => setSelectedProvider(p)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-[.75rem] border transition-colors cursor-pointer",
                      selectedProvider === p
                        ? "border-[#007FFF] bg-[#E5F0FF]"
                        : "border-[#D6D6D6] hover:border-[#007FFF]/40",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Radio
                        name="provider"
                        value={selectedProvider === p}
                        onChange={() => setSelectedProvider(p)}
                      />
                      {p === "paystack" ? (
                        <span className="text-cyan-600 font-bold">
                          ≡ Paystack
                        </span>
                      ) : (
                        <span className="text-purple-700 font-bold">
                          stripe
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {(selectedPlan?.providers ?? []).length === 0 && (
                  <p className="text-sm text-[#757575]">
                    No payment methods configured for this plan.
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outlined" onClick={() => setStep("plan")}>
                  Back
                </Button>
                <Button
                  onClick={handleProviderNext}
                  disabled={!selectedProvider}
                >
                  Continue
                  <Icon icon="hugeicons:arrow-right-01" className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Confirm */}
          {step === "confirm" && (
            <div className="flex flex-col gap-4">
              {/* Timing notice */}
              <div className="flex items-start gap-2 bg-[#DBEDFF] border border-[#258BE4] rounded-[.75rem] p-3">
                <Icon
                  icon="hugeicons:information-circle"
                  className="w-4 h-4 text-[#258BE4] mt-0.5 flex-shrink-0"
                />
                <p className="text-xs text-[#1A4E7A]">
                  The new subscriptions will start the day after the current
                  ones expire — no overlap, no gap. Students keep access
                  uninterrupted.
                </p>
              </div>

              {/* Order Summary */}
              <div className="bg-[#F9FAFB] rounded-[.75rem] p-4 flex flex-col gap-3 border border-[#E4E7EC]">
                <h4 className="text-sm font-[600] text-[#2B2B2B]">
                  New Giveback Summary
                </h4>
                <div className="flex justify-between text-sm">
                  <span className="text-[#575757]">Exam Type</span>
                  <span className="font-[500] text-[#2B2B2B]">
                    {examTypes.find((e) => e.id === selectedExamTypeId)?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#575757]">Plan</span>
                  <span className="font-[500] text-[#2B2B2B]">
                    {selectedPlan?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#575757]">Duration</span>
                  <span className="font-[500] text-[#2B2B2B]">
                    {selectedPlan?.durationDays} days
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#575757]">Students</span>
                  <span className="font-[500] text-[#2B2B2B]">
                    {includedIds.size}
                  </span>
                </div>
                {giveback.subscriptions.length - includedIds.size > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#575757]">Excluded</span>
                    <span className="font-[500] text-[#D42620]">
                      {giveback.subscriptions.length - includedIds.size} student
                      {giveback.subscriptions.length - includedIds.size !== 1
                        ? "s"
                        : ""}{" "}
                      not renewed
                    </span>
                  </div>
                )}
                <div className="border-t border-[#E4E7EC] pt-3 flex justify-between">
                  <span className="text-sm font-[600] text-[#2B2B2B]">
                    Total
                  </span>
                  <span className="text-sm font-[700] text-[#007FFF]">
                    {currSymbol}
                    {(
                      (selectedPlan?.price ?? 0) * includedIds.size
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Student list */}
              <div className="flex flex-col gap-1">
                <p className="text-xs font-[600] text-[#667085] uppercase">
                  Included Students
                </p>
                {giveback.subscriptions
                  .filter((s) => includedIds.has(s.studentId))
                  .map((s) => (
                    <div
                      key={s.studentId}
                      className="flex items-center gap-2 text-sm text-[#2B2B2B]"
                    >
                      <Icon
                        icon="hugeicons:user-03"
                        className="w-3.5 h-3.5 text-[#007FFF]"
                      />
                      {studentName(s)}
                    </div>
                  ))}
              </div>

              <p className="text-xs text-[#757575]">
                You will be redirected to{" "}
                {selectedProvider
                  ? selectedProvider.charAt(0).toUpperCase() +
                    selectedProvider.slice(1)
                  : "the payment provider"}{" "}
                to complete payment. The new subscriptions are queued and
                activate automatically when the current ones expire.
              </p>

              <div className="flex gap-3">
                <Button variant="outlined" onClick={() => setStep("provider")}>
                  Back
                </Button>
                <Button
                  onClick={handleConfirm}
                  loading={isInitiatingRenewal}
                  disabled={isInitiatingRenewal || !selectedPlan?.planPriceId}
                >
                  <Icon icon="hugeicons:credit-card" className="w-5 h-5" />
                  Renew & Pay
                </Button>
              </div>
            </div>
          )}
        </div>
    </Modal>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const GivebackHistory = () => {
  const { accessToken } = useAuthStore();
  const {
    givebacksAll,
    givebacksAllTotal,
    givebacksAllPage,
    isLoadingGivebacksAll,
    givebacksActive,
    givebacksActiveTotal,
    givebacksActivePage,
    isLoadingGivebacksActive,
    givebacksExpired,
    givebacksExpiredTotal,
    givebacksExpiredPage,
    isLoadingGivebacksExpired,
    givebackStats,
    isLoadingGivebackStats,
    expiringGivebacks,
    isLoadingExpiringGivebacks,
    initGivebackTabs,
    fetchGivebacksAll,
    fetchGivebacksActive,
    fetchGivebacksExpired,
    fetchGivebackStats,
    fetchExpiringGivebacks,
  } = useSponsorStore();

  const [renewTarget, setRenewTarget] = useState<IExpiringGiveback | null>(
    null,
  );

  useEffect(() => {
    if (!accessToken) return;
    initGivebackTabs();
    fetchGivebackStats();
    fetchExpiringGivebacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const handleRenewalSuccess = (result: IInitiateRenewalResult) => {
    if (result.conflicts.length) {
      toast.warning(
        `${result.eligibleCount} student${result.eligibleCount !== 1 ? "s" : ""} queued. ${result.conflicts.length} skipped.`,
      );
    }
    if (result.authorizationUrl) {
      window.location.href = result.authorizationUrl;
    }
  };

  const totalPagesAll = Math.ceil(givebacksAllTotal / PAGE_LIMIT);
  const totalPagesActive = Math.ceil(givebacksActiveTotal / PAGE_LIMIT);
  const totalPagesExpired = Math.ceil(givebacksExpiredTotal / PAGE_LIMIT);

  // Days until expiry helper
  const daysUntil = (dateStr: string | null) => {
    if (!dateStr) return null;
    return Math.ceil(
      (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
  };

  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
      {/* Header */}
      <div className="flex mb-5.5 flex-col xl:flex-row xl:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Giveback History</h1>
          <p className="text-gray-500 text-sm mt-1">
            Track all your student sponsorship activations
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <section className="grid gap-6 grid-cols-5 mb-6">
        {/* Total Spent */}
        <div
          style={{ boxShadow: CARD_SHADOW }}
          className="bg-white flex items-center rounded-xl py-5 px-4 border border-[#D6D6D6]"
        >
          <div className="w-full">
            <div className="bg-[#E5E8F8] rounded-lg flex p-[.875rem] w-fit items-center justify-center mb-4">
              <Icon
                icon="hugeicons:money-send-02"
                height="1.5rem"
                width="1.5rem"
                className="text-[#007FFF]"
              />
            </div>
            <p className="text-[#575757] text-sm mb-1">Total Spent</p>
            <p className="text-[1.75rem] leading-[2.25rem] font-[500] text-[#2B2B2B]">
              {isLoadingGivebackStats
                ? "—"
                : `₦${(givebackStats?.totalSpent ?? 0).toLocaleString()}`}
            </p>
          </div>
        </div>

        {/* Total Givebacks */}
        <div
          style={{ boxShadow: CARD_SHADOW }}
          className="bg-white flex items-center rounded-xl py-5 px-4 border border-[#D6D6D6]"
        >
          <div className="w-full">
            <div className="bg-[#F3F3F3] rounded-lg flex p-[.875rem] w-fit items-center justify-center mb-4">
              <Icon
                icon="hugeicons:healtcare"
                height="1.5rem"
                width="1.5rem"
                className="text-[#E32E89]"
              />
            </div>
            <p className="text-[#575757] text-sm mb-1">Total Givebacks</p>
            <p className="text-[1.75rem] leading-[2.25rem] font-[500] text-[#2B2B2B]">
              {isLoadingGivebackStats
                ? "—"
                : (givebackStats?.totalGivebacks ?? 0)}
            </p>
          </div>
        </div>

        {/* This Month */}
        <div
          style={{ boxShadow: CARD_SHADOW }}
          className="bg-white flex items-center rounded-xl py-5 px-4 border border-[#D6D6D6]"
        >
          <div className="w-full">
            <div className="bg-[#E6E6F1] rounded-lg flex p-[.875rem] w-fit items-center justify-center mb-4">
              <Icon
                icon="hugeicons:calendar-04"
                height="1.5rem"
                width="1.5rem"
                className="text-[#000077]"
              />
            </div>
            <p className="text-[#575757] text-sm mb-1">This Month</p>
            <p className="text-[1.75rem] leading-[2.25rem] font-[500] text-[#2B2B2B]">
              {isLoadingGivebackStats
                ? "—"
                : (givebackStats?.thisMonthGivebacks ?? 0)}
            </p>
          </div>
        </div>

        {/* Students Sponsored */}
        <div
          style={{ boxShadow: CARD_SHADOW }}
          className="bg-white flex items-center rounded-xl py-5 px-4 border border-[#D6D6D6]"
        >
          <div className="w-full">
            <div className="bg-[#E7F6EC] rounded-lg flex p-[.875rem] w-fit items-center justify-center mb-4">
              <Icon
                icon="hugeicons:user-03"
                height="1.5rem"
                width="1.5rem"
                className="text-[#0F973D]"
              />
            </div>
            <p className="text-[#575757] text-sm mb-1">Students Sponsored</p>
            <p className="text-[1.75rem] leading-[2.25rem] font-[500] text-[#2B2B2B]">
              {isLoadingGivebackStats
                ? "—"
                : (givebackStats?.studentsSponsored ?? 0)}
            </p>
          </div>
        </div>

        {/* Expiring Soon */}
        <div
          style={{ boxShadow: CARD_SHADOW }}
          className="bg-white flex items-center rounded-xl py-5 px-4 border border-[#D6D6D6]"
        >
          <div className="w-full">
            <div className="bg-[#FEF6E7] rounded-lg flex p-[.875rem] w-fit items-center justify-center mb-4">
              <Icon
                icon="hugeicons:alert-02"
                height="1.5rem"
                width="1.5rem"
                className="text-[#F3A218]"
              />
            </div>
            <p className="text-[#575757] text-sm mb-1">Expiring Soon</p>
            <p className="text-[1.75rem] leading-[2.25rem] font-[500] text-[#2B2B2B]">
              {isLoadingGivebackStats
                ? "—"
                : (givebackStats?.expiringSoon ?? 0)}
            </p>
          </div>
        </div>
      </section>

      {/* Expiring Soon — Renew section: only render once loaded AND non-empty */}
      {!isLoadingExpiringGivebacks && expiringGivebacks.length > 0 && (
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Icon
              icon="hugeicons:alert-02"
              className="w-5 h-5 text-[#F3A218]"
            />
            <h2 className="text-[1rem] font-[600] text-[#2B2B2B]">
              Expiring Within 10 Days — Ready to Renew
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {expiringGivebacks.map((gb) => {
              const sub = gb.subscriptions[0];
              const days = daysUntil(gb.earliestExpiry);
              const currSymbol = CURRENCY_SYMBOLS[gb.currency] ?? gb.currency;

              return (
                <div
                  key={gb.id}
                  style={{ boxShadow: CARD_SHADOW }}
                  className="bg-white rounded-xl border border-[#FDE8C8] p-4 flex items-center gap-4"
                >
                  {/* Days badge */}
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl px-4 py-3 min-w-[4.5rem] flex-shrink-0",
                      days !== null && days <= 3
                        ? "bg-[#FDECEA] text-[#D42620]"
                        : "bg-[#FEF6E7] text-[#F3A218]",
                    )}
                  >
                    <span className="text-2xl font-[700] leading-none">
                      {days ?? "—"}
                    </span>
                    <span className="text-[.6875rem] font-[500] mt-0.5">
                      days left
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {sub?.examType?.name && (
                        <span className="bg-[#41BCE2] px-2 py-0.5 rounded-full text-xs text-white font-[500]">
                          {sub.examType.name}
                        </span>
                      )}
                      {sub?.plan?.name && (
                        <span className="bg-[#FFECE5] text-[#AD3307] px-2 py-0.5 rounded-full text-xs font-[500]">
                          {sub.plan.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#575757]">
                      <span className="flex items-center gap-1">
                        <Icon
                          icon="hugeicons:user-03"
                          className="w-3.5 h-3.5"
                        />
                        {gb.studentCount} student
                        {gb.studentCount !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon
                          icon="hugeicons:money-send-02"
                          className="w-3.5 h-3.5"
                        />
                        {currSymbol}
                        {gb.amount.toLocaleString()}
                      </span>
                      <span className="text-[#A6A6A6]">
                        Started{" "}
                        {new Date(gb.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => setRenewTarget(gb)}
                    className="flex items-center gap-2 bg-[#007FFF] hover:bg-[#0066CC] text-white text-sm font-[600] px-4 py-2 rounded-[.625rem] transition-colors flex-shrink-0"
                  >
                    <Icon icon="hugeicons:refresh" className="w-4 h-4" />
                    Renew Giveback
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Givebacks Table with tabs */}
      {(() => {
        const columns = [
          {
            title: "Exam",
            customTableBody: (name: string | null) =>
              name ? (
                <span className="bg-[#41BCE2] p-[.125rem_.5rem] rounded-[999999px] text-[.75rem] text-white font-[500]">
                  {name}
                </span>
              ) : (
                <span className="text-[#A6A6A6] text-sm">—</span>
              ),
          },
          {
            title: "Plan",
            customTableBody: (name: string | null) =>
              name ? (
                <span className="bg-[#FFECE5] rounded-[99999px] p-[.125rem_.375rem] text-[.75rem] font-[500] text-[#AD3307]">
                  {name}
                </span>
              ) : (
                <span className="text-[#A6A6A6] text-sm">—</span>
              ),
          },
          {
            title: "Students",
            customTableBody: (count: number) => (
              <div className="flex items-center gap-1">
                <Icon
                  icon="hugeicons:user-03"
                  className="w-3.5 h-3.5 text-[#007FFF]"
                />
                <span className="text-sm text-[#2B2B2B] font-[500]">
                  {count}
                </span>
              </div>
            ),
          },
          "Amount",
          "Date",
          {
            title: "Status",
            customTableBody: (status: string) => (
              <StatusChip id={status} type="subscription" />
            ),
          },
        ];

        const toRow = (giveback: ISponsorGiveback) => {
          const sub = giveback.subscription;
          const currSymbol =
            CURRENCY_SYMBOLS[giveback.currency] ?? giveback.currency;
          return [
            sub?.examType?.name ?? null,
            sub?.plan?.name ?? null,
            giveback.studentCount ?? 1,
            `${currSymbol}${giveback.amount.toLocaleString()}`,
            new Date(giveback.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            giveback.status ?? sub?.status ?? "inactive",
          ];
        };

        return (
          <Tab
            tabs={["All", "Active", "Expired"]}
            tabChildren={[
              <Table
                key="all"
                data={givebacksAll.map(toRow)}
                loading={isLoadingGivebacksAll}
                pagination={true}
                metaData={{
                  endPage: totalPagesAll,
                  currentPage: givebacksAllPage,
                  totalRecords: givebacksAllTotal,
                  onPageChange: (skip: number) => {
                    const newPage = Math.floor(skip / PAGE_LIMIT) + 1;
                    fetchGivebacksAll(newPage, PAGE_LIMIT);
                  },
                }}
                recordsPerPage={PAGE_LIMIT}
                emptyStateProps={{
                  svg: "hugeicons:healtcare",
                  title: "No givebacks yet",
                  text: "Your sponsorship history will appear here once you subscribe students.",
                }}
                columns={columns}
              />,
              <Table
                key="active"
                data={givebacksActive.map(toRow)}
                loading={isLoadingGivebacksActive}
                pagination={true}
                metaData={{
                  endPage: totalPagesActive,
                  currentPage: givebacksActivePage,
                  totalRecords: givebacksActiveTotal,
                  onPageChange: (skip: number) => {
                    const newPage = Math.floor(skip / PAGE_LIMIT) + 1;
                    fetchGivebacksActive(newPage, PAGE_LIMIT);
                  },
                }}
                recordsPerPage={PAGE_LIMIT}
                emptyStateProps={{
                  svg: "hugeicons:healtcare",
                  title: "No active givebacks",
                  text: "Active givebacks will appear here.",
                }}
                columns={columns}
              />,
              <Table
                key="expired"
                data={givebacksExpired.map(toRow)}
                loading={isLoadingGivebacksExpired}
                pagination={true}
                metaData={{
                  endPage: totalPagesExpired,
                  currentPage: givebacksExpiredPage,
                  totalRecords: givebacksExpiredTotal,
                  onPageChange: (skip: number) => {
                    const newPage = Math.floor(skip / PAGE_LIMIT) + 1;
                    fetchGivebacksExpired(newPage, PAGE_LIMIT);
                  },
                }}
                recordsPerPage={PAGE_LIMIT}
                emptyStateProps={{
                  svg: "hugeicons:healtcare",
                  title: "No expired givebacks",
                  text: "Expired givebacks will appear here.",
                }}
                columns={columns}
              />,
            ]}
            contentProps={{ className: "mt-4" }}
          />
        );
      })()}

      {/* Renew Modal */}
      {renewTarget && (
        <RenewGivebackModal
          giveback={renewTarget}
          onClose={() => setRenewTarget(null)}
          onSuccess={handleRenewalSuccess}
        />
      )}
    </section>
  );
};

export default GivebackHistory;
