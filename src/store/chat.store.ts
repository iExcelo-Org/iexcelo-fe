import { create } from "zustand";
import type { Socket } from "socket.io-client";
import { authRequest } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { handleAxiosError, stripMarkdownPreview } from "@/utils";
import type {
  IChatStore,
  IChatMessage,
  IChatroom,
  IPresence,
  IComposeStudent,
  ChatDeliveryStatus,
} from "@/types";
import { nanoid } from "nanoid";


// ─── Module-level socket reference (not in Zustand state — non-serializable) ──
let _socket: Socket | null = null;
export const setChatSocket = (s: Socket | null) => {
  _socket = s;
};
export const getChatSocket = () => _socket;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useChatStore = create<IChatStore>()((set, get) => ({
  // ── Socket ────────────────────────────────────────────────────────────────
  isSocketConnected: false,
  setSocketConnected: (v) => set({ isSocketConnected: v }),

  // ── Chatrooms list ────────────────────────────────────────────────────────
  chatrooms: [],
  chatroomsHasMore: false,
  isLoadingChatrooms: false,
  chatroomSearchQuery: "",
  totalUnread: 0,

  fetchChatrooms: async (cursor?: string, merge?: boolean, query?: string) => {
    // Track search state so WS handlers can filter accordingly
    const activeQuery = query ?? "";
    set({
      isLoadingChatrooms: true,
      chatroomSearchQuery: cursor ? get().chatroomSearchQuery : activeQuery,
    });
    try {
      const params = new URLSearchParams({ limit: "20" });
      if (cursor) params.set("cursor", cursor);
      if (query?.trim()) params.set("query", query.trim());
      const res = await authRequest({
        method: "GET",
        url: `/chats/chatrooms?${params}`,
      });
      const { chatrooms, hasMore } = (
        res.data as { data: { chatrooms: IChatroom[]; hasMore: boolean } }
      ).data;
      set((s) => {
        if (merge && !cursor) {
          // Reconcile: update existing by ID (unread count, last message, etc.), prepend genuinely new rooms
          const existingIds = new Set(s.chatrooms.map((c) => c.id));
          const newRooms = chatrooms.filter((c) => !existingIds.has(c.id));
          const updated = s.chatrooms.map((c) => {
            const fresh = chatrooms.find((nc) => nc.id === c.id);
            return fresh ? { ...c, ...fresh } : c;
          });
          return {
            chatrooms: [...newRooms, ...updated],
            chatroomsHasMore: hasMore,
          };
        }
        return {
          chatrooms: cursor ? [...s.chatrooms, ...chatrooms] : chatrooms,
          chatroomsHasMore: hasMore,
        };
      });
    } catch (e) {
      handleAxiosError(e, "Failed to load conversations");
    } finally {
      set({ isLoadingChatrooms: false });
    }
  },

  fetchChatroomById: async (chatroomId: string) => {
    // Skip only if fully loaded (WS chatroom_created injects partial rooms without partner)
    const existing = get().chatrooms.find((c) => c.id === chatroomId);
    if (existing?.partner) return;
    try {
      const res = await authRequest({
        method: "GET",
        url: `/chats/chatrooms/${chatroomId}`,
      });
      const room = (res.data as { data: IChatroom }).data;
      set((s) => ({
        chatrooms: s.chatrooms.some((c) => c.id === room.id)
          ? s.chatrooms.map((c) => (c.id === room.id ? room : c))
          : [room, ...s.chatrooms],
      }));
    } catch {
      // silent — ChatRoom shows "..." fallback
    }
  },

  fetchTotalUnread: async () => {
    try {
      const res = await authRequest({
        method: "GET",
        url: "/chats/unread-count",
      });
      set({
        totalUnread: (res.data as { data: { count: number } }).data.count,
      });
    } catch {
      // silent
    }
  },

  // ── Messages ──────────────────────────────────────────────────────────────
  messages: {},
  messagesHasMore: {},
  isLoadingMessages: {},
  chatroomUnreadAnchor: {},

  fetchMessages: async (
    chatroomId: string,
    before?: string,
    merge?: boolean,
  ) => {
    set((s) => ({
      isLoadingMessages: { ...s.isLoadingMessages, [chatroomId]: true },
    }));
    try {
      const params = new URLSearchParams({ limit: "30" });
      if (before) params.set("before", before);
      const res = await authRequest({
        method: "GET",
        url: `/chats/chatrooms/${chatroomId}/messages?${params}`,
      });
      const { messages, hasMore } = (
        res.data as { data: { messages: IChatMessage[]; hasMore: boolean } }
      ).data;

      // Capture unread anchor from raw server data on initial load only.
      // Must happen before any local read-marking touches deliveryStatus.
      if (!before && !merge) {
        const myUserId = useAuthStore.getState().user?.id;
        const unread = myUserId
          ? messages.filter(
              (m) =>
                m.senderId !== myUserId &&
                m.senderId !== "__me__" &&
                m.deliveryStatus !== "read",
            )
          : [];
        set((s) => ({
          chatroomUnreadAnchor: {
            ...s.chatroomUnreadAnchor,
            [chatroomId]:
              unread.length > 0
                ? { id: unread[0].id, count: unread.length }
                : null,
          },
        }));
      }

      set((s) => {
        if (merge && !before) {
          // Reconcile: keep existing messages (user may have scrolled far up), merge latest 30.
          // Dedup by ID, update delivery status on existing messages, append truly new ones.
          const existing = s.messages[chatroomId] ?? [];
          const freshById = new Map(messages.map((m) => [m.id, m]));
          const updated = existing.map((m) => {
            const fresh = freshById.get(m.id);
            return fresh ? { ...m, deliveryStatus: fresh.deliveryStatus } : m;
          });
          const existingIds = new Set(existing.map((m) => m.id));
          const newMsgs = messages.filter((m) => !existingIds.has(m.id));
          // Append new messages at end (they're more recent), keep sort order
          return {
            messages: { ...s.messages, [chatroomId]: [...updated, ...newMsgs] },
            messagesHasMore: { ...s.messagesHasMore, [chatroomId]: hasMore },
          };
        }
        return {
          messages: {
            ...s.messages,
            [chatroomId]: before
              ? [...messages, ...(s.messages[chatroomId] ?? [])]
              : messages,
          },
          messagesHasMore: { ...s.messagesHasMore, [chatroomId]: hasMore },
        };
      });
    } catch (e) {
      handleAxiosError(e, "Failed to load messages");
    } finally {
      set((s) => ({
        isLoadingMessages: { ...s.isLoadingMessages, [chatroomId]: false },
      }));
    }
  },

  // ── Active chatroom ───────────────────────────────────────────────────────
  activeChatroomId: null,
  setActiveChatroomId: (id) => set({ activeChatroomId: id }),

  // ── Presence ──────────────────────────────────────────────────────────────
  presence: {},

  fetchPresence: async (userIds: string[]) => {
    if (!userIds.length) return;
    try {
      const res = await authRequest({
        method: "GET",
        url: `/chats/presence?userIds=${userIds.join(",")}`,
      });
      const rows = (
        res.data as {
          data: Array<{
            userId: string;
            isOnline: boolean;
            lastSeenAt: string | null;
          }>;
        }
      ).data;
      const presenceMap: Record<string, IPresence> = {};
      for (const row of rows) {
        presenceMap[row.userId] = {
          isOnline: row.isOnline,
          lastSeenAt: row.lastSeenAt,
        };
      }
      set((s) => ({ presence: { ...s.presence, ...presenceMap } }));
    } catch {
      // silent
    }
  },

  // ── Typing ────────────────────────────────────────────────────────────────
  typing: {},

  // ── Send ──────────────────────────────────────────────────────────────────
  isSending: false,

  sendMessage: (chatroomId: string, content: string) => {
    const socket = getChatSocket();
    if (!socket) return;
    const tempId = nanoid();

    // Optimistic bubble — appended immediately
    const optimistic: IChatMessage = {
      id: tempId,
      tempId,
      chatroomId,
      senderId: "__me__", // placeholder; ChatRoom replaces with real userId
      content,
      deliveryStatus: "sending", // transitions to "sent" on message_confirmed
      createdAt: new Date().toISOString(),
    };
    set((s) => ({
      messages: {
        ...s.messages,
        [chatroomId]: [...(s.messages[chatroomId] ?? []), optimistic],
      },
    }));

    socket.emit("send_message", { chatroomId, content, tempId });
  },

  // ── Flag ──────────────────────────────────────────────────────────────────
  isFlagging: false,

  flagMessage: async (
    messageId: string,
    chatroomId: string,
    reason?: string,
  ) => {
    set({ isFlagging: true });
    try {
      await authRequest({
        method: "POST",
        url: `/chats/messages/${messageId}/flag`,
        data: { reason },
      });
      // Update local message state
      set((s) => ({
        messages: {
          ...s.messages,
          [chatroomId]: (s.messages[chatroomId] ?? []).map((m) =>
            m.id === messageId
              ? { ...m, isFlagged: true, flagReason: reason ?? null }
              : m,
          ),
        },
      }));
    } catch (e) {
      handleAxiosError(e, "Failed to flag message");
    } finally {
      set({ isFlagging: false });
    }
  },

  clearChatroomUnreadAnchor: (chatroomId: string) => {
    set((s) => ({
      chatroomUnreadAnchor: { ...s.chatroomUnreadAnchor, [chatroomId]: null },
    }));
  },

  clearChatroomData: (chatroomId: string) => {
    set((s) => ({
      messages: { ...s.messages, [chatroomId]: [] },
      chatroomUnreadAnchor: { ...s.chatroomUnreadAnchor, [chatroomId]: null },
    }));
  },

  // ── Read receipt ──────────────────────────────────────────────────────────
  // Debounce is in the component; store handles ack + 1 retry on 5s timeout.
  emitMessagesRead: (chatroomId: string) => {
    const socket = getChatSocket();
    if (!socket?.connected) return;

    // Optimistically clear unread count + mark partner messages as read locally.
    // SocketProvider filters out our own messages_read event (used only for sender ticks),
    // so we must update delivery statuses ourselves here.
    const myUserId = useAuthStore.getState().user?.id;
    set((s) => {
      const room = s.chatrooms.find((c) => c.id === chatroomId);
      return {
        chatrooms: s.chatrooms.map((c) =>
          c.id === chatroomId ? { ...c, unreadCount: 0 } : c,
        ),
        totalUnread: Math.max(0, s.totalUnread - (room?.unreadCount ?? 0)),
        messages: {
          ...s.messages,
          [chatroomId]: (s.messages[chatroomId] ?? []).map((m) =>
            m.senderId !== myUserId &&
            m.senderId !== "__me__" &&
            m.deliveryStatus !== "read"
              ? { ...m, deliveryStatus: "read" as ChatDeliveryStatus }
              : m,
          ),
        },
      };
    });

    let attempts = 0;
    const tryEmit = () => {
      attempts++;
      const timeoutId = setTimeout(() => {
        if (attempts < 2) tryEmit(); // retry once after 5s with no ack
      }, 5000);
      socket.emit("messages_read", { chatroomId }, () => {
        clearTimeout(timeoutId);
      });
    };
    tryEmit();
  },

  // ── Retry failed message ──────────────────────────────────────────────────
  retryMessage: (chatroomId: string, tempId: string, content: string) => {
    // Remove the failed bubble first
    set((s) => ({
      messages: {
        ...s.messages,
        [chatroomId]: (s.messages[chatroomId] ?? []).filter(
          (m) => !(m.tempId === tempId && m.failed),
        ),
      },
    }));
    // Re-send as a fresh optimistic message
    get().sendMessage(chatroomId, content);
  },

  // ── Typing emit ───────────────────────────────────────────────────────────
  emitTypingStart: (chatroomId: string) => {
    getChatSocket()?.emit("typing_start", { chatroomId });
  },
  emitTypingStop: (chatroomId: string) => {
    getChatSocket()?.emit("typing_stop", { chatroomId });
  },

  // ── Join / leave chatroom room ────────────────────────────────────────────
  joinChatroom: (chatroomId: string) => {
    getChatSocket()?.emit("join_chatroom", { chatroomId });
  },
  leaveChatroom: (chatroomId: string) => {
    getChatSocket()?.emit("leave_chatroom", { chatroomId });
  },

  // ── Compose modal (sponsor) ───────────────────────────────────────────────
  composeStudents: [],
  isLoadingComposeStudents: false,

  searchSponsorStudents: async (query?: string) => {
    set({ isLoadingComposeStudents: true });
    try {
      const params = query ? `?query=${encodeURIComponent(query)}` : "";
      const res = await authRequest({
        method: "GET",
        url: `/chats/sponsor/students${params}`,
      });
      set({ composeStudents: (res.data as { data: IComposeStudent[] }).data });
    } catch {
      // silent
    } finally {
      set({ isLoadingComposeStudents: false });
    }
  },

  // ── User search (student compose) ─────────────────────────────────────────
  composeSearchResults: [],
  isSearchingUsers: false,

  searchUsersByEmail: async (email: string) => {
    if (email.length < 3) {
      set({ composeSearchResults: [] });
      return;
    }
    set({ isSearchingUsers: true });
    try {
      const res = await authRequest({
        method: "GET",
        url: `/chats/users/search?email=${encodeURIComponent(email)}`,
      });
      set({
        composeSearchResults: (res.data as { data: IComposeStudent[] }).data,
      });
    } catch {
      set({ composeSearchResults: [] });
    } finally {
      set({ isSearchingUsers: false });
    }
  },

  // ── Create chatroom ───────────────────────────────────────────────────────
  isCreatingChatroom: false,

  createChatroom: async (studentUserIds, initialMessage, callback) => {
    set({ isCreatingChatroom: true });
    try {
      const res = await authRequest({
        method: "POST",
        url: "/chats/chatrooms",
        data: { studentUserIds, initialMessage },
      });
      const results = (
        res.data as {
          data: Array<{ chatroomId: string; studentUserId: string }>;
        }
      ).data;
      // Refresh chatrooms list
      await get().fetchChatrooms();
      callback?.(results[0]?.chatroomId);
    } catch (e) {
      handleAxiosError(e, "Failed to start conversation");
    } finally {
      set({ isCreatingChatroom: false });
    }
  },

  // ── WS event handlers (called by SocketProvider) ─────────────────────────

  onNewMessage: (msg: IChatMessage) => {
    set((s) => ({
      messages: {
        ...s.messages,
        [msg.chatroomId]: [...(s.messages[msg.chatroomId] ?? []), msg],
      },
    }));
  },

  onNewMessageNotification: (chatroomId, preview, _senderId, createdAt) => {
    const cleanPreview = stripMarkdownPreview(preview);

    set((s) => {
      // Only touch rooms that are currently loaded
      const inList = s.chatrooms.some((c) => c.id === chatroomId);
      if (!inList) return { totalUnread: s.totalUnread + 1 };

      const updated = s.chatrooms.map((c) =>
        c.id === chatroomId
          ? {
              ...c,
              unreadCount: c.unreadCount + 1,
              lastMessage: c.lastMessage
                ? { ...c.lastMessage, content: cleanPreview, createdAt }
                : null,
            }
          : c,
      );

      // Only bubble to top when not searching (search results keep their order)
      if (s.chatroomSearchQuery) {
        return { chatrooms: updated, totalUnread: s.totalUnread + 1 };
      }

      const room = updated.find((c) => c.id === chatroomId);
      return {
        chatrooms: room
          ? [room, ...updated.filter((c) => c.id !== chatroomId)]
          : updated,
        totalUnread: s.totalUnread + 1,
      };
    });
  },

  onMessageConfirmed: (tempId: string, message: IChatMessage) => {
    set((s) => ({
      messages: {
        ...s.messages,
        [message.chatroomId]: (s.messages[message.chatroomId] ?? []).map((m) =>
          m.tempId === tempId || m.id === tempId ? { ...message } : m,
        ),
      },
    }));
  },

  onMessageFailed: (tempId: string, chatroomId: string) => {
    set((s) => ({
      messages: {
        ...s.messages,
        [chatroomId]: (s.messages[chatroomId] ?? []).map((m) =>
          m.tempId === tempId ? { ...m, failed: true } : m,
        ),
      },
    }));
  },

  onMessageRestricted: (tempId: string, chatroomId: string) => {
    set((s) => ({
      messages: {
        ...s.messages,
        [chatroomId]: (s.messages[chatroomId] ?? []).map((m) =>
          m.tempId === tempId ? { ...m, restricted: true } : m,
        ),
      },
    }));
  },

  onMessageIdAssigned: (tempId: string, id: string, chatroomId: string) => {
    set((s) => ({
      messages: {
        ...s.messages,
        [chatroomId]: (s.messages[chatroomId] ?? []).map((m) =>
          m.tempId === tempId && m.id !== id ? { ...m, id } : m,
        ),
      },
    }));
  },

  onMessageFlagged: (
    messageId: string,
    chatroomId: string,
    flagReason: string | null,
  ) => {
    set((s) => ({
      messages: {
        ...s.messages,
        [chatroomId]: (s.messages[chatroomId] ?? []).map((m) =>
          m.id === messageId ? { ...m, isFlagged: true, flagReason } : m,
        ),
      },
    }));
  },

  onTyping: (userId: string, chatroomId: string, typing: boolean) => {
    set((s) => {
      const current = s.typing[chatroomId] ?? [];
      return {
        typing: {
          ...s.typing,
          [chatroomId]: typing
            ? current.includes(userId)
              ? current
              : [...current, userId]
            : current.filter((id) => id !== userId),
        },
      };
    });
  },

  onPresenceUpdate: (
    userId: string,
    isOnline: boolean,
    lastSeenAt: string | null,
  ) => {
    set((s) => ({
      presence: {
        ...s.presence,
        [userId]: { isOnline, lastSeenAt },
      },
    }));
  },

  onChatroomCreated: (chatroom: IChatroom, message: IChatMessage | null) => {
    set((s) => {
      const exists = s.chatrooms.some((c) => c.id === chatroom.id);
      if (exists) return s;
      // Don't inject new rooms into a filtered search result list
      if (s.chatroomSearchQuery) return s;
      const newRoom: IChatroom = {
        ...chatroom,
        unreadCount: message ? 1 : 0,
        lastMessage: message
          ? {
              id: message.id,
              content: stripMarkdownPreview(message.content),
              createdAt: message.createdAt,
              senderId: message.senderId,
            }
          : null,
      };
      return { chatrooms: [newRoom, ...s.chatrooms] };
    });
  },

  onMessagesRead: (chatroomId: string, _userId: string, readAt: string) => {
    // Update delivery status for messages in this chatroom that were sent before readAt
    // (only marks messages from the current user — SocketProvider passes myUserId for filtering)
    set((s) => ({
      messages: {
        ...s.messages,
        [chatroomId]: (s.messages[chatroomId] ?? []).map((m) =>
          new Date(m.createdAt) <= new Date(readAt) &&
          m.deliveryStatus !== "read"
            ? { ...m, deliveryStatus: "read" as ChatDeliveryStatus }
            : m,
        ),
      },
    }));
  },
}));
