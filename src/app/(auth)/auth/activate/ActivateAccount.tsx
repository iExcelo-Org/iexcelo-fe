"use client";

import { useState, Suspense } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSearchParams, useRouter } from "next/navigation";
import { Button, SVGClient } from "@/components/atoms";
import { InputField } from "@/components/molecules";
import Link from "next/link";
import { api } from "@/lib/api";
import { handleAxiosError } from "@/utils";
import { toast } from "sonner";
import { activateAccountSchema } from "@/schemas/sponsor.schema";

type ActivateFormData = yup.InferType<typeof activateAccountSchema>;

function ActivateAccountInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ActivateFormData>({
    resolver: yupResolver(activateAccountSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ActivateFormData) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/activate-sponsored", {
        token,
        password: data.password,
      });
      toast.success(
        res.data?.message || "Account activated! You can now log in.",
      );
      setDone(true);
    } catch (err) {
      handleAxiosError(err, "Failed to activate account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-[28rem] text-center">
        <div
          style={{
            boxShadow:
              "0 3px 2px -2px rgba(235, 80, 23, 0.06), 0 5px 3px -2px rgba(235, 80, 23, 0.02)",
          }}
          className="rounded-[1rem] bg-white p-[1.25rem_1rem] sm:p-[2.5rem_2rem]"
        >
          <h2 className="mb-[.5rem] sm:mb-[1rem] text-[1.25rem] sm:text-[1.5rem] font-[600] text-[#D42620]">
            Invalid Link
          </h2>
          <p className="text-[.8125rem] sm:text-[.875rem] leading-[1.5rem] text-[#667085] mb-[1.25rem] sm:mb-[1.5rem]">
            This activation link is invalid or missing a token. Please use the
            link from your invitation email.
          </p>
          <Link
            href="/login"
            className="text-[.875rem] text-[#007FFF] font-[600] hover:underline"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="w-full max-w-[28rem] text-center">
        <div
          style={{
            boxShadow:
              "0 3px 2px -2px rgba(235, 80, 23, 0.06), 0 5px 3px -2px rgba(235, 80, 23, 0.02)",
          }}
          className="rounded-[1rem] bg-white p-[1.25rem_1rem] sm:p-[2.5rem_2rem]"
        >
          <div className="w-[3.5rem] h-[3.5rem] sm:w-16 sm:h-16 rounded-full bg-[#E7F7ED] flex items-center justify-center mx-auto mb-[1rem] sm:mb-[1.25rem]">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#099137"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="mb-[.5rem] text-[1.25rem] sm:text-[1.5rem] font-[600] text-[#2B2B2B]">
            Account Activated!
          </h2>
          <p className="text-[.8125rem] sm:text-[.875rem] leading-[1.5rem] text-[#667085] mb-[1.5rem] sm:mb-[2rem]">
            Your account is ready. Log in to start your exam preparation
            journey.
          </p>
          <Button
            onClick={() => router.push("/login")}
            className="w-full justify-center"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[28rem]">
      <div
        style={{
          boxShadow:
            "0 3px 2px -2px rgba(235, 80, 23, 0.06), 0 5px 3px -2px rgba(235, 80, 23, 0.02)",
        }}
        className="rounded-[1rem] bg-white p-[1.25rem_1rem] sm:p-[2.5rem_2rem]"
      >
        <div className="mb-[2rem] text-center">
          <SVGClient src="/svg/logo.svg" className="mx-auto mb-4" />
          <h2 className="text-[1.25rem] sm:text-[1.5rem] font-[600] tracking-[-.48px] text-[#2B2B2B]">
            Set Your Password
          </h2>
          <p className="mt-[.5rem] text-[.8125rem] sm:text-[.875rem] text-[#667185]">
            Welcome to iExcelo! Your sponsor has created an account for you. Set
            a password to activate it.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-y-[1rem]"
        >
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <InputField
                type="password"
                label="Password"
                placeholder="At least 8 characters"
                value={field.value}
                onChange={field.onChange}
                error={errors.password?.message}
              />
            )}
          />
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <InputField
                type="password"
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={field.value}
                onChange={field.onChange}
                error={errors.confirmPassword?.message}
              />
            )}
          />

          <div className="mt-[.5rem]">
            <Button loading={loading} className="w-full justify-center">
              Activate Account
            </Button>
          </div>
        </form>
      </div>

      <div className="mt-[2.5rem] mx-auto p-[1rem_1.75rem] w-fit rounded-[1.875rem] bg-white text-[.875rem] leading-[1.25rem] font-[400] text-[#454545]">
        <span>Already have an account? </span>
        <Link
          href="/login"
          className="font-[600] text-[#007FFF] hover:underline"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}

export default function ActivateAccount() {
  return (
    <Suspense>
      <ActivateAccountInner />
    </Suspense>
  );
}
