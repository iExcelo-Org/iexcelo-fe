"use client";

/**
 * SocketProvider
 * ─────────────
 * Mounts once per dashboard layout (sponsor + student).
 * Connects to the /chats Socket.IO namespace, registers ALL WS listeners,
 * and delegates state updates exclusively to chat.store and notification.store.
 *
 * Components NEVER touch the socket directly.
 * All socket.emit() calls go through store methods (sendMessage, emitTypingStart, etc.)
 */

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store";
import { useChatStore, setChatSocket } from "@/store/chat.store";
import { useNotificationStore } from "@/store/notification.store";
import { WS_URL } from "@/utils";
import type { IChatMessage, IChatroom, INotification } from "@/types";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, user } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken || !user?.id) return;

    const socket = io(`${WS_URL}/chats`, {
      auth: { token: accessToken },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;
    setChatSocket(socket);

    const chatStore = useChatStore.getState();
    const notifStore = useNotificationStore.getState();

    // ── Connection lifecycle ───────────────────────────────────────────────
    let isFirstConnect = true;
    // Wall-clock time of last disconnect — used to skip reconcile on micro-blips (< 5s)
    let disconnectedAt = 0;
    const RECONCILE_THRESHOLD_MS = 5_000;

    socket.on("connect", () => {
      useChatStore.setState({ isSocketConnected: true });

      // Always re-join active chatroom on every connect — covers both:
      //   • First connect when ChatRoom mounted before the socket was ready (PWA cold-start)
      //   • Reconnects where socket rooms are lost
      const { activeChatroomId } = useChatStore.getState();
      if (activeChatroomId) {
        socket.emit("join_chatroom", { chatroomId: activeChatroomId });
      }

      if (!isFirstConnect) {
        const elapsed = Date.now() - disconnectedAt;
        const { activeChatroomId, fetchMessages, fetchChatrooms } =
          useChatStore.getState();

        // Always reconcile the active chatroom on ANY reconnect — even micro-blips.
        // Messages emitted to the chatroom room while disconnected are never re-sent
        // by the server; the only recovery is a DB fetch.
        // Also re-send messages_read in case the initial emit was dropped while offline
        // (component effect only fires on messages.length change, so no new messages = no re-fire).
        if (activeChatroomId) {
          fetchMessages(activeChatroomId, undefined, true);
          socket.emit("messages_read", { chatroomId: activeChatroomId });
        }

        // Re-fetch chatrooms list only after a meaningful gap (avoid spam on flaky net)
        if (elapsed >= RECONCILE_THRESHOLD_MS) {
          fetchChatrooms(undefined, true);
        }
      }

      isFirstConnect = false;
    });

    socket.on("disconnect", () => {
      disconnectedAt = Date.now();
      useChatStore.setState({ isSocketConnected: false });
    });

    socket.on("connection_ack", () => {
      const elapsed = Date.now() - disconnectedAt;
      const shouldReconcile =
        isFirstConnect || elapsed >= RECONCILE_THRESHOLD_MS;

      // Always re-sync lightweight counts (cheap single-number endpoints)
      chatStore.fetchTotalUnread();
      notifStore.fetchRecentNotifications();

      // Only do the heavier page-1 notifications reconcile after a meaningful gap
      if (
        shouldReconcile &&
        useNotificationStore.getState().notifications.length > 0
      ) {
        notifStore.fetchNotifications(1, 20, true);
      }
    });

    // ── Chat events ───────────────────────────────────────────────────────

    // New message broadcast from chatroom room
    socket.on("new_message", (msg: IChatMessage) => {
      useChatStore.getState().onNewMessage(msg);
    });

    // Lightweight signal for messages list page (unread badge + last preview)
    socket.on(
      "new_message_notification",
      (data: {
        chatroomId: string;
        senderId: string;
        preview: string;
        createdAt: string;
      }) => {
        useChatStore
          .getState()
          .onNewMessageNotification(
            data.chatroomId,
            data.preview,
            data.senderId,
            data.createdAt,
          );
      },
    );

    // Server confirms our optimistic message with real DB id
    socket.on(
      "message_confirmed",
      ({ tempId, message }: { tempId: string; message: IChatMessage }) => {
        useChatStore.getState().onMessageConfirmed(tempId, message);
      },
    );

    // DB write failed — mark bubble as failed
    socket.on(
      "message_failed",
      ({ tempId, chatroomId }: { tempId: string; chatroomId: string }) => {
        useChatStore.getState().onMessageFailed(tempId, chatroomId);
      },
    );

    // Content policy violation — mark bubble as restricted (no retry)
    socket.on(
      "message_restricted",
      ({ tempId, chatroomId }: { tempId: string; chatroomId: string }) => {
        useChatStore.getState().onMessageRestricted(tempId, chatroomId);
      },
    );

    // Real DB id broadcast to all chatroom participants after save —
    // recipients received the optimistic new_message with no id and need this to flag
    socket.on(
      "message_id_assigned",
      ({
        tempId,
        id,
        chatroomId,
      }: {
        tempId: string;
        id: string;
        chatroomId: string;
      }) => {
        useChatStore.getState().onMessageIdAssigned(tempId, id, chatroomId);
      },
    );

    // Flag applied — update message in both participants' views
    socket.on(
      "message_flagged",
      ({
        chatroomId,
        messageId,
        flagReason,
      }: {
        chatroomId: string;
        messageId: string;
        flagReason: string | null;
      }) => {
        useChatStore
          .getState()
          .onMessageFlagged(messageId, chatroomId, flagReason);
      },
    );

    // Typing indicator
    socket.on(
      "user_typing",
      (data: { userId: string; chatroomId: string; typing: boolean }) => {
        useChatStore
          .getState()
          .onTyping(data.userId, data.chatroomId, data.typing);
      },
    );

    // Presence update
    socket.on(
      "user_status",
      (data: {
        userId: string;
        isOnline: boolean;
        lastSeenAt: string | null;
      }) => {
        useChatStore
          .getState()
          .onPresenceUpdate(data.userId, data.isOnline, data.lastSeenAt);
      },
    );

    // New chatroom created (e.g. sponsor started a chat — student receives this)
    socket.on(
      "chatroom_created",
      (data: { chatroom: IChatroom; message: IChatMessage | null }) => {
        useChatStore.getState().onChatroomCreated(data.chatroom, data.message);
      },
    );

    // Read receipt — update delivery ticks for the sender
    socket.on(
      "messages_read",
      (data: { chatroomId: string; userId: string; readAt: string }) => {
        // Only update delivery status for messages sent by ME
        // (only the sender cares about read ticks on their own messages)
        if (data.userId !== user.id) {
          useChatStore
            .getState()
            .onMessagesRead(data.chatroomId, data.userId, data.readAt);
        }
      },
    );

    // ── Notification events ───────────────────────────────────────────────

    // New notification created — update bell count + prepend to panel
    socket.on("notification_created", (notification: INotification) => {
      useNotificationStore.getState().onNotificationCreated(notification);
    });

    // Notifications marked read (e.g. user opened chatroom → clear related notifs)
    socket.on("notifications_marked_read", ({ ids }: { ids: string[] }) => {
      useNotificationStore.getState().onNotificationsMarkedRead(ids);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      setChatSocket(null);
      socketRef.current = null;
      useChatStore.setState({ isSocketConnected: false });
    };
  }, [accessToken, user?.id]);

  return <>{children}</>;
}
