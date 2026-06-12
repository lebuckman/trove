"use client";

import { useSyncExternalStore } from "react";

/** Live media-query match, SSR-safe (false on the server). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", notify);
      return () => mql.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Tailwind `md` breakpoint — where sheets become centered modals. */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 768px)");
}
