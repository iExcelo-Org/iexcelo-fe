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
    href: "/student/settings/account",
    icon: "hugeicons:user-circle",
  },
  {
    label: "Notifications",
    href: "/student/settings/notification",
    icon: "hugeicons:notification-01",
  },
  {
    label: "Password & Security",
    href: "/student/settings/password",
    icon: "hugeicons:lock-key",
  },
  {
    label: "Billing",
    href: "/student/settings/billing",
    icon: "hugeicons:credit-card",
  },
  {
    label: "Payout Accounts",
    href: "/student/settings/payouts",
    icon: "hugeicons:bank",
  },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <section className="xl:px-[2rem] w-full px-[.875rem] py-[1.25rem] mx-auto overflow-x-clip">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-[1.125rem] sm:text-[1.5rem] font-[600] leading-[1.5rem] sm:leading-[2rem] text-[#101828]">
          Settings
        </h1>
        <p className="text-[.8125rem] sm:text-[.875rem] text-[#667085] mt-[.25rem]">
          Manage your account preferences and settings
        </p>
      </div>

      {/* Mobile tab strip — stacks above content below md */}
      <div className="md:hidden w-[100vw] overflow-x-auto pb-1.5 mb-4 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        <div className="flex gap-1.5 w-max">
          {settingsNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-[.4375rem] rounded-full text-[.8125rem] font-[500] whitespace-nowrap border transition-colors",
                  isActive
                    ? "bg-[#007FFF] text-white border-[#007FFF]"
                    : "bg-white text-[#344054] border-[#D0D5DD]",
                )}
              >
                <Icon icon={item.icon} className="w-3.5 h-3.5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="md:flex md:gap-6 md:items-start">
        {/* Left nav — desktop only */}
        <div className="hidden md:block w-[220px] shrink-0 sticky top-4 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-[.75rem] [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.12)_transparent] [&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/10 [&::-webkit-scrollbar-thumb]:rounded-full">
          <aside
            style={{ boxShadow: CARD_SHADOW }}
            className="flex flex-col rounded-[.75rem] bg-white overflow-hidden"
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
        </div>

        {/* Page content */}
        <div className="w-full md:flex-1 md:min-w-0 md:shrink-0">{children}</div>
      </div>
    </section>
  );
}
