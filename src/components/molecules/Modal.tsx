"use client";

import { cn } from "@/lib/utils";
import { CARD_SHADOW } from "@/utils";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  /** Classes applied to the white content box — controls width, border-radius, overflow, etc. */
  className?: string;
  /** Tailwind z-index class. Defaults to "z-50". */
  zIndex?: string;
  /** Override white-box overflow. Use "hidden" when the modal manages its own internal scroll zones. Defaults to "auto". */
  overflowY?: "auto" | "hidden";
  /** "center" (default) — centered dialog with backdrop padding. "bottom" — bottom sheet that slides up. */
  position?: "center" | "bottom";
  /** Extra classes on the backdrop overlay (e.g. "lg:hidden"). */
  overlayClassName?: string;
}

export function Modal({
  isOpen,
  onClose,
  children,
  className,
  zIndex = "z-50",
  overflowY = "auto",
  position = "center",
  overlayClassName,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 flex",
        position === "center"
          ? "items-center justify-center p-4 bg-black/40"
          : "items-end justify-center bg-black/50",
        zIndex,
        overlayClassName,
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-white flex flex-col",
          position === "center" && "max-h-[95vh]",
          overflowY === "hidden" ? "overflow-hidden" : "overflow-y-auto",
          className,
        )}
        style={position === "center" ? { boxShadow: CARD_SHADOW } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
