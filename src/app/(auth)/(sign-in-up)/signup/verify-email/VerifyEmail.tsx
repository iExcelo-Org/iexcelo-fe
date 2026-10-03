"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { Button } from "@/components/atoms";
import { Icon } from "@iconify/react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function VerifyEmail() {
  const router = useRouter();
  const { signupEmail, setSignupEmail } = useAuthStore();
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleGoBack = () => {
    setSignupEmail(null);
    router.push("/signup");
  };

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }

    if (!signupEmail) {
      toast.error("Email not found. Please sign up again.");
      router.push("/signup");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await api.post("/auth/verify-email", {
        email: signupEmail,
        code,
      });

      toast.success(
        response.data?.message ||
          "Email verified successfully! You can now log in.",
      );

      setSignupEmail(null);
      router.push("/login");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Failed to verify email. Please try again.";
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  if (!signupEmail) {
    return (
      <div
        style={{
          boxShadow:
            "0 3px 2px -2px rgba(235, 80, 23, 0.06), 0 5px 3px -2px rgba(235, 80, 23, 0.02)",
        }}
        className="rounded-[1rem] bg-white p-[1.25rem_1rem] sm:p-[2.5rem_2rem] text-center"
      >
        <p className="text-[.8125rem] sm:text-[.875rem] leading-[1.5rem] text-[#667085] mb-[1.25rem] sm:mb-[1.5rem]">
          No email found. Please sign up first.
        </p>
        <Button
          onClick={() => router.push("/signup")}
          className="w-full justify-center"
        >
          Go to Sign Up
        </Button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleGoBack}
        className="mb-[1.5rem] flex items-center font-[600] leading-[1.25rem] text-[0.875rem] gap-[.5rem] cursor-pointer text-[#2B2B2B] hover:text-gray-900"
      >
        <Icon
          icon="hugeicons:arrow-left-02"
          height="1.25rem"
          width="1.25rem"
          color="inherit"
        />
        Go Back
      </button>

      <div
        style={{
          boxShadow:
            "0 3px 2px -2px rgba(235, 80, 23, 0.06), 0 5px 3px -2px rgba(235, 80, 23, 0.02)",
        }}
        className="rounded-[1rem] bg-white p-[1.25rem_1rem] sm:p-[2.5rem_2rem]"
      >
        <div className="mb-[1.5rem] sm:mb-[2rem] text-center">
          <div className="mx-auto mb-[1rem] flex h-[3.5rem] w-[3.5rem] sm:h-[4rem] sm:w-[4rem] items-center justify-center rounded-full bg-[#E6F2FF]">
            <Icon
              icon="hugeicons:mail-02"
              height="1.75rem"
              width="1.75rem"
              color="#007FFF"
            />
          </div>
          <h2 className="mb-[.5rem] leading-[1.75rem] sm:leading-[2rem] text-[1.25rem] sm:text-[1.5rem] font-[600] tracking-[-.48px] text-[#2B2B2B]">
            Verify your email
          </h2>
          <p className="text-[.8125rem] sm:text-[.875rem] leading-[1.5rem] text-[#667085]">
            We sent a 6-digit code to
          </p>
          <p className="text-[.8125rem] sm:text-[.875rem] font-[500] leading-[1.5rem] text-[#2B2B2B]">
            {signupEmail}
          </p>
        </div>

        <div className="mb-[1.25rem] sm:mb-[1.5rem]">
          <label className="block text-[0.875rem] font-[500] leading-[1.25rem] text-[#344054] mb-[.375rem]">
            Verification Code
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setCode(value);
            }}
            placeholder="000000"
            className="w-full rounded-[.5rem] border border-[#D0D5DD] bg-white px-[.875rem] py-[.625rem] text-center text-[1.5rem] sm:text-[2rem] font-[500] tracking-[.5em] focus:border-[#007FFF] focus:outline-none transition-colors duration-[.4s]"
          />
        </div>

        <Button
          onClick={handleVerify}
          disabled={isVerifying || code.length !== 6}
          className="w-full justify-center"
        >
          {isVerifying ? "Verifying..." : "Verify Email"}
        </Button>

        <p className="mt-[1.25rem] sm:mt-[1.5rem] text-center text-[.8125rem] sm:text-[.875rem] leading-[1.5rem] text-[#667085]">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            className="font-[600] text-[#007FFF] hover:underline"
            onClick={async () => {
              try {
                await api.post("/auth/resend-verification", {
                  email: signupEmail,
                });
                toast.success("Verification code resent!");
              } catch {
                toast.error("Failed to resend code. Please try again.");
              }
            }}
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
}
