/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store";
import { Icon } from "@iconify/react";

function AuthCallbackPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { exchangeToken } = useAuthStore();

  // Could have gone the temp auth route but this prevents a senario where the token isn't stored yet and we try exchanging it
  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    void exchangeToken(token, (role) => {
      if (role === "student") {
        router.replace("/student");
      } else if (role === "sponsor") {
        router.replace("/sponsor");
      } else if (role === "affiliate") {
        router.replace("/affiliates");
      } else {
        router.replace("/login");
      }
    });
  }, []);

  return (
    <section className="flex items-center justify-center">
      <p className="md:text-[1.5rem] items-center flex gap-3 text-gray-600">
        <Icon icon={"svg-spinners:blocks-shuffle-3"} />
        Finishing sign in&hellip;
      </p>
    </section>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackPageInner />
    </Suspense>
  );
}
