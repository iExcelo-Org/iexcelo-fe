"use client";

import { useEffect } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms";
import { useCheckoutStore, useStudentStore } from "@/store";

interface SubscriptionConfirmedProps {
  sessionId?: string;
  reference?: string;
}

export default function SubscriptionConfirmed({
  sessionId,
  reference,
}: SubscriptionConfirmedProps) {
  const router = useRouter();
  const { verificationState, verifyPayment } = useCheckoutStore();
  const { fetchDashboard } = useStudentStore();

  useEffect(() => {
    verifyPayment({ sessionId, reference });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, reference]);

  // Repull dashboard once payment is confirmed so data is fresh on arrival
  useEffect(() => {
    if (verificationState === "success") {
      fetchDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationState]);

  if (verificationState === "loading" || verificationState === "idle") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 md:p-12 max-w-md w-full text-center shadow-sm">
          <div className="flex justify-center mb-6">
            <Icon
              icon="svg-spinners:ring-resize"
              className="w-16 h-16 text-blue-500 animate-spin"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Verifying Payment...
          </h1>
          <p className="text-gray-500">
            Please wait while we confirm your subscription.
          </p>
        </div>
      </div>
    );
  }

  if (verificationState === "error") {
    return (
      <div className="min-h-screen bg-gray-100 justify-center p-4 md:p-8">
        <button
          onClick={() => router.push("/student")}
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
              Unable to verify payment. Please contact support.
            </p>

            <Button
              className="w-full mb-4 justify-center"
              onClick={() => router.push("/student")}
            >
              Return to Dashboard
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
        onClick={() => router.push("/student")}
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
            Subscription Confirmed!
          </h1>
          <p className="text-gray-500 mb-8">
            You have successfully subscribed to iExcelo. Your premium access is
            now active.
          </p>

          <Button
            className="w-full mb-4 justify-center"
            onClick={() => router.push("/student")}
          >
            Continue to Dashboard
          </Button>

          <Link
            href="/student/subscriptions"
            className="inline-flex items-center gap-1 text-pink-500 text-sm font-medium hover:underline"
          >
            View Subscription Details
            <Icon icon="hugeicons:arrow-right-01" className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
