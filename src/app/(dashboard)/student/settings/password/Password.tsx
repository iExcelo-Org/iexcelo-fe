/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Icon } from "@iconify/react";
import { Button, SVGClient } from "@/components/atoms";
import { InputField } from "@/components/molecules";
import { useAuthStore, useSettingsStore } from "@/store";
import { passwordSchema, PasswordFormData } from "@/schemas";
import { CARD_SHADOW } from "@/utils";
import { API_URL } from "@/lib/api";
import { useSearchParams } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type SetPasswordStep = "idle" | "code-sent" | "set-password";

const setPasswordConfirmSchema = yup.object({
  code: yup
    .string()
    .required("Code is required")
    .matches(/^\d{6}$/, "Enter the 6-digit code from your email"),
  newPassword: yup
    .string()
    .min(8, "At least 8 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords don't match")
    .required("Please confirm your password"),
});
type SetPasswordConfirmData = yup.InferType<typeof setPasswordConfirmSchema>;

// ─── SectionCard ──────────────────────────────────────────────────────────────

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

// ─── SetPasswordFlow ──────────────────────────────────────────────────────────
// Progressive UI for Google-only accounts: idle → code-sent → set-password

// Cooldown sequence: 30s, 1m, 2m, 4m, 8m, 16m, 32m, 1hr (capped), 24hr, then blocked
function getResendCooldown(attempt: number): number | null {
  if (attempt >= 9) return null; // blocked — must use code
  if (attempt === 8) return 86400; // 24hr
  return Math.min(30 * Math.pow(2, attempt), 3600); // doubles, caps at 1hr
}

function formatCooldown(seconds: number): string {
  if (seconds >= 3600) return `${Math.round(seconds / 3600)}h`;
  if (seconds >= 60) return `${Math.round(seconds / 60)}m`;
  return `${seconds}s`;
}

function SetPasswordFlow({ email }: { email: string }) {
  const { requestSetPassword, requestingSetPassword, confirmSetPassword, confirmingSetPassword } =
    useSettingsStore();

  const [step, setStep] = useState<SetPasswordStep>("idle");
  const [countdown, setCountdown] = useState(0);
  const [resendAttempt, setResendAttempt] = useState(0); // how many resends done so far

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SetPasswordConfirmData>({
    resolver: yupResolver(setPasswordConfirmSchema),
    mode: "onChange",
  });

  const handleRequestCode = async () => {
    const result = await requestSetPassword();
    if (result === false) return; // real error — stay on idle
    // 'true' = fresh code sent, 'rate-limited' = existing code in email
    setStep("code-sent");
    setResendAttempt(0);
    if (result === true) {
      setCountdown(getResendCooldown(0) ?? 0); // 30s before first resend
    }
    // rate-limited: no countdown — user checks inbox, enters existing code
  };

  const handleResend = async () => {
    const nextAttempt = resendAttempt + 1;
    if (getResendCooldown(nextAttempt) === null) return; // blocked — button is hidden anyway

    const result = await requestSetPassword();
    if (result === true) {
      setResendAttempt(nextAttempt);
      setCountdown(getResendCooldown(nextAttempt) ?? 0);
    }
    // rate-limited or error: backend already toasted the reason — don't change state
  };

  const handleConfirm = async (data: SetPasswordConfirmData) => {
    const ok = await confirmSetPassword(data.code, data.newPassword, () => {
      reset();
      setStep("idle");
      setResendAttempt(0);
      setCountdown(0);
    });
    if (!ok) return;
  };

  if (step === "idle") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 p-4 bg-[#EFF8FF] rounded-[.75rem]">
          <Icon
            icon="hugeicons:information-circle"
            className="w-5 h-5 text-[#007FFF] shrink-0 mt-0.5"
          />
          <p className="text-[.875rem] text-[#344054] leading-relaxed">
            Your account currently uses Google Sign-In only. Set a password to
            also enable email &amp; password login.
          </p>
        </div>
        <div className="flex justify-start">
          <Button
            onClick={handleRequestCode}
            loading={requestingSetPassword}
            disabled={requestingSetPassword}
          >
            Send Verification Code
          </Button>
        </div>
      </div>
    );
  }

  if (step === "code-sent") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 p-4 bg-[#EFF8FF] rounded-[.75rem]">
          <Icon
            icon="hugeicons:mail-01"
            className="w-5 h-5 text-[#007FFF] shrink-0 mt-0.5"
          />
          <div>
            <p className="text-[.875rem] font-[500] text-[#344054]">
              Check your email
            </p>
            <p className="text-[.8125rem] text-[#667085] mt-0.5">
              We sent a 6-digit code to <strong>{email}</strong>. Enter it below
              to continue.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleConfirm)} className="flex flex-col gap-4">
          <InputField
            label="Verification Code"
            placeholder="123456"
            maxLength={6}
            error={errors.code?.message}
            {...register("code")}
          />
          <InputField
            type="password"
            label="New Password"
            placeholder="At least 8 characters"
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
          <InputField
            type="password"
            label="Confirm Password"
            placeholder="Repeat new password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <div className="flex items-center justify-between mt-1">
            {getResendCooldown(resendAttempt + 1) === null ? (
              <p className="text-[.8125rem] text-[#98A2B3]">
                Max attempts reached. Use your current code.
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0 || requestingSetPassword}
                className="text-[.8125rem] text-[#007FFF] hover:underline disabled:text-[#98A2B3] disabled:no-underline disabled:cursor-not-allowed transition-colors"
              >
                {countdown > 0
                  ? `Resend code in ${formatCooldown(countdown)}`
                  : requestingSetPassword
                  ? "Sending..."
                  : "Resend code"}
              </button>
            )}
            <Button
              type="submit"
              loading={confirmingSetPassword}
              disabled={confirmingSetPassword}
            >
              Set Password
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return null;
}

// ─── Password ──────────────────────────────────────────────────────────────────

function PasswordInner() {
  const { user, refreshUser } = useAuthStore();
  const { changePassword, changingPassword, disconnectGoogle, disconnectingGoogle } =
    useSettingsStore();

  const searchParams = useSearchParams();
  const [justConnected, setJustConnected] = useState(false);

  // The Google connect callback appends ?connected=true — refresh user so provider updates immediately
  useEffect(() => {
    if (searchParams.get("connected") === "true") {
      setJustConnected(true);
      void refreshUser();
      // Clean up the URL param without a full reload
      const url = new URL(window.location.href);
      url.searchParams.delete("connected");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const provider = user?.provider as string | undefined;
  const isGoogleOnly = provider === "google";
  const isDual = provider === "dual";
  const hasPassword = provider === "local" || provider === "dual";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: PasswordFormData) => {
    await changePassword(data.currentPassword, data.newPassword, () => {
      reset();
    });
  };

  const handleConnectGoogle = () => {
    // Pass the user's id as state so the backend callback knows this is a connect flow
    window.location.href = `${API_URL}/auth/google?state=${user?.id ?? ""}`;
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Just connected success banner */}
      {justConnected && (
        <div className="flex items-center gap-3 p-4 bg-[#ECFDF3] border border-[#6CE9A6] rounded-[.75rem]">
          <Icon icon="hugeicons:checkmark-circle-01" className="w-5 h-5 text-[#099137] shrink-0" />
          <p className="text-[.875rem] text-[#099137] font-[500]">
            Google account connected successfully!
          </p>
        </div>
      )}

      {/* Change / Set Password */}
      <SectionCard
        title={isGoogleOnly ? "Set a Password" : "Change Password"}
        description={
          isGoogleOnly
            ? "Enable email & password login alongside your Google account"
            : "Update your account password"
        }
      >
        {isGoogleOnly ? (
          <SetPasswordFlow email={user?.email ?? ""} />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <InputField
              type="password"
              label="Current Password"
              placeholder="Enter current password"
              error={errors.currentPassword?.message}
              {...register("currentPassword")}
            />
            <InputField
              type="password"
              label="New Password"
              placeholder="At least 8 characters"
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />
            <InputField
              type="password"
              label="Confirm New Password"
              placeholder="Repeat new password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
            <div className="flex justify-end mt-2">
              <Button
                type="submit"
                loading={changingPassword || isSubmitting}
                disabled={changingPassword || isSubmitting}
              >
                Update Password
              </Button>
            </div>
          </form>
        )}
      </SectionCard>

      {/* Connected Accounts */}
      <SectionCard
        title="Connected Accounts"
        description="Manage how you sign in to iExcelo"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#D0D5DD] bg-white flex items-center justify-center shrink-0">
              <SVGClient src="/svg/google.svg" />
            </div>
            <div>
              <p className="text-[.875rem] font-[500] text-[#344054]">Google</p>
              <p className="text-[.8125rem] text-[#667085]">
                {isGoogleOnly
                  ? `Connected · ${user?.email}`
                  : isDual
                  ? `Connected · ${user?.googleEmail ?? user?.email}`
                  : "Not connected"}
              </p>
            </div>
          </div>

          {isDual ? (
            <Button
              onClick={async () => { await disconnectGoogle(); }}
              loading={disconnectingGoogle}
              disabled={disconnectingGoogle}
              className="bg-[#FEF3F2]! text-[#D42620]! border border-[#FECDCA] hover:bg-[#FEE4E2]! focus:ring-[#FDA29B]!"
            >
              Disconnect
            </Button>
          ) : isGoogleOnly ? (
            <span className="text-[.8125rem] text-[#667085] italic px-2">
              Primary sign-in
            </span>
          ) : (
            <Button
              onClick={handleConnectGoogle}
              className="bg-white! text-[#344054]! border border-[#D0D5DD] hover:bg-[#F9FAFB]!"
            >
              <SVGClient src="/svg/google.svg" />
              Connect Google
            </Button>
          )}
        </div>

        {isDual && (
          <p className="mt-3 text-[.8125rem] text-[#667085]">
            You can sign in with either Google or your email &amp; password.
            Disconnecting Google means you can only sign in with email &amp; password.
          </p>
        )}
        {hasPassword && !isDual && (
          <p className="mt-3 text-[.8125rem] text-[#667085]">
            Connecting Google lets you sign in with Google in addition to your
            existing email &amp; password.
          </p>
        )}
      </SectionCard>
    </div>
  );
}

export default function Password() {
  return (
    <Suspense>
      <PasswordInner />
    </Suspense>
  );
}
