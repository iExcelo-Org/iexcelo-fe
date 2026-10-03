"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AffiliateRedirect() {
  const params = useParams();
  const router = useRouter();
  const code = params?.code as string;

  useEffect(() => {
    if (code) {
      router.replace(`/signup?ref=${code}`);
    } else {
      router.replace("/signup");
    }
  }, [code, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
