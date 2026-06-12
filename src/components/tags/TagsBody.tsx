"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { TagWithCount } from "@/lib/queries/tags";

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
    </svg>
  );
}

export function TagsBody({ tags }: { tags: TagWithCount[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigate(sheet: "edit-tag" | "delete-tag", tagId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sheet", sheet);
    params.set("tagId", tagId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {tags.map((t) => (
        <li
          key={t.id}
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface-2/70 px-4 py-2.5"
        >
          <span className="min-w-0 flex-1 truncate text-[15px] font-semibold lowercase text-text">
            {t.name}
          </span>
          <span className="shrink-0 rounded-full bg-surface-3/70 px-2 py-0.5 text-[11.5px] font-medium tabular-nums lowercase text-text-subtle">
            {t.count}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => navigate("edit-tag", t.id)}
              aria-label={`Rename ${t.name}`}
              className="tappable flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-surface-3/80 hover:text-text"
            >
              <PencilIcon />
            </button>
            <button
              type="button"
              onClick={() => navigate("delete-tag", t.id)}
              aria-label={`Delete ${t.name}`}
              className="tappable flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-danger/15 hover:text-danger"
            >
              <TrashIcon />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
