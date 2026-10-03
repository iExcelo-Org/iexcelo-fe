import { headers } from "next/headers";
import { API_URL, API_KEY } from "@/utils";
import type { ICheckoutInfo } from "@/types";
import Upgrade from "./Upgrade";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ examTypeId?: string }>;
}

async function fetchCheckoutInfo(
  examTypeId: string,
): Promise<ICheckoutInfo | null> {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const clientIp =
      forwardedFor?.split(",")[0]?.trim() || realIp || "127.0.0.1";

    const response = await fetch(
      `${API_URL}/subscriptions/checkout-info?examTypeId=${examTypeId}`,
      {
        headers: {
          "X-API-Key": API_KEY,
          "X-Forwarded-For": clientIp,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result?.data || null;
  } catch {
    return null;
  }
}

export default async function UpgradePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const examTypeId = params.examTypeId;

  if (!examTypeId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            No Exam Type Selected
          </h1>
          <p className="text-gray-500 mb-4">
            Please select an exam type from your dashboard to upgrade.
          </p>
          <Link
            href="/student"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const checkoutInfo = await fetchCheckoutInfo(examTypeId);

  return <Upgrade examTypeId={examTypeId} checkoutInfo={checkoutInfo} />;
}
