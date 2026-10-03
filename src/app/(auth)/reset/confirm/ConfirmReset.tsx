"use client";

import { useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { InputField } from "@/components/molecules";
import { Button } from "@/components/atoms";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  passwordResetConfirmSchema,
  PasswordResetConfirmFormData,
} from "@/schemas";
import { useAuthStore } from "@/store";
import { toast } from "sonner";

function ConfirmResetInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { resetPassword } = useAuthStore();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetConfirmFormData>({
    resolver: yupResolver(passwordResetConfirmSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link. Please request a new one.");
      router.replace("/reset/init");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: PasswordResetConfirmFormData) => {
    if (!token) return;

    await resetPassword(token, data.password, () => {
      setIsSuccess(true);
    });
  };

  if (!token) {
    return null;
  }

  if (isSuccess) {
    return (
      <div
        style={{
          boxShadow:
            "0 3px 2px -2px rgba(235, 80, 23, 0.06), 0 5px 3px -2px rgba(235, 80, 23, 0.02)",
        }}
        className="rounded-[1rem] max-w-[34rem] w-[95%] mx-auto bg-white p-[1.25rem_1rem] sm:p-[2.5rem_2rem]"
      >
        <h2 className="mb-[.75rem] sm:mb-[1rem] leading-[1.75rem] sm:leading-[2rem] text-[1.25rem] sm:text-[1.5rem] font-[600] tracking-[-.48px] text-[#2B2B2B]">
          Password Reset Successful
        </h2>
        <p className="text-[.8125rem] sm:text-[.875rem] leading-[1.5rem] text-[#667085] mb-[1.5rem]">
          Your password has been successfully reset. You can now log in with
          your new password.
        </p>
        <Button
          onClick={() => router.push("/login")}
          className="w-full justify-center"
        >
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div
      style={{
        boxShadow:
          "0 3px 2px -2px rgba(235, 80, 23, 0.06), 0 5px 3px -2px rgba(235, 80, 23, 0.02)",
      }}
      className="rounded-[1rem] max-w-[34rem] w-[95%] mx-auto bg-white p-[1.25rem_1rem] sm:p-[2.5rem_2rem]"
    >
      <h2 className="mb-[.5rem] leading-[1.75rem] sm:leading-[2rem] text-[1.25rem] sm:text-[1.5rem] font-[600] tracking-[-.48px] text-[#2B2B2B]">
        Set New Password
      </h2>
      <p className="text-[.8125rem] sm:text-[.875rem] leading-[1.5rem] text-[#667085] mb-[1.5rem] sm:mb-[2rem]">
        Your new password must be different to previously used passwords.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-y-[1rem]"
      >
        <InputField
          type="password"
          label="Password"
          placeholder="Enter password"
          error={errors.password?.message}
          {...register("password")}
        />

        <InputField
          type="password"
          label="Confirm Password"
          placeholder="Confirm password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <div className="mt-[1rem]">
          <Button loading={isSubmitting} className="w-full justify-center">
            Reset Password
          </Button>
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="text-[.875rem] font-[600] text-[#007FFF] hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function ConfirmReset() {
  return (
    <Suspense>
      <ConfirmResetInner />
    </Suspense>
  );
}
