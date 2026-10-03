"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { SVGClient } from "@/components/atoms";
import { ExamTypeSelectModal } from "./student-dashboard";
import type { DashboardNavItem } from "@/types";

// Accordion component for nested navigation
function AccordionNavItem({
  item,
  pathname,
  onClose,
}: {
  item: DashboardNavItem;
  pathname: string;
  onClose: () => void;
}) {
  const [isOpen, setIsOpen] = useState(
    item.children?.some((child) => pathname.startsWith(child.href)) ?? false,
  );

  const hasActiveChild = item.children?.some((child) =>
    pathname.startsWith(child.href),
  );

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between gap-3 px-4 py-3 rounded-[.25rem] transition-all",
          hasActiveChild
            ? "bg-[#E5E8F8] text-[#007FFF] border border-[#E5E8F8]"
            : "text-white hover:bg-white/10",
        )}
      >
        <div className="flex items-center gap-3">
          <Icon icon={item.icon} className="w-5 h-5" />
          <span className="text-sm font-medium">{item.name}</span>
        </div>
        <Icon
          icon="hugeicons:arrow-up-01"
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            isOpen ? "rotate-180" : "",
          )}
        />
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 flex flex-col gap-[.25rem]">
          {item.children?.map((child) => {
            const isChildActive = pathname.startsWith(child.href);
            return (
              <Link
                key={child.name}
                href={child.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-[.25rem] transition-all text-sm",
                  isChildActive
                    ? "bg-[#E5E8F8] text-[#007FFF] border border-[#E5E8F8]"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon icon={child.icon} className="w-4 h-4" />
                <span className="font-medium">{child.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

const defaultStudentNavItems: DashboardNavItem[] = [
  {
    name: "Dashboard",
    icon: "hugeicons:dashboard-square-02",
    href: "/student",
  },
  { name: "Exams", icon: "hugeicons:book-open-02", href: "/student/exams" },
  { name: "Topics", icon: "hugeicons:book-edit", href: "/student/topics" },
  { name: "History", icon: "hugeicons:clock-02", href: "/student/history" },
  { name: "Messages", icon: "hugeicons:messenger", href: "/student/messages" },
  {
    name: "Notifications",
    icon: "hugeicons:notification-01",
    href: "/student/notifications",
  },
  {
    name: "Analytics",
    icon: "hugeicons:chart-increase",
    href: "/student/analytics",
  },
  {
    name: "Referrals & Invites",
    icon: "hugeicons:coupon-01",
    href: "/student/referrals",
  },
  {
    name: "Subscriptions",
    icon: "hugeicons:wallet-01",
    href: "/student/subscriptions",
  },
  {
    name: "Earnings",
    icon: "hugeicons:gift-card",
    href: "/student/earnings",
  },
  {
    name: "Settings",
    icon: "hugeicons:settings-01",
    href: "/student/settings",
  },
];

interface DashboardSideBarProps {
  isOpen: boolean;
  onClose: () => void;
  navItems?: DashboardNavItem[];
  portalLabel?: string;
  showUpgrade?: boolean;
  upgradeUrl?: string; // Direct upgrade URL (skips modal)
  isSponsored?: boolean;
  sponsorName?: string | null;
}

export function DashboardSideBar({
  isOpen,
  onClose,
  navItems,
  portalLabel = "STUDENT PORTAL",
  showUpgrade = true,
  upgradeUrl,
  isSponsored = false,
  sponsorName,
}: DashboardSideBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showPremium, setShowPremium] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const items = navItems ?? defaultStudentNavItems;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "flex flex-col w-[272px] bg-[#00356B] text-white z-50 transition-transform duration-300",
          "lg:relative lg:translate-x-0 lg:min-h-screen",
          "fixed left-0 top-0 bottom-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col mb-[.75rem] p-[1.5rem_1.5rem_0_1.5rem] gap-[.5rem]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-[.5rem]">
              <SVGClient src="/svg/logo.svg" />
              <p className="text-[.875rem] text-[#E5E8F8]">{portalLabel}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white lg:hidden"
            >
              <Icon icon="hugeicons:cancel-01" className="w-6 h-6" />
            </button>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-[.25rem] px-[.5rem]">
          {items.map((item) => {
            // Check if item has children (accordion)
            if (item.children && item.children.length > 0) {
              return (
                <AccordionNavItem
                  key={item.name}
                  item={item}
                  pathname={pathname}
                  onClose={onClose}
                />
              );
            }

            // Use exact match for dashboard routes, startsWith for nested routes
            const isActive =
              item.href === "/student" ||
              item.href === "/sponsor" ||
              item.href === "/affiliates" ||
              item.href === "/admin"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-[.25rem] transition-all",
                  isActive
                    ? "bg-[#E5E8F8] text-[#007FFF] border border-[#E5E8F8]"
                    : "text-white hover:bg-white/10",
                )}
              >
                <Icon icon={item.icon} className="w-5 h-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {isSponsored ? (
          <div className="mx-3 mb-6 p-4 bg-[#1A4A7A] rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Icon
                icon="hugeicons:shield-01"
                className="w-4 h-4 text-[#8AC4FF]"
              />
              <h3 className="font-semibold text-sm text-white">
                Sponsored Account
              </h3>
            </div>
            <p className="text-xs text-[#8AC4FF] leading-relaxed">
              Your subscription is managed by your sponsor
              {sponsorName ? (
                <>
                  ,{" "}
                  <span className="text-white font-medium">{sponsorName}</span>
                </>
              ) : null}
              .
            </p>
          </div>
        ) : (
          showUpgrade &&
          showPremium && (
            <div className="mx-3 mb-6 p-4 bg-[#005AB5] rounded-xl relative">
              <button
                onClick={() => setShowPremium(false)}
                className="absolute top-3 right-3 text-white/80 hover:text-white"
              >
                <Icon icon="hugeicons:cancel-01" className="w-4 h-4" />
              </button>
              <h3 className="font-semibold text-sm mb-2">Go Premium</h3>
              <p className="text-xs text-[#8AC4FF] leading-relaxed mb-3">
                Unlock full access to every past questions, smart study paths,
                designed to help you ace top-level exams
              </p>
              <div className="flex gap-3 text-xs">
                <button
                  onClick={() => setShowPremium(false)}
                  className="text-[#8AC4FF] hover:text-white"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => {
                    if (upgradeUrl) {
                      router.push(upgradeUrl);
                    } else {
                      setShowUpgradeModal(true);
                    }
                  }}
                  className="text-white font-semibold hover:underline"
                >
                  Upgrade plan
                </button>
              </div>
            </div>
          )
        )}
      </aside>
      <ExamTypeSelectModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
}
