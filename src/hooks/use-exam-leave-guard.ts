"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Intercepts the browser back button during an active exam and shows a custom
 * leave-confirmation modal instead of navigating away immediately.
 *
 * Works by pushing a dummy history entry when the exam mounts, then catching
 * the popstate event (triggered by back button) and pushing again to keep the
 * student on the page until they make an explicit choice.
 *
 * NOTE: Browser refresh / tab close is handled separately by the beforeunload
 * listener in useExamProtection — browsers don't allow custom UI there.
 */
export function useExamLeaveGuard(active: boolean = true) {
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  useEffect(() => {
    if (!active) return;

    // Push a dummy entry so the back button has somewhere to pop
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      // Push again immediately to keep the student on the page
      window.history.pushState(null, "", window.location.href);
      setShowLeaveModal(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [active]);

  const dismissLeaveModal = useCallback(() => setShowLeaveModal(false), []);

  return { showLeaveModal, setShowLeaveModal, dismissLeaveModal };
}
