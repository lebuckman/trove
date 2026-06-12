"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * Carries the ordered list of gem ids visible on the current page so
 * the lightbox can navigate to prev/next via swipe.
 *
 * The provider sits at the AppShell level so it covers both the page tree
 * (where the list is computed) *and* the lightbox (mounted as a sibling
 * inside <Sheets />). Pages push their list up with `useSetGemList`.
 */
type Ctx = {
  ids: string[];
  setIds: (ids: string[]) => void;
};

const GemListContext = createContext<Ctx | null>(null);

export function GemListProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const value = useMemo(() => ({ ids, setIds }), [ids]);
  return (
    <GemListContext.Provider value={value}>{children}</GemListContext.Provider>
  );
}

/**
 * Page-level hook: sync the current visible list into the shared context.
 * Pass a stable array (e.g. derived inside `useMemo`) so this doesn't
 * fire on every render.
 */
export function useSetGemList(ids: string[]): void {
  const ctx = useContext(GemListContext);
  useEffect(() => {
    if (!ctx) return;
    ctx.setIds(ids);
    return () => {
      // Don't aggressively clear on unmount — the lightbox often outlives
      // a re-render of the page (e.g. filter change). The next page's
      // effect will overwrite.
    };
  }, [ctx, ids]);
}

export function useGemNeighbors(currentId: string): {
  prevId: string | null;
  nextId: string | null;
} {
  const ctx = useContext(GemListContext);
  if (!ctx) return { prevId: null, nextId: null };
  const i = ctx.ids.indexOf(currentId);
  if (i === -1) return { prevId: null, nextId: null };
  return {
    prevId: i > 0 ? ctx.ids[i - 1] : null,
    nextId: i < ctx.ids.length - 1 ? ctx.ids[i + 1] : null,
  };
}
