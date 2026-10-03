/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardSideBar, DashboardHeader } from "@/components/organisms";
import { useAuthStore, useAffiliateStore } from "@/store";
import { UserType } from "@/types";
import type { DashboardNavItem } from "@/types";

const affiliateNavItems: DashboardNavItem[] = [
  {
    name: "Dashboard",
    icon: "hugeicons:dashboard-square-02",
    href: "/affiliates",
  },
  {
    name: "Students",
    icon: "hugeicons:user-group-03",
    href: "/affiliates/students",
  },
  {
    name: "Commissions",
    icon: "hugeicons:invoice-01",
    href: "/affiliates/commissions",
  },
  {
    name: "Earnings",
    icon: "hugeicons:money-03",
    href: "/affiliates/earnings",
  },
  {
    name: "Affiliate Links",
    icon: "hugeicons:link-01",
    href: "/affiliates/links",
  },
];

export default function AffiliateLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    accessToken,
    refreshToken,
    hydrated: authHydrated,
  } = useAuthStore();
  const {
    profile,
    hydrated: profileHydrated,
    fetchCurrencies,
    fetchEarningsByCurrency,
  } = useAffiliateStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Auth protection - wait for both stores to hydrate
  useEffect(() => {
    if (!authHydrated || !profileHydrated) return;

    // Check authentication
    if (!isAuthenticated || !accessToken || !refreshToken || !user) {
      router.replace("/login");
      return;
    }

    // Check if user type is affiliate
    if (user.role !== UserType.AFFILIATE) {
      router.replace("/login");
      return;
    }

    // Check if affiliate profile exists
    if (!profile) {
      router.replace("/login");
      return;
    }

    setIsAuthorized(true);
  }, [authHydrated, profileHydrated]);

  // Fetch currency data once authorized
  useEffect(() => {
    if (!isAuthorized) return;
    fetchCurrencies();
    fetchEarningsByCurrency();
  }, [isAuthorized]);

  // Don't render until authorized
  if (!isAuthorized) {
    return null;
  }

  return (
    <section className="flex h-screen bg-white">
      <DashboardSideBar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navItems={affiliateNavItems}
        portalLabel="AFFILIATE PORTAL"
        showUpgrade={false}
      />

      <section className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto">{children}</main>
      </section>
    </section>
  );
}
