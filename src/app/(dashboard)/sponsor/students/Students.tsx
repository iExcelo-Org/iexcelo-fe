"use client";

import { Icon } from "@iconify/react";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { CARD_SHADOW, CURRENCY_SYMBOLS, handleAxiosError } from "@/utils";
import { cn } from "@/lib/utils";
import { Button, Radio, StatusChip, Tab } from "@/components/atoms";
import { InputField, Modal, SelectOption, Table } from "@/components/molecules";
import { useSponsorStore, useAuthStore, useUtilsStore } from "@/store";
import {
  addStudentSchema,
  createSponsorUrlSchema,
} from "@/schemas/sponsor.schema";
import { toast } from "sonner";
import Link from "next/link";
import StudentsSkeleton from "./StudentsSkeleton";
import { authRequest } from "@/lib/api";
import type {
  ICheckoutInfo,
  IInitiateGivebackResult,
  ISponsorStore,
} from "@/types";

// ─── Subscribe Modal ─────────────────────────────────────────────────────────

type SubscribeStep = "exam" | "plan" | "provider" | "confirm";

function SubscribeModal({
  selectedStudentIds,
  studentNames,
  onClose,
  onSuccess,
}: {
  selectedStudentIds: string[];
  studentNames: string[];
  onClose: () => void;
  onSuccess: (result: IInitiateGivebackResult) => void;
}) {
  const { examTypes } = useUtilsStore();
  const { initiateGiveback, isInitiatingGiveback } = useSponsorStore();
  const { user } = useAuthStore();

  const [step, setStep] = useState<SubscribeStep>("exam");
  const [selectedExamTypeId, setSelectedExamTypeId] = useState("");
  const [checkoutInfo, setCheckoutInfo] = useState<ICheckoutInfo | null>(null);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [selectedPlanIdx, setSelectedPlanIdx] = useState<number | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<
    "stripe" | "paystack" | null
  >(null);

  const loadPlans = async (examTypeId: string) => {
    setIsLoadingPlans(true);
    try {
      const res = await authRequest({
        method: "GET",
        url: `/subscriptions/checkout-info?examTypeId=${examTypeId}`,
      });
      const data =
        (res as { data?: { data?: ICheckoutInfo } }).data?.data ?? null;
      setCheckoutInfo(data);
    } catch (err) {
      handleAxiosError(err, "Failed to load plans");
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handleExamNext = () => {
    if (!selectedExamTypeId) return;
    loadPlans(selectedExamTypeId);
    setStep("plan");
  };

  const handlePlanNext = () => {
    if (selectedPlanIdx === null) return;
    // Auto-select first available provider for the chosen plan
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

  const selectedPlan =
    selectedPlanIdx !== null ? checkoutInfo?.plans[selectedPlanIdx] : null;
  const currSymbol =
    CURRENCY_SYMBOLS[checkoutInfo?.currency ?? ""] ??
    checkoutInfo?.currency ??
    "";

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

    initiateGiveback(
      {
        studentIds: selectedStudentIds,
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

  const stepLabels: Record<SubscribeStep, string> = {
    exam: "Exam Type",
    plan: "Select Plan",
    provider: "Payment",
    confirm: "Confirm",
  };
  const steps: SubscribeStep[] = ["exam", "plan", "provider", "confirm"];

  return (
    <Modal isOpen onClose={onClose} zIndex="z-[1000]" className="rounded-[1rem] w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E4E7EC] sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-[1.125rem] font-[600] text-[#171717]">
              Subscribe Students
            </h2>
            <p className="text-sm text-[#757575] mt-0.5">
              {selectedStudentIds.length} student
              {selectedStudentIds.length !== 1 ? "s" : ""} selected
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
                      : steps.indexOf(step) > i
                        ? "w-6 h-6 bg-[#007FFF] text-white"
                        : "w-6 h-6 bg-[#F2F4F7] text-[#667085] text-xs",
                  )}
                >
                  {steps.indexOf(step) > i ? (
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
          {/* Step 1: Select Exam Type */}
          {step === "exam" && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[#575757]">
                All selected students will be subscribed to the same exam type
                and plan.
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
              <Button onClick={handleExamNext} disabled={!selectedExamTypeId}>
                Continue
                <Icon icon="hugeicons:arrow-right-01" className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Step 2: Select Plan */}
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
                    once for all {selectedStudentIds.length} student
                    {selectedStudentIds.length !== 1 ? "s" : ""}.
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

          {/* Step 3: Select Provider */}
          {step === "provider" && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[#575757]">
                Choose how you want to pay for this subscription.
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
                  <Icon
                    icon="hugeicons:arrow-right-01"
                    className="w-5 h-5"
                  />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === "confirm" && (
            <div className="flex flex-col gap-4">
              {/* Summary */}
              <div className="bg-[#F9FAFB] rounded-[.75rem] p-4 flex flex-col gap-3 border border-[#E4E7EC]">
                <h4 className="text-sm font-[600] text-[#2B2B2B]">
                  Order Summary
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
                    {selectedStudentIds.length}
                  </span>
                </div>
                <div className="border-t border-[#E4E7EC] pt-3 flex justify-between">
                  <span className="text-sm font-[600] text-[#2B2B2B]">
                    Total
                  </span>
                  <span className="text-sm font-[700] text-[#007FFF]">
                    {currSymbol}
                    {(
                      (selectedPlan?.price ?? 0) * selectedStudentIds.length
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Students list */}
              <div className="flex flex-col gap-1">
                <p className="text-xs font-[600] text-[#667085] uppercase">
                  Students
                </p>
                {studentNames.map((name, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm font-[600] text-[#2B2B2B]"
                  >
                    <Icon
                      icon="hugeicons:user-03"
                      className="w-4.5 h-4.5 text-[#007FFF]"
                    />
                    {name}
                  </div>
                ))}
              </div>

              <p className="text-xs text-[#757575]">
                You will be redirected to{" "}
                {selectedProvider
                  ? selectedProvider.charAt(0).toUpperCase() +
                    selectedProvider.slice(1)
                  : "the payment provider"}{" "}
                to complete payment. Subscriptions activate immediately after
                verification.
              </p>

              <div className="flex gap-3">
                <Button variant="outlined" onClick={() => setStep("provider")}>
                  Back
                </Button>
                <Button
                  onClick={handleConfirm}
                  loading={isInitiatingGiveback}
                  disabled={isInitiatingGiveback || !selectedPlan?.planPriceId}
                >
                  <Icon icon="hugeicons:credit-card" className="w-5 h-5" />
                  Pay & Subscribe
                </Button>
              </div>
            </div>
          )}
        </div>
    </Modal>
  );
}

// ─── Add Students Modal ────────────────────────────────────────────────────────

function AddStudentsModal({
  onClose,
  sponsorUrls,
  isLoadingUrls,
  isCreatingUrl,
  isAddingStudent,
  onAddStudent,
  onCreateUrl,
  onToggleUrl,
}: {
  onClose: () => void;
  sponsorUrls: ISponsorStore["sponsorUrls"];
  isLoadingUrls: boolean;
  isCreatingUrl: boolean;
  isAddingStudent: boolean;
  onAddStudent: (data: {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    examTypeId: string;
  }) => void;
  onCreateUrl: (data: { label: string; maxUses?: number | null }) => void;
  onToggleUrl: (urlId: string) => void;
}) {
  const { examTypes, countries } = useUtilsStore();

  const countryCodeOptions: SelectOption[] = countries.map((c) => ({
    value: c.code,
    label: c.codeLabel,
  }));

  const examTypeOptions: SelectOption[] = examTypes.map((et) => ({
    value: et.id,
    label: et.name,
  }));

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(addStudentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      examTypeId: "",
      countryCode: "",
      phoneNumber: "",
    },
  });

  const {
    control: urlControl,
    handleSubmit: handleUrlSubmit,
    reset: resetUrl,
    formState: { errors: urlErrors },
  } = useForm({
    resolver: yupResolver(createSponsorUrlSchema),
    defaultValues: { label: "", maxUses: undefined },
  });

  // Copy state per URL
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const onSubmit = (data: yup.InferType<typeof addStudentSchema>) => {
    const rawPhone = data.phoneNumber?.trim();
    const phone = rawPhone
      ? `${data.countryCode || ""}${rawPhone}`.trim()
      : undefined;
    onAddStudent({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: phone,
      examTypeId: data.examTypeId,
    });
  };

  const onCreateUrlSubmit = (
    data: yup.InferType<typeof createSponsorUrlSchema>,
  ) => {
    onCreateUrl({
      label: data.label,
      maxUses: data.maxUses ?? null,
    });
    resetUrl();
  };

  const handleCopyUrl = (code: string, id: string) => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://iexcelo.com";
    navigator.clipboard.writeText(`${origin}/signup/s/${code}`);
    toast.success("Sponsor link copied!");
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Modal isOpen onClose={onClose} zIndex="z-[1000]" className="rounded-[1rem] w-full max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-[1.25rem] font-[600] text-[#171717]">
              Add New Students
            </h2>
            <p className="text-sm text-[#757575] mt-1">
              Manually invite a student or share your sponsor link
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Icon
              icon="hugeicons:cancel-01"
              className="w-6 h-6 text-[#757575]"
            />
          </button>
        </div>

        {/* Tabs */}
        <Tab
          tabs={["Manual Invite", "Sponsor Links"]}
          tabChildren={[
            // ── Tab 1: Manual add ──────────────────────────────────────
            <div key="manual" className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      type="text"
                      label="First Name"
                      placeholder="Olivia"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      error={errors.firstName?.message}
                    />
                  )}
                />
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <InputField
                      type="text"
                      label="Last Name"
                      placeholder="Rhye"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      error={errors.lastName?.message}
                    />
                  )}
                />
              </div>

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <InputField
                    type="email"
                    label="Email Address"
                    placeholder="olivia@example.com"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    error={errors.email?.message}
                  />
                )}
              />

              <Controller
                name="countryCode"
                control={control}
                render={({ field: ccField }) => (
                  <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field: phoneField }) => (
                      <InputField
                        type="tel"
                        label="Phone Number (optional)"
                        selectOptions={countryCodeOptions}
                        telProps={{
                          selectProps: {
                            name: "countryCode",
                            placeholder: countryCodeOptions[0]?.label || "+234",
                            value: ccField.value ?? "",
                            onChange: (e) => ccField.onChange(e.target.value),
                          },
                          inputProps: {
                            name: "phoneNumber",
                            placeholder: "800 000 0000",
                            value: phoneField.value ?? "",
                            onChange: (e) =>
                              phoneField.onChange(
                                (e.target as HTMLInputElement).value,
                              ),
                          },
                        }}
                      />
                    )}
                  />
                )}
              />

              <Controller
                name="examTypeId"
                control={control}
                render={({ field }) => (
                  <InputField
                    type="select"
                    label="Exam Type"
                    placeholder="Select exam type"
                    selectOptions={examTypeOptions}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    error={errors.examTypeId?.message}
                  />
                )}
              />

              <p className="text-xs text-[#757575]">
                The student will receive an activation email with a link to set
                their password. The link expires in 7 days.
              </p>

              <Button
                onClick={handleSubmit(onSubmit)}
                loading={isAddingStudent}
                disabled={isAddingStudent}
              >
                <Icon icon="hugeicons:send-01" className="w-4 h-4" />
                Send Invitation
              </Button>
            </div>,

            // ── Tab 2: Sponsor Links ───────────────────────────────────
            <div key="links" className="p-6 flex flex-col gap-4">
              {/* Create new URL */}
              <div className="bg-[#F7F9FF] border border-[#D6D6D6] rounded-[.75rem] p-4 flex flex-col gap-3">
                <h4 className="text-sm font-[600] text-[#2B2B2B]">
                  Create New Sponsor Link
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Controller
                    name="label"
                    control={urlControl}
                    render={({ field }) => (
                      <InputField
                        type="text"
                        label="Label"
                        placeholder="e.g. Unity School Batch 1"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        error={urlErrors.label?.message}
                      />
                    )}
                  />
                  <Controller
                    name="maxUses"
                    control={urlControl}
                    render={({ field }) => (
                      <InputField
                        type="number"
                        label="Max Uses (optional)"
                        placeholder="Unlimited"
                        value={field.value ?? ""}
                        onChange={(
                          e: React.ChangeEvent<
                            HTMLInputElement | HTMLTextAreaElement
                          >,
                        ) => field.onChange(e.target.value)}
                        error={urlErrors.maxUses?.message}
                        min={1}
                      />
                    )}
                  />
                </div>
                <Button
                  onClick={handleUrlSubmit(onCreateUrlSubmit)}
                  loading={isCreatingUrl}
                  disabled={isCreatingUrl}
                >
                  <Icon icon="hugeicons:plus-sign" className="w-4 h-4" />
                  Create Link
                </Button>
              </div>

              {/* Existing URLs */}
              <div className="flex flex-col gap-2">
                {isLoadingUrls ? (
                  <div className="flex justify-center py-6">
                    <Icon
                      icon="svg-spinners:ring-resize"
                      className="w-6 h-6 text-[#007FFF]"
                    />
                  </div>
                ) : sponsorUrls.length === 0 ? (
                  <p className="text-center text-[#757575] text-sm py-4">
                    No sponsor links yet
                  </p>
                ) : (
                  sponsorUrls.map((url) => {
                    const origin =
                      typeof window !== "undefined"
                        ? window.location.origin
                        : "https://iexcelo.com";
                    const fullUrl = `${origin}/signup/s/${url.code}`;
                    return (
                      <div
                        key={url.id}
                        className={cn(
                          "border rounded-[.625rem] p-3 flex justify-between items-center gap-3",
                          url.isDisabled
                            ? "border-[#E4E7EC] bg-[#F9FAFB] opacity-60"
                            : "border-[#D6D6D6] bg-white",
                        )}
                      >
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-sm font-[500] text-[#2B2B2B] truncate">
                            {url.label}
                          </span>
                          <span className="text-xs text-[#757575] truncate">
                            {fullUrl}
                          </span>
                          <span className="text-xs text-[#A6A6A6]">
                            {url.usedCount} used
                            {url.maxUses !== null
                              ? ` / ${url.maxUses} max`
                              : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleCopyUrl(url.code, url.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Copy link"
                          >
                            <Icon
                              icon={
                                copiedId === url.id
                                  ? "hugeicons:tick-01"
                                  : "hugeicons:copy-01"
                              }
                              className="w-4 h-4 text-[#007FFF]"
                            />
                          </button>
                          <button
                            onClick={() => onToggleUrl(url.id)}
                            className="text-xs font-[500] px-2 py-1 rounded-lg border border-[#D0D5DD] text-[#344054] hover:bg-gray-50 transition-colors"
                            title={url.isDisabled ? "Enable" : "Disable"}
                          >
                            {url.isDisabled ? "Enable" : "Disable"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>,
          ]}
          buttonContainerProps={{ className: "px-6" }}
        />
    </Modal>
  );
}

// ─── Main Students Component ────────────────────────────────────────────────────

const Students = () => {
  const { accessToken } = useAuthStore();
  const {
    students,
    studentsTotal,
    studentsPage,
    studentStats,
    isLoadingStudents,
    isLoadingStats,
    isAddingStudent,
    sponsorUrls,
    isLoadingUrls,
    isCreatingUrl,
    fetchStudents,
    fetchStudentStats,
    fetchSponsorUrls,
    addStudent,
    createSponsorUrl,
    toggleSponsorUrl,
  } = useSponsorStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const PAGE_LIMIT = 20;
  const totalPages = Math.ceil(studentsTotal / PAGE_LIMIT);

  useEffect(() => {
    if (!accessToken) return;
    fetchStudents(1, PAGE_LIMIT);
    fetchStudentStats();
    fetchSponsorUrls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // Clear selection when page changes
  useEffect(() => {
    setSelectedIds([]);
  }, [studentsPage]);

  const enrollmentUp = (studentStats?.enrollmentChange ?? 0) >= 0;

  if (isLoadingStudents && students.length === 0) {
    return <StudentsSkeleton />;
  }

  // Table's onCheckChange gives back the full selected row arrays.
  // ID is always the last field (index 3, matching the Action column).
  const handleCheckChange = (rows: unknown[][]) => {
    setSelectedIds(rows.map((row) => row[row.length - 1] as string));
  };

  const selectedStudentNames = students
    .filter((s) => selectedIds.includes(s.id))
    .map((s) => `${s.firstName} ${s.lastName}`);

  const handleSubscribeSuccess = (result: IInitiateGivebackResult) => {
    setShowSubscribeModal(false);
    setSelectedIds([]);

    if (result.conflicts.length > 0) {
      toast.warning(
        `${result.eligibleCount} student(s) will be subscribed. ${result.conflicts.length} conflict(s) skipped.`,
      );
    }

    // Redirect to Paystack payment
    if (typeof window !== "undefined") {
      window.location.href = result.authorizationUrl;
    }
  };

  const tableData = students.map((s) => [
    { name: `${s.firstName} ${s.lastName}`, email: s.email },
    new Date(s.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    s.isActive,
    s.id, // index 3 → Action column
    s.id, // index 4 → explicit ID for onCheckChange (always the last field)
  ]);

  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
      <div className="flex mb-5.5 flex-col xl:flex-row xl:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 text-sm mt-1">
            Search, view, and sponsor students
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && (
            <Button onClick={() => setShowSubscribeModal(true)}>
              <Icon icon="hugeicons:gift" className="w-5 h-5" />
              Subscribe {selectedIds.length} Selected
            </Button>
          )}
          <Button onClick={() => setShowAddModal(true)}>
            <Icon className="text-white w-4 h-4" icon={"hugeicons:plus-sign"} />
            Add New Students
          </Button>
        </div>
      </div>

      {/* Stats */}
      <section className="grid gap-6 grid-cols-3">
        {/* Total Students */}
        <div
          style={{ boxShadow: CARD_SHADOW }}
          className="bg-white flex items-center rounded-xl py-5 px-4 border border-[#D6D6D6]"
        >
          <div className="w-full">
            <div className="bg-[#E5E8F8] rounded-lg flex p-[.875rem] w-fit items-center justify-center mb-4">
              <Icon
                icon="hugeicons:user-03"
                height="1.5rem"
                width="1.5rem"
                className="text-[#007FFF]"
              />
            </div>
            <div className="flex mb-1 items-center gap-3">
              <p className="text-[#575757] text-sm">Total Students</p>
            </div>
            <p className="text-[1.75rem] mb-4 leading-[2.25rem] font-[500] text-[#2B2B2B]">
              {isLoadingStats ? "—" : (studentStats?.total ?? 0)}
            </p>
            <div className="flex gap-[.25rem] items-center">
              <span className="p-[.125rem_.375rem] text-[.75rem] flex items-center gap-[.25rem] rounded-[.625rem] leading-5 font-[500] bg-[#E7F6EC] text-[#036B26]">
                All sponsored students
              </span>
            </div>
          </div>
        </div>

        {/* Active Students */}
        <div
          style={{ boxShadow: CARD_SHADOW }}
          className="bg-white flex items-center rounded-xl py-5 px-4 border border-[#D6D6D6]"
        >
          <div className="w-full">
            <div className="bg-[#E7F6EC] rounded-lg flex p-[.875rem] w-fit items-center justify-center mb-4">
              <Icon
                icon="hugeicons:checkmark-circle-01"
                height="1.5rem"
                width="1.5rem"
                className="text-[#0F973D]"
              />
            </div>
            <div className="flex mb-1 items-center gap-3">
              <p className="text-[#575757] text-sm">Active Students</p>
            </div>
            <p className="text-[1.75rem] mb-4 leading-[2.25rem] font-[500] text-[#2B2B2B]">
              {isLoadingStats ? "—" : (studentStats?.active ?? 0)}
            </p>
            <div className="flex gap-[.25rem] items-center">
              <span
                className={cn(
                  "p-[.125rem_.375rem] text-[.75rem] flex items-center gap-[.25rem] rounded-[.625rem] leading-5 font-[500]",
                  enrollmentUp
                    ? "bg-[#E7F6EC] text-[#036B26]"
                    : "bg-[#FBEAE9] text-[#D42620]",
                )}
              >
                <Icon
                  icon={
                    enrollmentUp
                      ? "hugeicons:arrow-up-right-01"
                      : "hugeicons:arrow-down-left-01"
                  }
                  className="w-4 h-4"
                />
                {Math.abs(studentStats?.enrollmentChange ?? 0)}%
              </span>
              <span className="text-[#757575] font-[500] leading-5 text-[.75rem]">
                from last month
              </span>
            </div>
          </div>
        </div>

        {/* Expiring Soon */}
        <div
          style={{ boxShadow: CARD_SHADOW }}
          className="bg-white flex items-center rounded-xl py-5 px-4 border border-[#D6D6D6]"
        >
          <div>
            <div className="bg-[#FEF6E7] rounded-lg flex p-[.875rem] w-fit items-center justify-center mb-4">
              <Icon
                icon="hugeicons:calendar-04"
                height="1.5rem"
                width="1.5rem"
                className="text-[#F3A218]"
              />
            </div>
            <p className="text-[#575757] text-sm mb-1">Expiring Soon</p>
            <p className="text-[1.75rem] mb-4 leading-[2.25rem] font-[500] text-[#2B2B2B]">
              {isLoadingStats ? "—" : (studentStats?.expiringSoon ?? 0)}
            </p>
            <div className="flex gap-[.25rem] items-center">
              <span className="text-[#757575] font-[500] leading-5 text-[.75rem]">
                Within 10 days
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Students Table */}
      <section className="mt-7">
        <>
          <Table
            data={tableData}
            loading={isLoadingStudents}
            isCheckable
            onCheckChange={handleCheckChange}
            emptyStateProps={{
              svg: "hugeicons:user-03",
              title: "No students yet",
              text: 'Click "Add New Students" to invite your first student.',
            }}
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
                  <div className="flex flex-col gap-1">
                    <span className="text-[#2B2B2B] text-[.875rem] font-[500]">
                      {name}
                    </span>
                    <span className="text-[#A6A6A6] text-[.75rem] font-[400]">
                      {email}
                    </span>
                  </div>
                ),
              },
              "Date Joined",
              {
                title: "Status",
                customTableBody: (isActive: boolean) => (
                  <StatusChip
                    id={isActive as unknown as string}
                    type="acc_stat"
                  />
                ),
              },
              {
                title: "Action",
                customTableBody: (id: string) => (
                  <Link
                    href={`/sponsor/students/analytics/${id}`}
                    className="text-blue-500 text-sm font-medium hover:underline"
                  >
                    View Analytics
                  </Link>
                ),
              },
            ]}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 mt-2">
              <span className="text-sm text-[#757575]">
                Page {studentsPage} of {totalPages} ({studentsTotal} students)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={studentsPage <= 1}
                  onClick={() => fetchStudents(studentsPage - 1, PAGE_LIMIT)}
                  className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={studentsPage >= totalPages}
                  onClick={() => fetchStudents(studentsPage + 1, PAGE_LIMIT)}
                  className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      </section>

      {/* Add Students Modal */}
      {showAddModal && (
        <AddStudentsModal
          onClose={() => setShowAddModal(false)}
          sponsorUrls={sponsorUrls}
          isLoadingUrls={isLoadingUrls}
          isCreatingUrl={isCreatingUrl}
          isAddingStudent={isAddingStudent}
          onAddStudent={(data) => {
            addStudent(data, () => setShowAddModal(false));
          }}
          onCreateUrl={createSponsorUrl}
          onToggleUrl={toggleSponsorUrl}
        />
      )}

      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <SubscribeModal
          selectedStudentIds={selectedIds}
          studentNames={selectedStudentNames}
          onClose={() => setShowSubscribeModal(false)}
          onSuccess={handleSubscribeSuccess}
        />
      )}
    </section>
  );
};

export default Students;
