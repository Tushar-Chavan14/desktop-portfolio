"use client";

import { useSyncExternalStore } from "react";
import { MOBILE_BREAKPOINT } from "@src/constants/layout";

const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px), (pointer: coarse) and (max-width: 1023px)`;

const subscribe = (onChange: () => void) => {
  const mql = window.matchMedia(query);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
};

/**
 * True on phones and small touch tablets. Returns null during SSR and the
 * first client render, so callers can avoid mounting the wrong shell.
 */
export const useIsMobile = (): boolean | null =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => null
  );
