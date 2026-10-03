"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { CARD_SHADOW } from "@/utils";

const settingsNavItems = [
  {
    label: "Account",
    href: "/affiliates/settings/account",
    icon: "hugeicons:user-circle",
  },
  {
    label: "Notifications",
    href: "/affiliates/settings/notification",
    icon: "hugeicons:notification-01",
  },
  {
    label: "Password & Security",
    href: "/affiliates/settings/password",
    icon: "hugeicons:lock-key",
  },
  {
    label: "Payout Accounts",
    href: "/affiliates/settings/payouts",
    icon: "hugeicons:bank",
  },
];

export default function AffiliateSettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
      <div className="mb-6">
        <h1 className="text-[1.5rem] font-[600] leading-[2rem] text-[#101828]">
          Settings
        </h1>
        <p className="text-[.875rem] text-[#667085] mt-[.25rem]">
          Manage your account preferences and settings
        </p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Left nav */}
        <aside
          style={{ boxShadow: CARD_SHADOW }}
          className="hidden md:flex flex-col w-[220px] shrink-0 rounded-[.75rem] bg-white overflow-hidden"
        >
          {settingsNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-[1rem] py-[.875rem] text-[.875rem] font-[500] transition-colors border-b border-[#F2F4F7] last:border-b-0",
                  isActive
                    ? "text-[#007FFF] bg-[#EFF8FF]"
                    : "text-[#344054] hover:bg-[#F9FAFB]",
                )}
              >
                <Icon
                  icon={item.icon}
                  className={cn(
                    "w-[1.125rem] h-[1.125rem] shrink-0",
                    isActive ? "text-[#007FFF]" : "text-[#667085]",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </aside>

        {/* Mobile tab strip */}
        <div className="md:hidden flex gap-1 overflow-x-auto pb-1 mb-4 w-full">
          {settingsNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full text-[.8125rem] font-[500] whitespace-nowrap border transition-colors",
                  isActive
                    ? "bg-[#007FFF] text-white border-[#007FFF]"
                    : "bg-white text-[#344054] border-[#D0D5DD]",
                )}
              >
                <Icon icon={item.icon} className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Page content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </section>
  );
}
