"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { TagChip } from "./TagChip";
import type { Tag } from "@/lib/queries/types";

export function TagFilter({
  tags,
  counts,
  onAdd,
}: {
  tags: Tag[];
  /** Optional: tag-id → count (used by the search page). */
  counts?: Record<string, number>;
  /** When provided, renders a trailing + chip that invokes this callback. */
  onAdd?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");

  function hrefFor(tagId: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (tagId) params.set("tag", tagId);
    else params.delete("tag");
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  // With no tags and no add affordance, we have nothing useful to render.
  if (tags.length === 0 && !onAdd) return null;

  return (
    <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-2 pb-1">
        <TagChip name="all" href={hrefFor(null)} active={!activeTag} />
        {tags.map((t) => (
          <TagChip
            key={t.id}
            name={t.name}
            href={hrefFor(t.id)}
            active={activeTag === t.id}
            count={counts?.[t.id]}
          />
        ))}
        {onAdd ? (
          <button
            type="button"
            onClick={onAdd}
            aria-label="New tag"
            className="tappable inline-flex shrink-0 items-center gap-1 rounded-chip border border-dashed border-border bg-transparent px-3 py-1.5 text-[13px] font-medium lowercase text-text-muted hover:border-border-strong hover:text-text"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {tags.length === 0 ? "new" : null}
          </button>
        ) : null}
      </div>
    </div>
  );
}
