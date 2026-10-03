/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardSideBar, DashboardHeader } from "@/components/organisms";
import { useAuthStore, useSponsorStore, useUtilsStore } from "@/store";
import { UserType } from "@/types";
import type { DashboardNavItem } from "@/types";
import { SocketProvider } from "@/providers/SocketProvider";

const sponsorNavItems: DashboardNavItem[] = [
  {
    name: "Dashboard",
    icon: "hugeicons:dashboard-square-02",
    href: "/sponsor",
  },
  {
    name: "Students",
    icon: "hugeicons:user-group-03",
    href: "/sponsor/students",
  },
  {
    name: "Giveback History",
    icon: "hugeicons:healtcare",
    href: "/sponsor/giveback",
  },
  {
    name: "Messages",
    icon: "hugeicons:messenger",
    href: "/sponsor/messages",
  },
  {
    name: "Notifications",
    icon: "hugeicons:notification-01",
    href: "/sponsor/notifications",
  },
  {
    name: "Referrals & Invites",
    icon: "hugeicons:coupon-01",
    href: "/sponsor/referrals",
  },
  {
    name: "Testimonials",
    icon: "hugeicons:star",
    href: "/sponsor/testimonials",
  },
];

export default function SponsorLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    accessToken,
    refreshToken,
    hydrated: authHydrated,
  } = useAuthStore();
  const { profile, hydrated: profileHydrated } = useSponsorStore();
  const { subscribeToPush } = useUtilsStore();

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

    // Check if user type is sponsor
    if (user.role !== UserType.SPONSOR) {
      router.replace("/login");
      return;
    }

    // Check if sponsor profile exists
    if (!profile) {
      router.replace("/login");
      return;
    }

    setIsAuthorized(true);
  }, [authHydrated, profileHydrated]);

  // Request push permission once authorized — best-effort, never blocks render
  useEffect(() => {
    if (isAuthorized) subscribeToPush();
  }, [isAuthorized]);

  // Don't render until authorized
  if (!isAuthorized) {
    return null;
  }

  return (
    <SocketProvider>
      <section className="flex h-screen bg-white overflow-hidden">
        <DashboardSideBar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          navItems={sponsorNavItems}
          portalLabel="SPONSOR PORTAL"
          showUpgrade={false}
        />

        <section className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader onMenuClick={() => setMobileMenuOpen(true)} />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </section>
      </section>
    </SocketProvider>
  );
}
