"use client";

import { useEffect, useState } from "react";

/**
 * Current time, re-rendered at the start of every minute (or every `intervalMs`).
 * Returns null until mounted so server and client markup match.
 */
export const useNow = (intervalMs?: number) => {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    let interval: ReturnType<typeof setInterval> | undefined;

    if (intervalMs) {
      interval = setInterval(() => setNow(new Date()), intervalMs);
      return () => clearInterval(interval);
    }

    // Align ticks to the minute boundary so the clock flips exactly on time.
    const msToNextMinute = 60_000 - (Date.now() % 60_000);
    const timeout = setTimeout(() => {
      setNow(new Date());
      interval = setInterval(() => setNow(new Date()), 60_000);
    }, msToNextMinute);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [intervalMs]);

  return now;
};
