"use client";

import {
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
  useEffect,
} from "react";

interface Line {
  prompt: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Props {
  prompts: string[];
  options: string[];
  value: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
  revealed?: boolean;
  correctAnswer?: Record<string, string>;
  disabled?: boolean;
}

export function MatchingQuestion({
  prompts,
  options,
  value,
  onChange,
  revealed = false,
  correctAnswer,
  disabled = false,
}: Props) {
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const rightRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [lines, setLines] = useState<Line[]>([]);

  const computeLines = useCallback(() => {
    if (!containerRef.current) return;
    const box = containerRef.current.getBoundingClientRect();
    const next: Line[] = [];
    for (const [prompt, option] of Object.entries(value)) {
      const leftEl = leftRefs.current.get(prompt);
      const rightEl = rightRefs.current.get(option);
      if (!leftEl || !rightEl) continue;
      const lb = leftEl.getBoundingClientRect();
      const rb = rightEl.getBoundingClientRect();
      next.push({
        prompt,
        x1: lb.right - box.left,
        y1: lb.top + lb.height / 2 - box.top,
        x2: rb.left - box.left,
        y2: rb.top + rb.height / 2 - box.top,
      });
    }
    setLines(next);
  }, [value]);

  useLayoutEffect(() => {
    computeLines();
  }, [computeLines]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(computeLines);
    ro.observe(el);
    return () => ro.disconnect();
  }, [computeLines]);

  const handleLeftClick = (prompt: string) => {
    if (disabled) return;
    setSelectedPrompt((prev) => (prev === prompt ? null : prompt));
  };

  const handleRightClick = (option: string) => {
    if (disabled) return;
    if (!selectedPrompt) {
      // Clicking an already-connected right item selects its left counterpart for re-assignment
      const owner = Object.entries(value).find(([, v]) => v === option)?.[0];
      if (owner) setSelectedPrompt(owner);
      return;
    }
    const next = { ...value };
    // Remove any existing assignment of this option to another prompt
    for (const [k, v] of Object.entries(next)) {
      if (v === option && k !== selectedPrompt) delete next[k];
    }
    next[selectedPrompt] = option;
    onChange(next);
    setSelectedPrompt(null);
  };

  const lineColor = (prompt: string) => {
    if (!revealed || !correctAnswer) return "#007FFF";
    return correctAnswer[prompt] === value[prompt] ? "#099137" : "#D42620";
  };

  const leftItemClass = (prompt: string) => {
    const connected = !!value[prompt];
    const sel = selectedPrompt === prompt;
    if (sel)
      return "border-[#007FFF] bg-[#DBEDFF] text-[#007FFF] shadow-sm";
    if (revealed && connected) {
      return correctAnswer?.[prompt] === value[prompt]
        ? "border-[#099137] bg-[#F0FBF3] text-[#099137]"
        : "border-[#D42620] bg-[#FEF3F2] text-[#D42620]";
    }
    if (connected)
      return "border-[#007FFF]/50 bg-[#F5F9FF] text-[#344054]";
    return "border-[#D0D5DD] bg-white text-[#344054] hover:border-[#007FFF]/60";
  };

  const rightItemClass = (option: string) => {
    const owner = Object.entries(value).find(([, v]) => v === option)?.[0];
    if (revealed && owner) {
      return correctAnswer?.[owner] === option
        ? "border-[#099137] bg-[#F0FBF3] text-[#099137]"
        : "border-[#D42620] bg-[#FEF3F2] text-[#D42620]";
    }
    if (owner) return "border-[#007FFF]/50 bg-[#F5F9FF] text-[#344054]";
    if (selectedPrompt)
      return "border-[#007FFF]/40 bg-white text-[#344054] hover:border-[#007FFF] hover:bg-[#DBEDFF]";
    return "border-[#D0D5DD] bg-white text-[#344054] hover:border-[#007FFF]/50";
  };

  return (
    <div className="flex flex-col gap-3">
      {!disabled && !revealed && (
        <p className="text-xs text-[#667085]">
          {selectedPrompt
            ? "Now tap an item on the right to connect it."
            : "Tap an item on the left, then tap its match on the right."}
        </p>
      )}

      <div ref={containerRef} className="relative flex gap-6 sm:gap-10">
        {/* Left column */}
        <div className="flex-1 flex flex-col gap-3 z-10">
          {prompts.map((prompt) => (
            <div
              key={prompt}
              ref={(el) => {
                if (el) leftRefs.current.set(prompt, el);
              }}
              onClick={() => handleLeftClick(prompt)}
              className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all select-none ${
                disabled ? "cursor-default" : "cursor-pointer"
              } ${leftItemClass(prompt)}`}
            >
              {prompt}
            </div>
          ))}
        </div>

        {/* SVG connection lines */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          style={{ zIndex: 5 }}
          aria-hidden
        >
          {lines.map((l) => (
            <line
              key={l.prompt}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke={lineColor(l.prompt)}
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray={revealed ? undefined : "5 3"}
            />
          ))}
          {/* Dot on the pending left item's right edge */}
          {selectedPrompt &&
            (() => {
              const el = leftRefs.current.get(selectedPrompt);
              if (!el || !containerRef.current) return null;
              const box = containerRef.current.getBoundingClientRect();
              const lb = el.getBoundingClientRect();
              const cx = lb.right - box.left;
              const cy = lb.top + lb.height / 2 - box.top;
              return (
                <circle cx={cx} cy={cy} r={5} fill="#007FFF" opacity={0.8} />
              );
            })()}
        </svg>

        {/* Right column */}
        <div className="flex-1 flex flex-col gap-3 z-10">
          {options.map((option) => (
            <div
              key={option}
              ref={(el) => {
                if (el) rightRefs.current.set(option, el);
              }}
              onClick={() => handleRightClick(option)}
              className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all select-none ${
                disabled ? "cursor-default" : "cursor-pointer"
              } ${rightItemClass(option)}`}
            >
              {option}
            </div>
          ))}
        </div>
      </div>

      {/* Revealed: show correct matches for wrong pairs */}
      {revealed && correctAnswer && (
        <div className="flex flex-col gap-1 mt-1">
          {prompts
            .filter((p) => correctAnswer[p] && value[p] !== correctAnswer[p])
            .map((p) => (
              <p key={p} className="text-xs text-[#099137] font-medium">
                {p} → {correctAnswer[p]}
              </p>
            ))}
        </div>
      )}
    </div>
  );
}
