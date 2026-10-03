"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useAuthStore, useStudentStore, useAffiliateStore } from "@/store";
import { useNotificationStore } from "@/store/notification.store";
import { ProfileDropdown } from "./ProfileDropdown";
import { ExamTypeSelectModal } from "./student-dashboard";
import type { INotification } from "@/types";
import { cn } from "@/lib/utils";
import { relativeTime, notifIcon } from "@/utils";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

// ─── Notification panel ───────────────────────────────────────────────────────

function NotificationPanel({
  onClose,
  notifPageUrl,
}: {
  onClose: () => void;
  notifPageUrl: string;
}) {
  const {
    recentNotifications,
    unreadCount,
    isLoadingRecent,
    markRead,
    markAllRead,
    isMarkingRead,
  } = useNotificationStore();
  const router = useRouter();

  const handleClick = async (notif: INotification) => {
    if (!notif.isRead) await markRead(notif.id);
    onClose();
    router.push(notif.url);
  };

  return (
    <div
      className="absolute right-0 top-full mt-2 w-[22rem] rounded-[.875rem] bg-white shadow-xl border border-[#EDEDED] z-50 overflow-hidden"
      style={{
        boxShadow: "0 8px 32px 0 rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#EDEDED]">
        <span className="font-[600] flex items-center gap-2 text-[.9375rem] text-[#171717]">
          Notifications
          {unreadCount > 0 && (
            <span className="flex items-center justify-center bg-[#E32E89] text-white text-[.625rem] font-[600] rounded-full w-5 h-5">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </span>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            disabled={isMarkingRead}
            className="text-[.75rem] text-[#007FFF] font-[500] hover:underline disabled:opacity-50"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[26rem] overflow-y-auto divide-y divide-[#F5F5F5]">
        {isLoadingRecent ? (
          <div className="flex items-center justify-center py-10">
            <Icon
              icon="svg-spinners:ring-resize"
              className="w-8 h-8 text-[#007FFF]"
            />
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="py-10 text-center text-[#A3A3A3] text-[.875rem]">
            No notifications yet
          </div>
        ) : (
          recentNotifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={cn(
                "w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-[#FAFAFA] transition-colors",
                !n.isRead && "bg-[#F0F8FF]",
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                  !n.isRead
                    ? "bg-[#DBEDFF] text-[#007FFF]"
                    : "bg-[#F5F5F5] text-[#A3A3A3]",
                )}
              >
                <Icon icon={notifIcon(n.type)} className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-[.8125rem] leading-5",
                    !n.isRead
                      ? "font-[600] text-[#171717]"
                      : "font-[400] text-[#2B2B2B]",
                  )}
                >
                  {n.title}
                </p>
                <p className="text-[.75rem] text-[#757575] leading-4 truncate mt-0.5">
                  {n.body}
                </p>
                <p className="text-[.6875rem] text-[#A3A3A3] mt-1">
                  {relativeTime(n.createdAt)}
                </p>
              </div>
              {!n.isRead && (
                <span className="w-2 h-2 rounded-full bg-[#007FFF] flex-shrink-0 mt-1.5" />
              )}
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#EDEDED] px-4 py-2.5">
        <Link
          href={notifPageUrl}
          onClick={onClose}
          className="text-[.8125rem] text-[#007FFF] font-[500] hover:underline block text-center"
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { lastExamTypeId, switchExamType, dashboardData, profile } =
    useStudentStore();
  const { earningsByCurrency, selectedCurrency, setSelectedCurrency } =
    useAffiliateStore();
  const { unreadCount, fetchRecentNotifications } = useNotificationStore();

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const isStudent = user?.role === "student";
  const isAffiliate = user?.role === "affiliate";
  const isSponsored = isStudent && (profile?.isSponsored ?? false);
  const currentExamIsPaid = dashboardData?.currentExamType?.isPaid ?? true;
  const showUpgradeButton = isStudent && !currentExamIsPaid && !isSponsored;
  const isFirstTimePremium = !!dashboardData?.flags?.showGoPremiumModal;

  const name = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "";
  const email = user?.email || "";
  const initials = user?.firstName ? user.firstName[0] : "";
  const picture = user?.picture ?? null;
  const notifPageUrl =
    user?.role === "sponsor"
      ? "/sponsor/notifications"
      : user?.role === "student"
        ? "/student/notifications"
        : "/notifications";

  // Close panel on outside click
  useEffect(() => {
    if (!showNotifPanel) return;
    const handle = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowNotifPanel(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [showNotifPanel]);

  const handleBellClick = () => {
    if (!showNotifPanel) fetchRecentNotifications();
    setShowNotifPanel((v) => !v);
  };

  return (
    <>
      <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden text-gray-600">
            <Icon icon="hugeicons:menu-02" className="w-6 h-6" />
          </button>
          <button className="text-gray-500 hover:text-gray-700">
            <Icon icon="hugeicons:search-01" className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          {isSponsored ? (
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full bg-gray-50 text-gray-400 cursor-default select-none">
              <Icon icon="hugeicons:shield-01" className="w-4 h-4" />
              <span className="text-sm font-medium">Sponsored</span>
            </div>
          ) : showUpgradeButton ? (
            <button
              onClick={() => {
                if (isFirstTimePremium) {
                  setShowUpgradeModal(true);
                } else {
                  router.push(
                    `/student/upgrade?examTypeId=${dashboardData?.currentExamType?.id}`,
                  );
                }
              }}
              className="hidden sm:flex items-center gap-2 px-4 py-2 border border-pink-200 rounded-full text-pink-500 hover:bg-pink-50 transition-colors"
            >
              <Icon icon="hugeicons:diamond-02" className="w-4 h-4" />
              <span className="text-sm font-medium">Upgrade</span>
            </button>
          ) : null}

          {/* Bell icon + notification panel */}
          <div
            ref={bellRef}
            className="relative flex items-center justify-center"
          >
            <button
              onClick={handleBellClick}
              className="relative text-gray-500 hover:text-gray-700"
            >
              <Icon
                icon="hugeicons:notification-01"
                className="w-6 h-6"
                color="#141B34"
              />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1rem] h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            {showNotifPanel && (
              <NotificationPanel
                onClose={() => setShowNotifPanel(false)}
                notifPageUrl={notifPageUrl}
              />
            )}
          </div>

          <ProfileDropdown
            name={name}
            email={email}
            initials={initials}
            picture={picture}
            {...(isStudent && dashboardData
              ? {
                  examTypes: dashboardData.allowedExamTypes,
                  activeExamTypeId: lastExamTypeId,
                  onExamTypeChange: switchExamType,
                }
              : {})}
            {...(isAffiliate
              ? (() => {
                  const earned = earningsByCurrency.map((e) => ({
                    code: e.currency,
                    name: e.currency,
                  }));
                  const options =
                    selectedCurrency && !earned.some((c) => c.code === selectedCurrency)
                      ? [{ code: selectedCurrency, name: selectedCurrency }, ...earned]
                      : earned;
                  return options.length
                    ? {
                        currencies: options,
                        activeCurrency: selectedCurrency,
                        onCurrencyChange: setSelectedCurrency,
                      }
                    : {};
                })()
              : {})}
          />
        </div>
      </header>

      <ExamTypeSelectModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </>
  );
}
