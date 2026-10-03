/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { Button } from "@/components/atoms";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { signupEmail, verifyEmail, resendVerificationCode, hydrated } =
    useAuthStore();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Exponential countdown state
  const [countdown, setCountdown] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate next cooldown: 60, 90, 120, 150... (adds 30 each time)
  const getNextCooldown = useCallback((count: number) => {
    return 60 + count * 30;
  }, []);

  // Start countdown timer
  const startCountdown = useCallback((seconds: number) => {
    setCountdown(seconds);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Redirect if no email
  useEffect(() => {
    if (!hydrated) return;

    if (!signupEmail) {
      toast.error("No email provided. Please sign up first.");
      router.replace("/signup");
    }
  }, []);

  // Handle input change
  const handleChange = (index: number, value: string) => {
    // Only allow single digit
    if (value.length > 1) {
      value = value[value.length - 1];
    }

    // Only allow numbers
    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key down (backspace)
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pastedData)) {
      return;
    }

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      if (i < 6) {
        newOtp[i] = pastedData[i];
      }
    }
    setOtp(newOtp);

    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex((digit) => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : Math.min(nextEmptyIndex, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  // Handle verify
  const handleVerify = () => {
    const code = otp.join("");

    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    setIsVerifying(true);

    verifyEmail({ email: signupEmail!, code }, () => {
      setIsVerifying(false);
      // Redirect to login after successful verification
      router.push("/login");
    });

    // Reset verifying state if there was an error (callback won't be called)
    setTimeout(() => setIsVerifying(false), 3000);
  };

  // Handle resend code
  const handleResend = () => {
    if (countdown > 0) return;

    setIsResending(true);

    resendVerificationCode(signupEmail!, () => {
      setIsResending(false);
      // Clear the OTP inputs
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();

      // Start countdown with exponential increase
      const nextCooldown = getNextCooldown(resendCount);
      startCountdown(nextCooldown);
      setResendCount((prev) => prev + 1);
    });

    // Reset resending state if there was an error (callback won't be called)
    setTimeout(() => setIsResending(false), 3000);
  };

  if (!signupEmail) {
    return null;
  }

  const canResend = countdown === 0 && !isResending;

  return (
    <div>
      <div
        style={{
          boxShadow:
            "0 3px 2px -2px rgba(235, 80, 23, 0.06), 0 5px 3px -2px rgba(235, 80, 23, 0.02)",
        }}
        className="rounded-[1rem] bg-white p-[1.25rem_1rem] sm:p-[2.5rem_2rem]"
      >
        <h2 className="mb-[.5rem] leading-[1.75rem] sm:leading-[2rem] text-center text-[1.25rem] sm:text-[1.5rem] font-[600] tracking-[-.48px] text-[#2B2B2B]">
          Verify Your Email
        </h2>
        <p className="text-[.8125rem] sm:text-[.875rem] leading-[1.5rem] text-[#667085] mb-[1.5rem] sm:mb-[2rem] text-center">
          We sent a 6-digit code to{" "}
          <span className="font-[600] text-[#2B2B2B]">{signupEmail}</span>.
          Enter it below to verify your account.
        </p>

        <div className="space-y-6">
          <div className="flex gap-[.375rem] sm:gap-3 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-[2.25rem] h-[3rem] sm:w-12 sm:h-14 text-center text-[1rem] sm:text-xl font-[600] border border-[#D0D5DD] rounded-lg focus:border-[#007FFF] focus:outline-none transition-colors"
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          <Button
            onClick={handleVerify}
            disabled={isVerifying || otp.join("").length !== 6}
            className="w-full justify-center"
            loading={isVerifying}
          >
            Verify Email
          </Button>

          <div className="text-center">
            <p className="text-[.875rem] text-[#667085] mb-[.5rem]">
              Didn&apos;t receive the code?
            </p>
            {countdown > 0 ? (
              <p className="text-[.875rem] text-[#667085]">
                Can resend in{" "}
                <span className="font-[600] text-[#2B2B2B]">
                  {formatTime(countdown)}
                </span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={!canResend}
                className="text-[.875rem] font-[600] text-[#007FFF] hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isResending ? "Sending..." : "Resend Code"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
