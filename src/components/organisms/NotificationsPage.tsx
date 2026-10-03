"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/atoms";
import { useNotificationStore } from "@/store/notification.store";
import { cn } from "@/lib/utils";
import type { INotification } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toUTC(iso: string): Date {
  return new Date(/Z$|[+-]\d{2}:\d{2}$/.test(iso) ? iso : iso + "Z");
}

function relativeTime(iso: string): string {
  const diff = Date.now() - toUTC(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function notifIcon(type: INotification["type"]): string {
  switch (type) {
    case "new_message":
      return "hugeicons:bubble-chat-notification";
    case "new_chatroom":
      return "hugeicons:messenger";
    case "giveback_activated":
      return "hugeicons:healtcare";
    case "subscription_expiring":
    case "subscription_expired":
      return "hugeicons:wallet-01";
    case "exam_result":
      return "hugeicons:book-open-02";
    default:
      return "hugeicons:notification-01";
  }
}

function notifIconColor(type: INotification["type"]): string {
  switch (type) {
    case "new_message":
    case "new_chatroom":
      return "bg-[#DBEDFF] text-[#007FFF]";
    case "giveback_activated":
      return "bg-[#DCFCE7] text-[#099137]";
    case "subscription_expiring":
    case "subscription_expired":
      return "bg-[#FEF3F2] text-[#D42620]";
    case "exam_result":
      return "bg-[#FFF5FA] text-[#A12161]";
    default:
      return "bg-[#F0F0F0] text-[#757575]";
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 sm:gap-4 animate-pulse">
      {/* matches w-9 h-9 sm:w-10 sm:h-10 + mt-0.5 on real icon */}
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {/* title row: text-[.875rem] leading-snug ≈ 19px → h-5; timestamp text-[.6875rem] → h-3 */}
        <div className="flex items-start justify-between gap-2">
          <div className="h-5 w-40 sm:w-48 bg-gray-200 rounded" />
          <div className="h-3 w-10 sm:w-14 bg-gray-100 rounded flex-shrink-0 mt-1" />
        </div>
        {/* body: leading-5 (20px) per line, mt-0.5 from real <p> */}
        <div className="h-5 w-full bg-gray-100 rounded mt-0.5" />
        <div className="h-5 w-3/5 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

// ─── Notification row ─────────────────────────────────────────────────────────

function NotificationRow({
  notification,
  onMark,
}: {
  notification: INotification;
  onMark: (id: string) => void;
}) {
  const router = useRouter();

  const handleClick = () => {
    if (!notification.isRead) onMark(notification.id);
    router.push(notification.url);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full text-left flex items-start gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 transition-colors",
        !notification.isRead
          ? "bg-[#F5F9FF] hover:bg-[#EBF4FF]"
          : "bg-white hover:bg-[#FAFAFA]",
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
          !notification.isRead
            ? notifIconColor(notification.type)
            : "bg-[#F0F0F0] text-[#A3A3A3]",
        )}
      >
        <Icon icon={notifIcon(notification.type)} className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-[.875rem] sm:text-[.9375rem] leading-snug",
              !notification.isRead
                ? "font-[600] text-[#171717]"
                : "font-[400] text-[#2B2B2B]",
            )}
          >
            {notification.title}
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
            <span className="text-[.6875rem] sm:text-[.75rem] text-[#A3A3A3] whitespace-nowrap">
              {relativeTime(notification.createdAt)}
            </span>
            {!notification.isRead && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#007FFF] flex-shrink-0" />
            )}
          </div>
        </div>
        <p className="text-[.8125rem] sm:text-[.875rem] text-[#757575] leading-5 mt-0.5 text-left">
          {notification.body}
        </p>
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function NotificationsPage() {
  const {
    notifications,
    notificationsTotal,
    notificationsPage,
    isLoadingNotifications,
    unreadCount,
    isMarkingRead,
    fetchNotifications,
    markRead,
    markAllRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasMore = notifications.length < notificationsTotal;

  const handleLoadMore = () => {
    fetchNotifications(notificationsPage + 1);
  };

  return (
    <section className="px-[.875rem] sm:px-[1.25rem] xl:px-[2rem] py-[1.25rem] mx-auto">
      {/* Page header */}
      <div className="flex mb-6 sm:mb-8 items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="flex items-center justify-center bg-[#E32E89] text-white text-[.6875rem] font-[600] rounded-full min-w-[1.375rem] h-[1.375rem] px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-[.8125rem] sm:text-sm mt-1">
            Your activity feed from iExcelo
          </p>
        </div>

        {unreadCount > 0 && (
          <>
            {/* Mobile: compact icon button */}
            <button
              onClick={markAllRead}
              disabled={isMarkingRead}
              aria-label="Mark all as read"
              className="sm:hidden shrink-0 w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-[#007FFF] hover:bg-gray-50 transition-colors mt-0.5 disabled:opacity-50"
            >
              {isMarkingRead ? (
                <Icon icon="svg-spinners:ring-resize" className="w-4 h-4" />
              ) : (
                <Icon icon="hugeicons:tick-double-02" className="w-4 h-4" />
              )}
            </button>
            {/* sm+: full labelled button */}
            <div className="hidden sm:flex shrink-0">
              <Button variant="outlined" onClick={markAllRead} loading={isMarkingRead}>
                <Icon icon="hugeicons:tick-double-02" className="w-4 h-4" />
                Mark all as read
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Content card */}
      <div
        className="bg-white rounded-[.75rem] overflow-hidden"
        style={{
          boxShadow:
            "0px 5px 22px 0px rgba(0,0,0,0.04), 0px 0px 0px 1px rgba(0,0,0,0.06)",
        }}
      >
        {/* Unread strip — only shown when there are unread items */}
        {unreadCount > 0 && (
          <div className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#F0F7FF] border-b border-[#DBEDFF] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#007FFF] flex-shrink-0" />
            <span className="text-[.75rem] sm:text-[.8125rem] text-[#007FFF] font-[500]">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* List */}
        <div className="flex flex-col divide-y divide-[#F5F5F5]">
          {isLoadingNotifications && notifications.length === 0 ? (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="px-4 sm:px-6 py-3 sm:py-4">
                  <NotificationSkeleton />
                </div>
              ))}
            </>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center py-14 sm:py-16 gap-3 text-[#A3A3A3]">
              <div className="w-14 h-14 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                <Icon icon="hugeicons:notification-01" className="w-7 h-7" />
              </div>
              <div className="text-center">
                <p className="text-[.9375rem] font-[500] text-[#757575]">All caught up!</p>
                <p className="text-[.8125rem] sm:text-[.875rem] text-[#A3A3A3] mt-1">
                  You have no notifications right now.
                </p>
              </div>
            </div>
          ) : (
            <>
              {notifications.map((n) => (
                <NotificationRow key={n.id} notification={n} onMark={markRead} />
              ))}

              {hasMore && (
                <div className="flex justify-center px-4 sm:px-6 py-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingNotifications}
                    className="text-[.8125rem] sm:text-[.875rem] text-[#007FFF] font-[500] hover:underline disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoadingNotifications ? (
                      <>
                        <Icon icon="svg-spinners:ring-resize" className="w-4 h-4" />
                        Loading...
                      </>
                    ) : (
                      `Load more (${notificationsTotal - notifications.length} remaining)`
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
