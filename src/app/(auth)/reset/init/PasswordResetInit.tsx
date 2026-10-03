"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { InputField } from "@/components/molecules";
import { Button } from "@/components/atoms";
import Link from "next/link";
import { passwordResetInitSchema, PasswordResetInitFormData } from "@/schemas";
import { useAuthStore } from "@/store";

export default function PasswordResetInit() {
  const { requestPasswordReset } = useAuthStore();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetInitFormData>({
    resolver: yupResolver(passwordResetInitSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: PasswordResetInitFormData) => {
    await requestPasswordReset(data.email, () => {
      setIsSubmitted(true);
    });
  };

  if (isSubmitted) {
    return (
      <div
        style={{
          boxShadow:
            "0 3px 2px -2px rgba(235, 80, 23, 0.06), 0 5px 3px -2px rgba(235, 80, 23, 0.02)",
        }}
        className="rounded-[1rem] max-w-[34rem] w-[95%] mx-auto bg-white p-[1.25rem_1rem] sm:p-[2.5rem_2rem]"
      >
        <h2 className="mb-[.5rem] sm:mb-[.75rem] leading-[1.75rem] sm:leading-[2rem] text-[1.25rem] sm:text-[1.5rem] font-[600] tracking-[-.48px] text-[#2B2B2B]">
          Check Your Email
        </h2>
        <p className="text-[.8125rem] sm:text-[.875rem] leading-[1.5rem] text-[#667085] mb-[1.25rem] sm:mb-[1.5rem]">
          If an account exists with the email you provided, you will receive a
          password reset link. Please check your inbox and spam folder.
        </p>
        <Link
          href="/login"
          className="text-[.875rem] font-[600] text-[#007FFF] hover:underline"
        >
          Back to Login
        </Link>
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
        Let&apos;s get you back in
      </h2>
      <p className="text-[.8125rem] sm:text-[.875rem] leading-[1.5rem] text-[#667085] mb-[1.5rem] sm:mb-[2rem]">
        We&apos;ll send a code to your email address to set up your new
        password.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-y-[1.5rem]"
      >
        <InputField
          type="email"
          label="E-mail Address"
          placeholder="Enter your e-mail address"
          error={errors.email?.message}
          {...register("email")}
        />

        <Button loading={isSubmitting} className="w-full justify-center">
          Submit
        </Button>

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
