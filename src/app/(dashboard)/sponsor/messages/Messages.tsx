"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, CheckBox } from "@/components/atoms";
import { InputField, Modal } from "@/components/molecules";
import { useAuthStore } from "@/store";
import { useChatStore } from "@/store/chat.store";
import { cn } from "@/lib/utils";
import { CARD_SHADOW, stripMarkdownPreview } from "@/utils";
import type { IChatroom, IComposeStudent } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toUTC(iso: string): Date {
  return new Date(/Z$|[+-]\d{2}:\d{2}$/.test(iso) ? iso : iso + "Z");
}

function relativeTime(iso: string): string {
  const diff = Date.now() - toUTC(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return toUTC(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}


function Initials({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const parts = name.trim().split(" ");
  const ini = (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  return (
    <div
      className={cn(
        "rounded-full bg-[#DBEDFF] text-[#007FFF] flex items-center justify-center font-[700] select-none flex-shrink-0",
        size === "md" ? "w-11 h-11 text-sm" : "w-8 h-8 text-xs",
      )}
    >
      {ini.toUpperCase()}
    </div>
  );
}

// ─── Compose modal ────────────────────────────────────────────────────────────

const composeSchema = yup.object({
  message: yup
    .string()
    .required("Message cannot be empty")
    .test("no-empty-html", "Message cannot be empty", (val) =>
      !!val && val.replace(/<[^>]*>/g, "").trim().length > 0,
    ),
});

function ComposeModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const {
    composeStudents,
    isLoadingComposeStudents,
    searchSponsorStudents,
    createChatroom,
    isCreatingChatroom,
  } = useChatStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<IComposeStudent[]>([]);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(composeSchema) });

  useEffect(() => {
    searchSponsorStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(
      () => searchSponsorStudents(val || undefined),
      300,
    );
  };

  const toggle = (student: IComposeStudent) => {
    setSelected((prev) =>
      prev.some((s) => s.userId === student.userId)
        ? prev.filter((s) => s.userId !== student.userId)
        : [...prev, student],
    );
  };

  const handleSend = handleSubmit(({ message }) => {
    if (!selected.length) return;
    const text =
      typeof message === "string" ? message.trim() : JSON.stringify(message);
    createChatroom(
      selected.map((s) => s.userId),
      text || undefined,
      (firstId) => {
        onClose();
        if (selected.length === 1) router.push(`/sponsor/messages/${firstId}`);
      },
    );
  });

  // Split display: selected pinned at top, rest below (excluding already-selected)
  const unselectedList = composeStudents.filter(
    (s) => !selected.some((sel) => sel.userId === s.userId),
  );
  const noResults =
    !isLoadingComposeStudents && query && composeStudents.length === 0;

  return (
    <Modal isOpen onClose={onClose} overflowY="hidden" className="rounded-[.875rem] w-full max-w-[34rem]">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#F0F0F0]">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="text-[#757575] hover:text-[#171717] transition-colors"
              >
                <Icon icon="hugeicons:arrow-left-01" className="w-5 h-5" />
              </button>
            )}
            <div>
              <h3 className="font-[600] text-[1rem] text-[#171717]">
                Start a Conversation
              </h3>
              <p className="text-[.75rem] text-[#A3A3A3] mt-0.5">
                {step === 1
                  ? "Step 1 of 2 — Select students"
                  : "Step 2 of 2 — Write your message"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#A3A3A3] hover:text-[#2B2B2B] transition-colors"
          >
            <Icon icon="hugeicons:cancel-01" className="w-5 h-5" />
          </button>
        </div>

        {/* ── Step 1: Pick students ────────────────────────────────────────── */}
        {step === 1 && (
          <div className="flex flex-col gap-4 px-6 py-5">
            {/* Search */}
            <div className="relative">
              <Icon
                icon="hugeicons:search-01"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A3A3] pointer-events-none"
              />
              <input
                className="w-full pl-9 pr-4 py-[.625rem] border-[1.5px] border-[#D6D6D6] rounded-[9999px] text-[.875rem] text-[#2B2B2B] focus:outline-none focus:border-[#007FFF] transition-colors"
                placeholder="Search by name or email..."
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
              />
            </div>

            {/* Scrollable list */}
            <div className="max-h-72 overflow-y-auto flex flex-col -mx-1 px-1">
              {/* Selected always shown at top, even while loading */}
              {selected.length > 0 && (
                <>
                  <p className="text-[.6875rem] font-[600] text-[#007FFF] uppercase tracking-wide px-1 mb-1">
                    Selected ({selected.length})
                  </p>
                  {selected.map((student) => {
                    const name = `${student.firstName} ${student.lastName}`;
                    return (
                      <button
                        key={student.userId}
                        onClick={() => toggle(student)}
                        className="flex items-center gap-3 p-2.5 rounded-[.625rem] bg-[#F0F7FF] hover:bg-[#DBEDFF] transition-colors text-left mb-0.5"
                      >
                        <CheckBox
                          value={true}
                          onChange={() => toggle(student)}
                        />
                        <Initials name={name} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[.875rem] font-[500] text-[#171717] truncate">
                            {name}
                          </p>
                          <p className="text-[.75rem] text-[#757575] truncate">
                            {student.email}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                  {(isLoadingComposeStudents ||
                    unselectedList.length > 0 ||
                    noResults) && (
                    <div className="border-t border-[#F0F0F0] my-2" />
                  )}
                </>
              )}

              {isLoadingComposeStudents ? (
                <div className="flex items-center justify-center py-8">
                  <Icon
                    icon="svg-spinners:ring-resize"
                    className="w-8 h-8 text-[#007FFF]"
                  />
                </div>
              ) : noResults ? (
                <p className="text-[.8125rem] text-[#A3A3A3] text-center py-8">
                  None of your sponsored students match that search.
                </p>
              ) : (
                unselectedList.map((student) => {
                  const name = `${student.firstName} ${student.lastName}`;
                  return (
                    <button
                      key={student.userId}
                      onClick={() => toggle(student)}
                      className="flex items-center gap-3 p-2.5 rounded-[.625rem] hover:bg-[#F5F5F5] transition-colors text-left"
                    >
                      <CheckBox
                        value={false}
                        onChange={() => toggle(student)}
                      />
                      <Initials name={name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[.875rem] font-[500] text-[#171717] truncate">
                          {name}
                        </p>
                        <p className="text-[.75rem] text-[#757575] truncate">
                          {student.email}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#F0F0F0]">
              <Button variant="outlined" onClick={onClose} className="w-28">
                Cancel
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!selected.length}
                className="w-36"
              >
                Continue
                <Icon icon="hugeicons:arrow-right-01" className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Write message ────────────────────────────────────────── */}
        {step === 2 && (
          <div className="flex flex-col flex-1 min-h-0 gap-4 px-6 py-5">
            {/* Recipients summary */}
            <div className="flex flex-wrap gap-1.5">
              {selected.map((s) => (
                <span
                  key={s.userId}
                  className="flex items-center gap-1 bg-[#F0F7FF] text-[#007FFF] text-[.75rem] font-[500] px-2.5 py-1 rounded-full border border-[#DBEDFF]"
                >
                  {s.firstName} {s.lastName}
                  <button
                    onClick={() => {
                      toggle(s);
                      if (selected.length === 1) setStep(1);
                    }}
                  >
                    <Icon icon="hugeicons:cancel-01" className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Rich text input — same as chatroom */}
            <Controller
              name="message"
              control={control}
              render={({ field }) => (
              <div className="flex-1 min-h-0 overflow-y-auto rounded-[.875rem] border border-[#D6D6D6] focus-within:border-[#007FFF] transition-colors duration-200 p-3">
              <InputField
                type="rich-text"
                label={null}
                name="compose-message"
                value={field.value ?? ""}
                onChange={(e: { target: { name?: string; value: any } }) =>
                  field.onChange(e.target.value)
                }
                error={errors.message?.message}
                richTextProps={{
                  variant: "chat",
                  image: { allowed: false, folder: "chat" },
                }}
              />
            </div>
              )}
            />
            <p className="text-[.6875rem] text-[#B0B0B0] -mt-2 text-center">
              This will be the opening message of your conversation.
            </p>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#F0F0F0]">
              <Button
                variant="outlined"
                onClick={() => setStep(1)}
                className="w-28"
              >
                Back
              </Button>
              <Button
                onClick={handleSend}
                loading={isCreatingChatroom}
                className="w-36 min-w-fit"
              >
                <Icon icon="hugeicons:sent" className="w-4 h-4" />
                {selected.length > 1 ? `Send to ${selected.length}` : "Send"}
              </Button>
            </div>
          </div>
        )}
    </Modal>
  );
}

// ─── Chatroom row ─────────────────────────────────────────────────────────────

function ChatroomRow({
  room,
  myUserId,
  isTyping,
}: {
  room: IChatroom;
  myUserId: string;
  isTyping: boolean;
}) {
  const name = room.partner
    ? `${room.partner.firstName} ${room.partner.lastName}`
    : "Unknown";
  const preview = room.lastMessage?.content
    ? stripMarkdownPreview(room.lastMessage.content)
    : "";
  const ts = room.lastMessage?.createdAt ?? room.createdAt;
  const isMine = !!myUserId && room.lastMessage?.senderId === myUserId;

  return (
    <Link
      href={`/sponsor/messages/${room.id}`}
      style={{ boxShadow: CARD_SHADOW }}
      className="p-5 rounded-[.5rem] flex items-center gap-4 hover:bg-[#FAFAFA] transition-colors"
    >
      <Initials name={name} />

      <div className="flex-1 min-w-0">
        <span className="font-[500] text-[1rem] leading-6 block">{name}</span>
        {isTyping ? (
          <span className="flex items-center gap-1.5 h-5">
            <span className="flex items-center gap-[3px]">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-[4px] h-[4px] rounded-full bg-[#007FFF] animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
            <span className="text-[.8125rem] text-[#007FFF] font-[400]">
              Typing...
            </span>
          </span>
        ) : (
          <span className="text-[#757575] font-[400] leading-5 text-[.875rem] truncate block">
            {isMine ? <span className="text-[#A3A3A3]">You: </span> : null}
            {preview || (
              <span className="italic text-[#A3A3A3]">No messages yet</span>
            )}
          </span>
        )}
      </div>

      <div className="flex gap-2 flex-col items-end flex-shrink-0">
        <span className="text-[#757575] font-[400] text-[.75rem] leading-5">
          {relativeTime(ts)}
        </span>
        {room.unreadCount > 0 && (
          <span className="bg-[#E32E89] rounded-full h-5 min-w-5 px-1 flex items-center text-white text-[.75rem] font-[500] justify-center">
            {room.unreadCount > 99 ? "99+" : room.unreadCount}
          </span>
        )}
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Messages() {
  const { user } = useAuthStore();
  const {
    chatrooms,
    chatroomsHasMore,
    isLoadingChatrooms,
    totalUnread,
    typing,
    fetchChatrooms,
    fetchTotalUnread,
  } = useChatStore();

  const [search, setSearch] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchChatrooms();
    fetchTotalUnread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchChatrooms(undefined, false, val.trim() || undefined);
    }, 400);
  };

  useEffect(() => {
    document.title =
      totalUnread > 0
        ? `iExcelo - Sponsor | Messages (${totalUnread})`
        : "iExcelo - Sponsor | Messages";
    return () => {
      document.title = "iExcelo - Sponsor";
    };
  }, [totalUnread]);

  const lastRoom = chatrooms[chatrooms.length - 1];

  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
      {/* Page header */}
      <div className="flex mb-8 flex-col xl:flex-row xl:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Messages</h1>
          <p className="text-gray-500 text-sm mt-1">
            Communicate with your sponsored students
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowCompose(true)}>
            <Icon className="text-white w-4.5 h-4.5" icon="hugeicons:edit-02" />
            Compose Message
          </Button>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex mb-8 p-[.8125rem_1.5rem] rounded-[.625rem] border border-[#C2F1FF] bg-[#F1FCFF] gap-4 items-center text-[#41BCE2]">
        <Icon
          className="w-5 h-5 text-inherit"
          icon="hugeicons:information-circle"
        />
        <span className="font-[400] text-[.875rem] leading-5">
          You can flag any inappropriate message from a student — our admin team
          will review it and take action where necessary.
        </span>
      </div>

      {/* Conversations card */}
      <section
        className="p-6 rounded-[.75rem]"
        style={{
          boxShadow: `0px 5px 22px 0px rgba(0,0,0,0.04), 0px 0px 0px 1px rgba(0,0,0,0.06)`,
        }}
      >
        <div className="flex mb-6 items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-[500] text-[#171717] text-[1.125rem] leading-7">
              Messages{totalUnread > 0 ? ` (${totalUnread})` : ""}
            </span>
            <span className="font-[400] text-[#757575] text-[.875rem] leading-5">
              Your conversation history with students
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="flex mb-6 items-stretch gap-4">
          <input
            className="border-[1.5px] text-[.875rem] text-[#757575] font-[400] leading-5 p-[.625rem_.875rem] flex-1 border-[#D6D6D6] rounded-[9999px] focus:outline-none focus:border-[#007FFF] transition-colors"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* List */}
        <div className="p-6 -m-6 max-h-150 overflow-y-auto flex flex-col gap-3">
          {isLoadingChatrooms && chatrooms.length === 0 ? (
            <div className="flex justify-center py-12">
              <Icon
                icon="svg-spinners:ring-resize"
                className="w-8 h-8 text-[#007FFF]"
              />
            </div>
          ) : chatrooms.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3 text-[#A3A3A3]">
              <Icon
                icon="hugeicons:bubble-chat-notification"
                className="w-10 h-10"
              />
              <p className="text-[.9375rem]">
                {search
                  ? "No conversations match your search."
                  : "No conversations yet. Start one!"}
              </p>
            </div>
          ) : (
            <>
              {chatrooms.map((room) => (
                <ChatroomRow
                  key={room.id}
                  room={room}
                  myUserId={user?.id ?? ""}
                  isTyping={(typing[room.id] ?? []).includes(
                    room.partner?.id ?? "",
                  )}
                />
              ))}
              {chatroomsHasMore && (
                <button
                  onClick={() =>
                    fetchChatrooms(
                      lastRoom?.createdAt,
                      true,
                      search.trim() || undefined,
                    )
                  }
                  disabled={isLoadingChatrooms}
                  className="text-[.875rem] text-[#007FFF] font-[500] py-2 hover:underline disabled:opacity-50"
                >
                  {isLoadingChatrooms ? "Loading..." : "Load more"}
                </button>
              )}
            </>
          )}
        </div>
      </section>

      {showCompose && <ComposeModal onClose={() => setShowCompose(false)} />}
    </section>
  );
}
