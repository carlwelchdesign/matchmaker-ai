"use client";

import { useEffect, useState } from "react";

import {
  fetchInterviewAvailability,
  interviewAvailabilityRefreshIntervalMs,
} from "./interview-availability-client";

export function useInterviewAvailability({
  active,
  initiallyEnabled,
}: Readonly<{
  active: boolean;
  initiallyEnabled: boolean;
}>): boolean {
  const [enabled, setEnabled] = useState(initiallyEnabled);

  useEffect(() => {
    setEnabled(initiallyEnabled);
  }, [initiallyEnabled]);

  useEffect(() => {
    if (!active || !initiallyEnabled) return;

    let aborted = false;
    let requestController: AbortController | null = null;
    let timeoutId: number | null = null;

    function clearRefresh() {
      if (timeoutId === null) return;
      window.clearTimeout(timeoutId);
      timeoutId = null;
    }

    function scheduleRefresh() {
      clearRefresh();
      if (aborted || document.visibilityState !== "visible") return;
      timeoutId = window.setTimeout(
        refresh,
        interviewAvailabilityRefreshIntervalMs,
      );
    }

    async function refresh() {
      clearRefresh();
      requestController?.abort();
      const controller = new AbortController();
      requestController = controller;

      try {
        const result = await fetchInterviewAvailability({
          signal: controller.signal,
        });
        if (!aborted && !controller.signal.aborted) setEnabled(result.enabled);
      } finally {
        if (requestController === controller) requestController = null;
        scheduleRefresh();
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") void refresh();
      else {
        clearRefresh();
        requestController?.abort();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    void refresh();

    return () => {
      aborted = true;
      clearRefresh();
      requestController?.abort();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [active, initiallyEnabled]);

  return enabled;
}
