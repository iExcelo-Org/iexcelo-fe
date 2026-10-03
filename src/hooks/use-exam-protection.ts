"use client";

import { useEffect } from "react";

export function useExamProtection(active: boolean = true, warnOnLeave: boolean = true) {
  useEffect(() => {
    if (!active) return;
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Disable copy
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable cut
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable keyboard shortcuts for inspect/devtools
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i")) ||
        (e.ctrlKey && e.shiftKey && (e.key === "J" || e.key === "j")) ||
        (e.ctrlKey && (e.key === "U" || e.key === "u")) ||
        (e.ctrlKey && (e.key === "S" || e.key === "s")) ||
        (e.ctrlKey && (e.key === "P" || e.key === "p"))
      ) {
        e.preventDefault();
        return false;
      }
      // Disable Ctrl+C, Ctrl+V, Ctrl+X
      if (e.ctrlKey && (e.key === "c" || e.key === "v" || e.key === "x")) {
        e.preventDefault();
        return false;
      }
    };

    // Disable drag
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Warn before page refresh / tab close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    // Add event listeners
    if (warnOnLeave) window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("dragstart", handleDragStart);

    // Apply CSS to disable selection
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";

    // Cleanup
    return () => {
      if (warnOnLeave) window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("dragstart", handleDragStart);
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
    };
  }, [active, warnOnLeave]);
}
