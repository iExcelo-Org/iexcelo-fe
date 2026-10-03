/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { SVGClient } from "@/components/atoms";
import { useAuthStore } from "@/store";
import { UserType } from "@/types/auth";
import Link from "next/link";
import React, { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  const { hydrated, user, isAuthenticated, accessToken, refreshToken } =
    useAuthStore();
  const router = useRouter();

  // Redirect if already authenticated
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
  }, [hydrated]);

  return (
    <>
      <header className="p-[1rem] md:p-[3.75rem] absolute top-0 left-0">
        <Link href={"/"}>
          <SVGClient src="/svg/logo.svg" />
        </Link>
      </header>
      <main
        style={{
          background:
            "radial-gradient(149.9% 125.17% at 22.8% 0%, #F2E2F5 5.59%, #ECFCFF 64.15%, #FFF 100%)",
        }}
        className="min-h-[100vh] py-[5rem] flex items-center justify-center overflow-x-hidden"
      >
        {children}
      </main>
    </>
  );
};

export default AuthLayout;
