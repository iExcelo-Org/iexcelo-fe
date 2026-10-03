"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import { Icon } from "@iconify/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSponsorStore, useAuthStore } from "@/store";
import { Button } from "@/components/atoms";

const VerifyGivebackInner = () => {
  const { accessToken } = useAuthStore();
  const { verifyGiveback } = useSponsorStore();
  const searchParams = useSearchParams();
  const router = useRouter();

  const verifyRef = useRef(false);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [activatedCount, setActivatedCount] = useState(0);

  useEffect(() => {
    if (verifyRef.current || !accessToken) return;

    const reference =
      searchParams.get("trxref") ?? searchParams.get("reference");
    if (!reference) {
      setStatus("error");
      return;
    }

    verifyRef.current = true;

    verifyGiveback(reference, (count) => {
      setActivatedCount(count);
      setStatus("success");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 md:p-12 max-w-md w-full text-center shadow-sm">
          <div className="flex justify-center mb-6">
            <Icon
              icon="svg-spinners:ring-resize"
              className="w-16 h-16 text-blue-500"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Verifying Payment...
          </h1>
          <p className="text-gray-500">
            Please wait while we confirm your payment and activate the
            subscriptions.
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        <button
          onClick={() => router.push("/sponsor/students")}
          className="text-gray-400 hover:text-gray-600 mb-8"
        >
          <Icon icon="hugeicons:arrow-left-01" className="w-8 h-8" />
        </button>

        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-2xl p-8 md:p-12 max-w-md w-full text-center shadow-sm">
            <div className="flex justify-center mb-6">
              <Icon
                icon="line-md:close-circle-filled"
                className="w-16 h-16 text-red-500"
              />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Payment Verification Failed
            </h1>
            <p className="text-gray-500 mb-8">
              Unable to verify payment. If you were charged, please contact
              support.
            </p>

            <Button
              className="w-full mb-4 justify-center"
              onClick={() => router.push("/sponsor/students")}
            >
              Return to Students
            </Button>

            <a
              href="mailto:platform@iexcelo.com"
              className="inline-flex items-center gap-1 text-pink-500 text-sm font-medium hover:underline"
            >
              Contact Support
              <Icon icon="hugeicons:arrow-right-01" className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <button
        onClick={() => router.push("/sponsor/students")}
        className="text-gray-400 hover:text-gray-600 mb-8"
      >
        <Icon icon="hugeicons:arrow-left-01" className="w-8 h-8" />
      </button>

      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl p-8 md:p-12 max-w-md w-full text-center shadow-sm">
          <div className="flex justify-center mb-6">
            <Icon
              icon="line-md:confirm-circle-filled"
              className="w-16 h-16 text-green-500"
            />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Verified!
          </h1>
          <p className="text-gray-500 mb-8">
            {activatedCount} subscription{activatedCount !== 1 ? "s" : ""}{" "}
            activated successfully. Your students now have access.
          </p>

          <Button
            className="w-full mb-4 justify-center"
            onClick={() => router.push("/sponsor/giveback")}
          >
            View Giveback History
          </Button>

          <button
            onClick={() => router.push("/sponsor/students")}
            className="inline-flex items-center gap-1 text-pink-500 text-sm font-medium hover:underline"
          >
            View Students
            <Icon icon="hugeicons:arrow-right-01" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

function VerifyGiveback() {
  return (
    <Suspense>
      <VerifyGivebackInner />
    </Suspense>
  );
}

export default VerifyGiveback;
