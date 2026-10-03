"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { InputField } from "@/components/molecules";
import { Button, SVGClient } from "@/components/atoms";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/schemas";
import { LoginFormData, UserType } from "@/types";
import { useAuthStore } from "@/store";

const Login = () => {
  const router = useRouter();
  const {
    login,
    initGoogle,
    hydrated,
    isAuthenticated,
    accessToken,
    refreshToken,
    user,
  } = useAuthStore();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!hydrated) return;

    if (isAuthenticated && accessToken && refreshToken && user?.role) {
      const role = user.role as UserType;
      if (role === UserType.STUDENT) {
        router.replace("/student");
      } else if (role === UserType.SPONSOR) {
        router.replace("/sponsor");
      } else if (role === UserType.AFFILIATE) {
        router.replace("/affiliates");
      }
    }
  }, [hydrated, isAuthenticated, accessToken, refreshToken, user, router]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    await login(data, (emailVerified, role) => {
      // Check if user needs email verification (signupEmail will be set by login store method)
      if (!emailVerified) {
        router.push("/verify-email");
        return;
      }

      if (role === UserType.STUDENT) {
        router.replace("/student");
      } else if (role === UserType.SPONSOR) {
        router.replace("/sponsor");
      } else if (role === UserType.AFFILIATE) {
        router.replace("/affiliates");
      } else {
        router.replace("/");
      }
    });
  };

  const handleGoogleLogin = () => {
    initGoogle();
  };

  const inputFields = [
    {
      type: "email" as const,
      name: "email" as const,
      label: "E-mail Address",
      placeholder: "Enter your e-mail address",
    },
    {
      type: "password" as const,
      name: "password" as const,
      label: "Password",
      placeholder: "Enter password",
    },
  ];

  // TODO: Add a skeleton in coming years
  if (!hydrated) return null;

  return (
    <div>
      <div
        style={{
          boxShadow:
            "0 3px 2px -2px rgba(235, 80, 23, 0.06), 0 5px 3px -2px rgba(235, 80, 23, 0.02)",
        }}
        className="rounded-[1rem] bg-white p-[1.25rem_1rem] sm:p-[2.5rem_2rem]"
      >
        <h2 className="mb-[1.5rem] sm:mb-[2rem] leading-[1.75rem] sm:leading-[2rem] text-center text-[1.25rem] sm:text-[1.5rem] font-[600] tracking-[-.48px] text-[#2B2B2B]">
          Log in to iExcelo
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-y-[1rem]"
        >
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-[1rem] rounded-[0.375rem] border-[1.5px] border-[#D0D5DD] bg-white p-[1rem] cursor-pointer transition-all hover:bg-gray-50"
          >
            <SVGClient src="/svg/google.svg" />
            <span className="font-[600] text-[.875rem] sm:text-[1rem] leading-[1.5rem] text-[#2B2B2B]">
              Continue with Google
            </span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#F0F2F5]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-[.5rem] tracking-[1px] font-[600] uppercase text-[.875rem] leading-[1.25rem] text-[#2B2B2B]">
                OR
              </span>
            </div>
          </div>

          {inputFields.map((field) => (
            <InputField
              key={field.name}
              type={field.type}
              label={field.label}
              placeholder={field.placeholder}
              error={errors[field.name]?.message}
              {...register(field.name)}
            />
          ))}

          <div className="flex justify-end">
            <Link
              href="/reset/init"
              className="text-[.875rem] leading-[1.25rem] font-[600] text-[#E32E89] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="mt-[1rem]">
            <Button loading={isSubmitting} className="w-full justify-center">
              Sign In
            </Button>
          </div>
        </form>
      </div>
      <div className="mt-[2.5rem] mx-auto p-[1rem_1.75rem] w-fit rounded-[1.875rem] bg-white text-[.875rem] leading-[1.25rem] font-[400] text-[#454545]">
        <span>New to iExcelo? </span>
        <Link
          href="/signup"
          className="font-[600] text-[#007FFF] hover:underline"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default Login;
