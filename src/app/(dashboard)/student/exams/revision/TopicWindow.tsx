"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { ContentRenderer } from "@/components/atoms";
import { useExamStore } from "@/store";
import Link from "next/link";
import type { ITopic } from "@/types";

const MIN_W = 280;
const MIN_H = 220;
// Thickness of each edge/corner resize hit area in pixels
const H = 8;

type ResizeDir = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

interface ResizeHandleProps {
  dir: ResizeDir;
  onStart: (e: React.MouseEvent, dir: ResizeDir) => void;
}

function ResizeHandle({ dir, onStart }: ResizeHandleProps) {
  const cursorMap: Record<ResizeDir, string> = {
    n: "n-resize", s: "s-resize", e: "e-resize", w: "w-resize",
    ne: "ne-resize", nw: "nw-resize", se: "se-resize", sw: "sw-resize",
  };
  const style: React.CSSProperties = { position: "absolute", zIndex: 20, cursor: cursorMap[dir] };

  // Edge strips
  if (dir === "n")  Object.assign(style, { top: 0, left: H, right: H, height: H });
  if (dir === "s")  Object.assign(style, { bottom: 0, left: H, right: H, height: H });
  if (dir === "e")  Object.assign(style, { right: 0, top: H, bottom: H, width: H });
  if (dir === "w")  Object.assign(style, { left: 0, top: H, bottom: H, width: H });
  // Corners (slightly bigger for ease of grab)
  if (dir === "nw") Object.assign(style, { top: 0, left: 0, width: H + 4, height: H + 4 });
  if (dir === "ne") Object.assign(style, { top: 0, right: 0, width: H + 4, height: H + 4 });
  if (dir === "sw") Object.assign(style, { bottom: 0, left: 0, width: H + 4, height: H + 4 });
  if (dir === "se") Object.assign(style, { bottom: 0, right: 0, width: H + 4, height: H + 4 });

  return (
    <div
      style={style}
      onMouseDown={(e) => { e.stopPropagation(); onStart(e, dir); }}
    />
  );
}

interface Props {
  topicId: string;
  index: number;
  zIndex: number;
  onClose: () => void;
  onFocus: () => void;
}

export function TopicWindow({ topicId, index, zIndex, onClose, onFocus }: Props) {
  const { fetchTopicDetailRaw } = useExamStore();
  const [topic, setTopic] = useState<ITopic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const INIT_W = 380;
  const INIT_H = 500;
  const CASCADE = 32;

  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    if (typeof window === "undefined") return { x: 200, y: 100 };
    return {
      x: Math.max(8, window.innerWidth - INIT_W - 24 - index * CASCADE),
      y: Math.max(8, window.innerHeight - INIT_H - 80 - index * CASCADE),
    };
  });
  const [size, setSize] = useState({ w: INIT_W, h: INIT_H });

  // Drag state
  const isDragging = useRef(false);
  const dragOrigin = useRef({ x: 0, y: 0 });
  const posAtDrag = useRef({ x: 0, y: 0 });

  // Resize state
  const isResizing = useRef(false);
  const resizeDir = useRef<ResizeDir>("se");
  const resizeOrigin = useRef({ x: 0, y: 0 });
  const sizeAtResize = useRef({ w: 0, h: 0 });
  const posAtResize = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setIsLoading(true);
    fetchTopicDetailRaw(topicId).then((t) => {
      setTopic(t);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    dragOrigin.current = { x: e.clientX, y: e.clientY };
    posAtDrag.current = { ...pos };

    const onMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      setPos({
        x: posAtDrag.current.x + ev.clientX - dragOrigin.current.x,
        y: posAtDrag.current.y + ev.clientY - dragOrigin.current.y,
      });
    };
    const onUp = () => {
      isDragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const handleResizeStart = (e: React.MouseEvent, dir: ResizeDir) => {
    e.preventDefault();
    isResizing.current = true;
    resizeDir.current = dir;
    resizeOrigin.current = { x: e.clientX, y: e.clientY };
    sizeAtResize.current = { ...size };
    posAtResize.current = { ...pos };

    const onMove = (ev: MouseEvent) => {
      if (!isResizing.current) return;
      const dx = ev.clientX - resizeOrigin.current.x;
      const dy = ev.clientY - resizeOrigin.current.y;
      const d = resizeDir.current;

      let newW = sizeAtResize.current.w;
      let newH = sizeAtResize.current.h;
      let newX = posAtResize.current.x;
      let newY = posAtResize.current.y;

      if (d.includes("e")) newW = Math.max(MIN_W, sizeAtResize.current.w + dx);
      if (d.includes("s")) newH = Math.max(MIN_H, sizeAtResize.current.h + dy);
      if (d.includes("w")) {
        const cand = sizeAtResize.current.w - dx;
        if (cand >= MIN_W) { newW = cand; newX = posAtResize.current.x + dx; }
      }
      if (d.includes("n")) {
        const cand = sizeAtResize.current.h - dy;
        if (cand >= MIN_H) { newH = cand; newY = posAtResize.current.y + dy; }
      }

      setSize({ w: newW, h: newH });
      setPos({ x: newX, y: newY });
    };
    const onUp = () => {
      isResizing.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      onMouseDown={onFocus}
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: size.w,
        height: size.h,
        zIndex,
        boxShadow: "0 0 0 1px rgba(0,0,0,0.08), 0 16px 48px 0 rgba(0,0,0,0.20)",
      }}
      className="bg-white rounded-2xl flex flex-col overflow-hidden"
    >
      {/* Resize handles — all 8 directions */}
      {(["n","s","e","w","ne","nw","se","sw"] as ResizeDir[]).map((dir) => (
        <ResizeHandle key={dir} dir={dir} onStart={handleResizeStart} />
      ))}

      {/* Drag handle / header */}
      <div
        onMouseDown={handleDragStart}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing select-none flex items-center justify-between px-4 py-3 bg-[#007FFF] rounded-t-2xl"
      >
        <div className="flex items-center gap-2">
          <Icon icon="hugeicons:drag-drop-vertical" className="w-4 h-4 text-white/70 pointer-events-none" />
          <span className="text-white text-sm font-semibold pointer-events-none">Topic</span>
        </div>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          <Icon icon="hugeicons:cancel-01" className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable content — fluid width */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        <div className="w-full max-w-[600px] mx-auto px-4 py-4 flex flex-col gap-3">
          {isLoading ? (
            <div className="flex flex-col gap-3 animate-pulse">
              <div className="h-3 bg-gray-100 rounded w-1/3" />
              <div className="h-5 bg-gray-200 rounded w-4/5" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
              <div className="h-3 bg-gray-100 rounded w-4/6" />
              <div className="h-3 bg-gray-100 rounded w-full" />
            </div>
          ) : topic ? (
            <>
              <div>
                {topic.subjectName && (
                  <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">
                    {topic.subjectName}
                  </p>
                )}
                <h3 className="text-base font-bold text-gray-900 leading-snug">
                  {topic.name}
                </h3>
              </div>
              <hr className="border-[#EDEDED]" />
              <div className="text-gray-700 text-sm leading-relaxed">
                {topic.content ? (
                  <ContentRenderer content={topic.content} contentFormat={topic.contentFormat} />
                ) : (
                  <p className="text-gray-400 italic">No content available for this topic.</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-sm italic">Topic not found.</p>
          )}
        </div>
      </div>

      {/* Footer */}
      {!isLoading && topic && (
        <div className="flex-shrink-0 px-4 py-3 border-t border-[#EDEDED]">
          <Link
            href={`/student/topics/${topic.id}`}
            target="_blank"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              // On mobile, use window.open so Chrome Android groups the tab under the current page
              if (typeof window !== "undefined" && window.innerWidth <= 768) {
                e.preventDefault();
                window.open(`/student/topics/${topic.id}`, "_blank");
              }
            }}
            className="text-[#007FFF] text-sm font-medium hover:underline flex items-center gap-1"
          >
            Open in full page
            <Icon icon="hugeicons:arrow-right-01" className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
