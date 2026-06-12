"use client";

import { useSyncExternalStore } from "react";
import type { Trove, Gem } from "@/lib/queries/types";

export type SortKey = "newest" | "oldest" | "alpha" | "custom";
const DEFAULT: SortKey = "newest";
const STORAGE_PREFIX = "trove/sort/";
const EVENT_NAME = "trove:sort-change";

function isSortKey(v: string | null): v is SortKey {
  return v === "newest" || v === "oldest" || v === "alpha" || v === "custom";
}

export function readSort(scope: string): SortKey {
  if (typeof window === "undefined") return DEFAULT;
  const raw = window.localStorage.getItem(STORAGE_PREFIX + scope);
  return isSortKey(raw) ? raw : DEFAULT;
}

export function writeSort(scope: string, value: SortKey): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_PREFIX + scope, value);
  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, { detail: { scope, value } }),
  );
}

/** React hook: live SortKey for the given scope. Backed by an external
 *  store (localStorage + a custom event) via useSyncExternalStore, which
 *  handles SSR + tearing without a setState-in-effect dance. */
export function useSort(scope: string): SortKey {
  return useSyncExternalStore(
    (notify) => {
      function onChange(e: Event) {
        const ce = e as CustomEvent<{ scope: string; value: SortKey }>;
        if (ce.detail?.scope === scope) notify();
      }
      window.addEventListener(EVENT_NAME, onChange);
      return () => window.removeEventListener(EVENT_NAME, onChange);
    },
    () => readSort(scope),
    () => DEFAULT,
  );
}

export function sortTroves(troves: Trove[], key: SortKey): Trove[] {
  const out = troves.slice();
  if (key === "custom") {
    out.sort((a, b) => a.position - b.position);
  } else if (key === "alpha") {
    out.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    const dir = key === "oldest" ? 1 : -1;
    out.sort(
      (a, b) =>
        dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    );
  }
  return out;
}

export function sortGems(gems: Gem[], key: SortKey): Gem[] {
  const out = gems.slice();
  if (key === "custom") {
    out.sort((a, b) => a.position - b.position);
  } else if (key === "alpha") {
    out.sort((a, b) => alphaKey(a).localeCompare(alphaKey(b)));
  } else {
    const dir = key === "oldest" ? 1 : -1;
    out.sort(
      (a, b) =>
        dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    );
  }
  return out;
}

function alphaKey(g: Gem): string {
  return (g.og_title ?? g.description ?? g.url ?? "").toLowerCase();
}

/** What the SortSheet should write to. Pure path-derived; safe to call
 *  from a client component that already has `usePathname()`. */
export function scopeForPathname(pathname: string): string {
  const m = pathname.match(/^\/troves\/([^/]+)/);
  if (m) return `trove/${m[1]}`;
  if (pathname.startsWith("/profile")) return "troves";
  return "home";
}
