"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/atoms";
import { RichText } from "@/components/atoms";
import { InputField, Modal } from "@/components/molecules";
import { useAuthStore } from "@/store";
import { useChatStore } from "@/store/chat.store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { IChatMessage, ChatDeliveryStatus } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toUTC(iso: string): Date {
  return new Date(/Z$|[+-]\d{2}:\d{2}$/.test(iso) ? iso : iso + "Z");
}

function formatTime(iso: string): string {
  return toUTC(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDayLabel(iso: string): string {
  const date = toUTC(iso);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  return toUTC(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function groupByDay(messages: IChatMessage[]): [string, IChatMessage[]][] {
  const map = new Map<string, IChatMessage[]>();
  for (const msg of messages) {
    const label = getDayLabel(msg.createdAt);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(msg);
  }
  return Array.from(map.entries());
}

function formatLastSeen(iso: string | null): string {
  if (!iso) return "last seen recently";
  const diffMs = Date.now() - toUTC(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "last seen just now";
  if (mins < 60) return `last seen ${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `last seen ${hrs}h ago`;
  return `last seen ${toUTC(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InitialsAvatar({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const ini = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return (
    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#DBEDFF] text-[#007FFF] flex items-center justify-center text-[.5rem] sm:text-xs font-[700] flex-shrink-0 select-none">
      {ini.toUpperCase()}
    </div>
  );
}

type PresenceState = "online" | "typing" | "offline";

function PresenceLabel({
  state,
  lastSeenAt,
}: {
  state: PresenceState;
  lastSeenAt: string | null;
}) {
  if (state === "typing")
    return (
      <span className="text-[.625rem] sm:text-xs text-[#007FFF] font-[400] flex items-center! w-fit gap-1">
        <span className="flex gap-[2px]">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-[3px] h-[3px] rounded-full bg-[#007FFF] animate-bounce"
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          ))}
        </span>
        <span>Typing</span>
      </span>
    );
  if (state === "online")
    return (
      <span className="text-[.625rem] sm:text-xs text-[#099137] font-[400] leading-4 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#099137] inline-block" />
        Online
      </span>
    );
  return (
    <span className="text-[.625rem] sm:text-xs text-[#A3A3A3] font-[400] leading-4">
      {formatLastSeen(lastSeenAt)}
    </span>
  );
}

function MessageStatusIcon({
  status,
  failed,
  restricted,
}: {
  status: ChatDeliveryStatus;
  failed?: boolean;
  restricted?: boolean;
}) {
  if (restricted)
    return (
      <Icon
        icon="hugeicons:alert-circle"
        className="w-3 h-3 text-orange-400"
        aria-label="Restricted"
      />
    );
  if (failed)
    return (
      <Icon
        icon="hugeicons:alert-circle"
        className="w-3 h-3 text-red-400"
        aria-label="Failed to send"
      />
    );
  if (status === "sending")
    return (
      <Icon icon="svg-spinners:ring-resize" className="w-3 h-3 text-white/40" />
    );
  // Always render both ticks to keep the container width stable.
  // Second tick fades in on 'read' — no layout shift, no timestamp jitter.
  const isRead = status === "read";
  return (
    <span className="flex items-center">
      <Icon
        icon="hugeicons:tick-02"
        className={cn(
          "w-3 h-3 transition-colors duration-300",
          isRead ? "text-white/80" : "text-white/60",
        )}
      />
      <Icon
        icon="hugeicons:tick-02"
        className={cn(
          "w-3 h-3 -ml-[.35rem] text-white/80 transition-opacity duration-300",
          isRead ? "opacity-100" : "opacity-0",
        )}
      />
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ChatRoom({ chatroomId }: { chatroomId: string }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const myUserId = user?.id ?? "";

  const {
    chatrooms,
    messages: messagesMap,
    messagesHasMore,
    isLoadingMessages,
    presence,
    typing,
    fetchMessages,
    fetchPresence,
    fetchChatroomById,
    sendMessage,
    retryMessage,
    flagMessage,
    isFlagging,
    emitMessagesRead,
    clearChatroomUnreadAnchor,
    clearChatroomData,
    emitTypingStart,
    emitTypingStop,
    joinChatroom,
    leaveChatroom,
    setActiveChatroomId,
  } = useChatStore();

  const room = chatrooms.find((c) => c.id === chatroomId);
  const partner = room?.partner ?? null;
  const partnerName = partner
    ? `${partner.firstName} ${partner.lastName}`
    : "...";
  const partnerPresence = partner ? presence[partner.id] : null;
  const isPartnerTyping = partner
    ? (typing[chatroomId] ?? []).includes(partner.id)
    : false;
  const chatroomUnread = room?.unreadCount ?? 0;

  const presenceState: PresenceState = isPartnerTyping
    ? "typing"
    : partnerPresence?.isOnline
      ? "online"
      : "offline";

  const messages = messagesMap[chatroomId] ?? [];
  const [composing, setComposing] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [flagModal, setFlagModal] = useState<{
    messageId: string;
    reason: string;
  } | null>(null);

  const [anchor, setAnchor] = useState<{ id: string; count: number } | null>(
    null,
  );
  const anchorSetRef = useRef(false);

  // Snapshot unread anchor once on first load, then increment for new partner messages.
  // Reads via getState() to avoid stale closure — store and local state are fully decoupled.
  useEffect(() => {
    if (!messages.length) return;
    const lastMsg = messages[messages.length - 1];
    const lastMsgId = lastMsg?.tempId ?? lastMsg?.id;
    if (!anchorSetRef.current) {
      anchorSetRef.current = true;
      setAnchor(
        useChatStore.getState().chatroomUnreadAnchor[chatroomId] ?? null,
      );
      return;
    }
    if (lastMsgId === lastMsgIdRef.current) return;
    if (
      lastMsg &&
      lastMsg.senderId !== myUserId &&
      lastMsg.senderId !== "__me__"
    ) {
      setAnchor((a) => (a ? { ...a, count: a.count + 1 } : a));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [scrollPendingCount, setScrollPendingCount] = useState(0);
  const isScrolledUpRef = useRef(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialScrollDoneRef = useRef(false);
  const lastMsgIdRef = useRef<string | undefined>(undefined);

  // Typing throttle + debounce refs
  const typingThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  // Read receipt debounce
  const readDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Document title ────────────────────────────────────────────────────────

  useEffect(() => {
    if (partnerName === "...") return;
    document.title =
      chatroomUnread > 0
        ? `iExcelo - Sponsor | ${partnerName} (${chatroomUnread})`
        : `iExcelo - Sponsor | ${partnerName}`;
    return () => {
      document.title = "iExcelo - Sponsor";
    };
  }, [partnerName, chatroomUnread]);

  // ── Lifecycle ────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchMessages(chatroomId);
    joinChatroom(chatroomId);
    setActiveChatroomId(chatroomId);
    fetchChatroomById(chatroomId);

    return () => {
      leaveChatroom(chatroomId);
      setActiveChatroomId(null);
      setAnchor(null);
      anchorSetRef.current = false;
      clearChatroomData(chatroomId);
      // Stop typing if unmounting mid-compose
      if (isTypingRef.current) emitTypingStop(chatroomId);
      if (typingThrottleRef.current) clearTimeout(typingThrottleRef.current);
      if (typingStopRef.current) clearTimeout(typingStopRef.current);
      if (readDebounceRef.current) clearTimeout(readDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatroomId]);

  // Fetch partner presence once we know who the partner is (may load after chatrooms fetch)
  useEffect(() => {
    if (partner?.id) fetchPresence([partner.id]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partner?.id]);

  // Emit messages_read debounce logic:
  // - On open with unread: debounce 1.5s immediately
  // - On open without unread: wait for first new message, then debounce
  // - New message while open: always extend/start debounce
  const lastChatroomReadRef = useRef<string | null>(null);
  const initialReadDoneRef = useRef(false);

  useEffect(() => {
    if (!messages.length) return;
    // Reset on chatroom change
    if (lastChatroomReadRef.current !== chatroomId) {
      lastChatroomReadRef.current = chatroomId;
      initialReadDoneRef.current = false;
    }
    if (!initialReadDoneRef.current) {
      initialReadDoneRef.current = true;
      // On initial load: only debounce if there are unread messages
      if (!chatroomUnread) return;
    }
    // New message or initial open with unread: start/extend debounce
    if (readDebounceRef.current) clearTimeout(readDebounceRef.current);
    readDebounceRef.current = setTimeout(
      () => emitMessagesRead(chatroomId),
      1500,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, chatroomId]);

  // Scroll listener — track whether user has scrolled up
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const scrolledUp = el.scrollHeight - el.scrollTop - el.clientHeight > 120;
      if (scrolledUp !== isScrolledUpRef.current) {
        isScrolledUpRef.current = scrolledUp;
        setIsScrolledUp(scrolledUp);
        if (!scrolledUp) setScrollPendingCount(0);
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsScrolledUp(false);
    isScrolledUpRef.current = false;
    setScrollPendingCount(0);
  };

  // Scroll to bottom: always on initial load; on new message only if at bottom.
  // If scrolled up and partner sends, increment pending count for the button badge.
  useEffect(() => {
    if (!messages.length) return;
    const lastMsg = messages[messages.length - 1];
    const lastMsgId = lastMsg?.tempId ?? lastMsg?.id;
    const isAppend = lastMsgId !== lastMsgIdRef.current;
    lastMsgIdRef.current = lastMsgId;

    if (!initialScrollDoneRef.current) {
      initialScrollDoneRef.current = true;
      bottomRef.current?.scrollIntoView({
        behavior: "instant" as ScrollBehavior,
      });
      return;
    }
    if (!isAppend) return;
    if (isScrolledUpRef.current) {
      if (
        lastMsg &&
        lastMsg.senderId !== myUserId &&
        lastMsg.senderId !== "__me__"
      ) {
        setScrollPendingCount((c) => c + 1);
      }
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  // ── Typing handlers ───────────────────────────────────────────────────────

  const handleTyping = useCallback(() => {
    // Stop debounce timer reset
    if (typingStopRef.current) clearTimeout(typingStopRef.current);
    typingStopRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        emitTypingStop(chatroomId);
        isTypingRef.current = false;
      }
    }, 3000);

    // Throttle start event — fire at most once per 2s
    if (!isTypingRef.current && !typingThrottleRef.current) {
      emitTypingStart(chatroomId);
      isTypingRef.current = true;
      typingThrottleRef.current = setTimeout(() => {
        typingThrottleRef.current = null;
      }, 2000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatroomId]);

  // ── Send ──────────────────────────────────────────────────────────────────

  const isEmpty = (v: string) => !v || v === "<p></p>" || v.trim() === "";

  const handleSend = () => {
    if (isEmpty(composing)) return;
    sendMessage(chatroomId, composing);
    setComposing("");
    // Always jump to bottom when I send
    scrollToBottom();
    // Clear unread anchor — user is actively in conversation
    if (anchor) {
      setAnchor(null);
      clearChatroomUnreadAnchor(chatroomId);
    }
    // Stop typing
    if (isTypingRef.current) {
      emitTypingStop(chatroomId);
      isTypingRef.current = false;
    }
    if (typingStopRef.current) clearTimeout(typingStopRef.current);
    if (typingThrottleRef.current) clearTimeout(typingThrottleRef.current);
    typingThrottleRef.current = null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Flag ──────────────────────────────────────────────────────────────────

  const confirmFlag = async () => {
    if (!flagModal) return;
    await flagMessage(
      flagModal.messageId,
      chatroomId,
      flagModal.reason || undefined,
    );
    setFlagModal(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const grouped = groupByDay(messages);

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 px-3 sm:px-5 md:px-6 py-2 sm:py-3 md:py-4 border-b border-[#EDEDED] bg-white flex-shrink-0">
        <button
          onClick={() => router.push("/sponsor/messages")}
          className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-[#757575] hover:text-[#2B2B2B] hover:bg-[#F5F5F5] transition-colors flex-shrink-0"
        >
          <Icon icon="hugeicons:arrow-left-02" className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <InitialsAvatar name={partnerName} />

        <div className="flex-1 min-w-0 flex flex-col gap-[.0625rem] sm:gap-0.5">
          <h2 className="font-[600] text-[.875rem] sm:text-[.9375rem] md:text-[1rem] text-[#171717] leading-[1.15] truncate">
            {partnerName}
          </h2>
          <PresenceLabel
            state={presenceState}
            lastSeenAt={partnerPresence?.lastSeenAt ?? null}
          />
        </div>
      </div>

      {/* ── Messages ────────────────────────────────────────────────────── */}
      <div className="relative flex-1 min-h-0">
        {/* Scroll-to-bottom button */}
        {isScrolledUp && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-[#007FFF] transition-all"
            style={{
              boxShadow:
                "0 0 0 1px rgba(0,0,0,0.08), 0 4px 16px 0 rgba(0,0,0,0.12)",
            }}
          >
            {scrollPendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[1.125rem] h-[1.125rem] rounded-full bg-[#007FFF] text-white text-[.625rem] font-[700] flex items-center justify-center px-1 leading-none">
                {scrollPendingCount > 99 ? "99+" : scrollPendingCount}
              </span>
            )}
            <Icon icon="hugeicons:arrow-down-double" className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto px-2 sm:px-3 md:px-8 py-3 sm:py-4 md:py-6 flex flex-col gap-0.5"
        >
          {/* Load more */}
          {messagesHasMore[chatroomId] && (
            <div className="flex justify-center mb-3 sm:mb-4">
              <button
                onClick={() => fetchMessages(chatroomId, messages[0]?.id)}
                disabled={isLoadingMessages[chatroomId]}
                className="text-[.75rem] sm:text-[.8125rem] text-[#007FFF] font-[500] hover:underline disabled:opacity-50"
              >
                {isLoadingMessages[chatroomId]
                  ? "Loading..."
                  : "Load older messages"}
              </button>
            </div>
          )}

          {isLoadingMessages[chatroomId] && messages.length === 0 && (
            <div className="flex justify-center py-8 sm:py-12">
              <Icon
                icon="svg-spinners:ring-resize"
                className="w-8 h-8 text-[#007FFF]"
              />
            </div>
          )}

          {grouped.map(([day, dayMsgs]) => (
            <React.Fragment key={day}>
              {/* Day separator */}
              <div className="flex items-center gap-3 my-3 sm:my-5">
                <div className="flex-1 h-px bg-[#EDEDED]" />
                <span className="text-[.6875rem] text-[#A3A3A3] font-[500] px-3 py-1 bg-[#F5F5F5] rounded-full whitespace-nowrap">
                  {day}
                </span>
                <div className="flex-1 h-px bg-[#EDEDED]" />
              </div>

              {dayMsgs.map((msg, i) => {
                const isMine =
                  msg.senderId === myUserId || msg.senderId === "__me__";
                const prevSender = i > 0 ? dayMsgs[i - 1].senderId : null;
                const nextSender =
                  i < dayMsgs.length - 1 ? dayMsgs[i + 1].senderId : null;
                const isFirst = prevSender !== msg.senderId;
                const isLast = nextSender !== msg.senderId;
                const marginBottom = isLast ? "mb-1.5 sm:mb-3" : "mb-0.5";

                return (
                  <React.Fragment key={msg.tempId ?? msg.id}>
                    {anchor && anchor.id === msg.id && (
                      <div className="flex items-center gap-3 my-2 sm:my-3">
                        <div className="flex-1 h-px bg-[#E32E89]/30" />
                        <span className="text-[.625rem] text-[#E32E89] font-[600] px-3 py-0.5 bg-[#FFF0F7] rounded-full whitespace-nowrap">
                          {anchor.count === 1
                            ? "1 new message"
                            : `${anchor.count} new messages`}
                        </span>
                        <div className="flex-1 h-px bg-[#E32E89]/30" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "flex items-end gap-1 sm:gap-2",
                        isMine ? "flex-row-reverse" : "flex-row",
                        marginBottom,
                      )}
                      onMouseEnter={() => setHoveredId(msg.tempId ?? msg.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      {/* Partner avatar — zero width for own messages so bubble hugs the right wall */}
                      <div className={cn("flex-shrink-0", !isMine ? "w-7 sm:w-8" : "w-0")}>
                        {!isMine && isLast && (
                          <InitialsAvatar name={partnerName} />
                        )}
                      </div>

                      {/* Bubble column */}
                      <div
                        className={cn(
                          "flex flex-col max-w-[84%] sm:max-w-[72%] md:max-w-[60%]",
                          isMine ? "items-end" : "items-start",
                        )}
                      >
                        {/* Partner name label */}
                        {!isMine && isFirst && (
                          <span className="text-[.6875rem] text-[#A3A3A3] font-[500] mb-1 ml-1">
                            {partnerName}
                          </span>
                        )}

                        {/* Flagged badge */}
                        {msg.isFlagged && (
                          <div className="flex items-center gap-1 mb-1 ml-1">
                            <Icon
                              icon="hugeicons:flag-02"
                              className="w-3 h-3 text-[#F3A218]"
                            />
                            <span className="text-[.625rem] text-[#F3A218] font-[500]">
                              Flagged
                              {msg.flagReason ? ` · ${msg.flagReason.length > 80 ? msg.flagReason.slice(0, 80) + "…" : msg.flagReason}` : ""}
                            </span>
                          </div>
                        )}

                        {/* Restricted notice — no retry (content policy violation) */}
                        {isMine && msg.restricted && (
                          <span className="text-[.6875rem] text-orange-500 font-[500] mb-1 self-end flex items-center gap-1">
                            <Icon
                              icon="hugeicons:alert-circle"
                              className="w-3 h-3"
                            />
                            Message restricted
                          </span>
                        )}

                        {/* Retry button for failed messages */}
                        {isMine && msg.failed && msg.tempId && (
                          <button
                            onClick={() =>
                              retryMessage(chatroomId, msg.tempId!, msg.content)
                            }
                            className="text-[.6875rem] text-red-500 font-[500] hover:underline mb-1 self-end"
                          >
                            Tap to retry
                          </button>
                        )}

                        {/* Bubble */}
                        <div
                          className={cn(
                            "px-3 sm:px-4 py-2 sm:py-2.5 text-[.8125rem] sm:text-[.875rem] leading-[1.6] max-w-full",
                            isMine && [
                              msg.failed
                                ? "bg-red-100 text-red-800"
                                : msg.restricted
                                  ? "bg-orange-50 text-orange-800"
                                  : "bg-[#007FFF] text-white",
                              isFirst &&
                                isLast &&
                                "rounded-[1.25rem] rounded-br-[.375rem]",
                              isFirst &&
                                !isLast &&
                                "rounded-[1.25rem] rounded-br-[.375rem]",
                              !isFirst &&
                                isLast &&
                                "rounded-[1.25rem] rounded-tr-[.375rem] rounded-br-[.375rem]",
                              !isFirst &&
                                !isLast &&
                                "rounded-[1.25rem] rounded-r-[.375rem]",
                            ],
                            !isMine &&
                              !msg.isFlagged && [
                                "bg-[#F5F5F5] text-[#2B2B2B]",
                                isFirst &&
                                  isLast &&
                                  "rounded-[1.25rem] rounded-bl-[.375rem]",
                                isFirst &&
                                  !isLast &&
                                  "rounded-[1.25rem] rounded-bl-[.375rem]",
                                !isFirst &&
                                  isLast &&
                                  "rounded-[1.25rem] rounded-tl-[.375rem] rounded-bl-[.375rem]",
                                !isFirst &&
                                  !isLast &&
                                  "rounded-[1.25rem] rounded-l-[.375rem]",
                              ],
                            !isMine &&
                              msg.isFlagged && [
                                "bg-[#FEF6E7] text-[#2B2B2B] border-l-[3px] border-[#F3A218]",
                                "rounded-[1.25rem] rounded-bl-[.375rem]",
                              ],
                          )}
                        >
                          <RichText content={msg.content} variant="block" />

                          {/* Timestamp + ticks INSIDE bubble, bottom-right */}
                          <div
                            className={cn(
                              "flex items-center gap-1 mt-1.5",
                              isMine ? "justify-end" : "justify-end",
                            )}
                          >
                            <span
                              className={cn(
                                "text-[.6rem] font-[400]",
                                isMine
                                  ? msg.failed
                                    ? "text-red-400"
                                    : msg.restricted
                                      ? "text-orange-400"
                                      : "text-white/60"
                                  : "text-[#A3A3A3]",
                              )}
                            >
                              {msg.failed
                                ? "Failed"
                                : msg.restricted
                                  ? "Restricted"
                                  : formatTime(msg.createdAt)}
                            </span>
                            {isMine && (
                              <MessageStatusIcon
                                status={msg.deliveryStatus}
                                failed={msg.failed}
                                restricted={msg.restricted}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Flag button — partner messages only, hover; zero-width spacer for own messages */}
                      <div className={cn("flex-shrink-0 flex items-center justify-center", !isMine ? "w-5 sm:w-6 md:w-7" : "w-0")}>
                        {!isMine && (
                          <button
                            onClick={() => {
                              if (msg.isFlagged) return;
                              if (!msg.id) {
                                toast.info(
                                  "Message is still arriving — give it a second and try again.",
                                );
                                return;
                              }
                              setFlagModal({ messageId: msg.id, reason: "" });
                            }}
                            className={cn(
                              "w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center transition-all duration-150",
                              hoveredId === (msg.tempId ?? msg.id)
                                ? "opacity-100"
                                : "sm:opacity-0 sm:pointer-events-none",
                              msg.isFlagged
                                ? "text-[#F3A218] bg-[#FEF6E7] cursor-default"
                                : "text-[#C0C0C0] bg-[#F5F5F5] hover:bg-[#FEF6E7] hover:text-[#F3A218] cursor-pointer",
                            )}
                            title={
                              msg.isFlagged
                                ? "Message flagged"
                                : "Flag this message"
                            }
                          >
                            <Icon
                              icon="hugeicons:flag-02"
                              className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5"
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Compose ─────────────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 border-t border-[#EDEDED] bg-white p-3 sm:p-4"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-end gap-2 sm:gap-3 rounded-[.875rem] border border-[#D6D6D6] focus-within:border-[#007FFF] transition-colors duration-200 p-2 sm:p-3">
          <div className="flex-1 min-w-0">
            <InputField
              type="rich-text"
              label={null}
              name="chat-message"
              value={composing}
              onChange={(e: { target: { name?: string; value: any } }) => {
                const val = e.target.value;
                setComposing(val);
                if (!isEmpty(val)) handleTyping();
              }}
              richTextProps={{
                variant: "chat",
                image: { allowed: true, folder: "chat" },
              }}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={isEmpty(composing)}
            className="flex-shrink-0 self-end"
          >
            <Icon icon="hugeicons:sent" className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </div>
        <p className="hidden sm:block text-[.6875rem] text-[#B0B0B0] mt-2 text-center">
          Ctrl + Enter to send
        </p>
      </div>

      {/* ── Flag modal ───────────────────────────────────────────────────── */}
      {flagModal && (
        <Modal isOpen onClose={() => setFlagModal(null)} className="rounded-[.875rem] p-4 sm:p-6 w-full max-w-[30rem]">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-full bg-[#FEF6E7] flex items-center justify-center flex-shrink-0">
                <Icon
                  icon="hugeicons:flag-02"
                  className="w-4 h-4 text-[#F3A218]"
                />
              </div>
              <h3 className="font-[600] text-[.9375rem] sm:text-[1rem] text-[#171717]">
                Flag Message
              </h3>
            </div>
            <p className="text-[.8125rem] sm:text-[.875rem] text-[#757575] mb-4 leading-5">
              This message will be reported to admin. They&apos;ll review it and
              take action where necessary. Add an optional note.
            </p>
            <InputField
              type="textarea"
              label={null}
              name="flag-reason"
              placeholder="Optional: reason for flagging..."
              value={flagModal.reason}
              onChange={(e: { target: { name?: string; value: any } }) =>
                setFlagModal((prev) =>
                  prev ? { ...prev, reason: e.target.value } : null,
                )
              }
              rows={3}
            />
            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3 mt-4">
              <Button
                variant="outlined"
                onClick={() => setFlagModal(null)}
                className="w-full sm:w-auto justify-center"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmFlag}
                loading={isFlagging}
                className="w-full sm:w-auto justify-center"
              >
                <Icon icon="hugeicons:flag-02" className="w-4 h-4" />
                Flag Message
              </Button>
            </div>
        </Modal>
      )}
    </div>
  );
}
