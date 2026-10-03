import { create } from "zustand";
import { authRequest } from "@/lib/api";
import { handleAxiosError } from "@/utils";
import type { INotificationStore, INotification } from "@/types";

export const useNotificationStore = create<INotificationStore>()(
  (set) => ({
    // ── Bell panel (recent 20) ────────────────────────────────────────────────
    recentNotifications: [],
    unreadCount: 0,
    isLoadingRecent: false,

    fetchRecentNotifications: async () => {
      set({ isLoadingRecent: true });
      try {
        const res = await authRequest({
          method: "GET",
          url: "/notifications?limit=20&offset=0",
        });
        const { notifications, unreadCount } = res.data.data as {
          notifications: INotification[];
          unreadCount: number;
          total: number;
        };
        set({ recentNotifications: notifications, unreadCount });
      } catch {
        // silent — bell just stays at previous count
      } finally {
        set({ isLoadingRecent: false });
      }
    },

    // ── Full notifications page ───────────────────────────────────────────────
    notifications: [],
    notificationsTotal: 0,
    notificationsPage: 1,
    isLoadingNotifications: false,

    fetchNotifications: async (page = 1, limit = 20, merge = false) => {
      set({ isLoadingNotifications: true, notificationsPage: page });
      try {
        const offset = (page - 1) * limit;
        const res = await authRequest({
          method: "GET",
          url: `/notifications?limit=${limit}&offset=${offset}`,
        });
        const { notifications, total, unreadCount } = res.data.data as {
          notifications: INotification[];
          unreadCount: number;
          total: number;
        };
        set((s) => {
          if (merge && page === 1) {
            // Reconcile: update read status on existing entries, prepend genuinely new ones.
            // Keeps any pages the user already scrolled to — we only refresh the first page.
            const existingIds = new Set(s.notifications.map((n) => n.id));
            const freshById = new Map(notifications.map((n) => [n.id, n]));
            const updated = s.notifications.map((n) => {
              const fresh = freshById.get(n.id);
              return fresh
                ? { ...n, isRead: fresh.isRead, readAt: fresh.readAt }
                : n;
            });
            const newItems = notifications.filter(
              (n) => !existingIds.has(n.id),
            );
            return {
              notifications: [...newItems, ...updated],
              notificationsTotal: total,
              unreadCount,
            };
          }
          return {
            notifications:
              page === 1
                ? notifications
                : [...s.notifications, ...notifications],
            notificationsTotal: total,
            unreadCount,
          };
        });
      } catch (e) {
        handleAxiosError(e, "Failed to load notifications");
      } finally {
        set({ isLoadingNotifications: false });
      }
    },

    // ── Mark read ─────────────────────────────────────────────────────────────
    isMarkingRead: false,

    markRead: async (id: string) => {
      set({ isMarkingRead: true });
      try {
        await authRequest({
          method: "PATCH",
          url: `/notifications/${id}/read`,
        });
        const markFn = (n: INotification) =>
          n.id === id
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n;
        set((s) => ({
          recentNotifications: s.recentNotifications.map(markFn),
          notifications: s.notifications.map(markFn),
          unreadCount: Math.max(
            0,
            s.unreadCount -
              (s.recentNotifications.find((n) => n.id === id && !n.isRead)
                ? 1
                : 0),
          ),
        }));
      } catch {
        // silent
      } finally {
        set({ isMarkingRead: false });
      }
    },

    markAllRead: async () => {
      set({ isMarkingRead: true });
      try {
        await authRequest({ method: "PATCH", url: "/notifications/read-all" });
        const now = new Date().toISOString();
        const markAll = (n: INotification) => ({
          ...n,
          isRead: true,
          readAt: now,
        });
        set((s) => ({
          recentNotifications: s.recentNotifications.map(markAll),
          notifications: s.notifications.map(markAll),
          unreadCount: 0,
        }));
      } catch {
        // silent
      } finally {
        set({ isMarkingRead: false });
      }
    },

    // ── WS event handlers ─────────────────────────────────────────────────────

    onNotificationCreated: (notification: INotification) => {
      set((s) => ({
        // Prepend to bell panel, keep max 20
        recentNotifications: [notification, ...s.recentNotifications].slice(
          0,
          20,
        ),
        // Prepend to full list too (if loaded)
        notifications: s.notifications.length
          ? [notification, ...s.notifications]
          : s.notifications,
        unreadCount: s.unreadCount + 1,
      }));
    },

    onNotificationsMarkedRead: (ids: string[]) => {
      const idSet = new Set(ids);
      const markFn = (n: INotification) =>
        idSet.has(n.id)
          ? { ...n, isRead: true, readAt: new Date().toISOString() }
          : n;
      set((s) => {
        const prevUnread = s.recentNotifications.filter(
          (n) => idSet.has(n.id) && !n.isRead,
        ).length;
        return {
          recentNotifications: s.recentNotifications.map(markFn),
          notifications: s.notifications.map(markFn),
          unreadCount: Math.max(0, s.unreadCount - prevUnread),
        };
      });
    },
  }),
);
