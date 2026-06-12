"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { TagFilter } from "@/components/ui/TagFilter";
import { useSetGemList } from "@/components/gems/GemListContext";
import { GemMasonry } from "@/components/gems/GemMasonry";
import {
  GemsEmptyIcon,
  EmptyState,
  SearchEmptyIcon,
  TagEmptyIcon,
} from "@/components/ui/EmptyState";
import type { Gem, Tag } from "@/lib/queries/types";
import { filterGemsByTag } from "@/lib/queries/util";

/** Lower-cased concatenation of everything searchable on a gem. */
function searchHaystack(g: Gem): string {
  const tagNames = g.tags.map((t) => t.name).join(" ");
  return [
    g.description,
    g.og_title,
    g.og_description,
    g.og_site_name,
    g.url,
    tagNames,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function HomeBody({
  gems,
  tags,
  counts,
}: {
  gems: Gem[];
  tags: Tag[];
  counts: Record<string, number>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function openNewTag() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sheet", "new-tag");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function openCreate() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sheet", "create");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const tagId = searchParams.get("tag");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    const byTag = filterGemsByTag(gems, tagId);
    if (!q) return byTag;
    return byTag.filter((g) => searchHaystack(g).includes(q));
  }, [gems, tagId, q]);

  const filteredIds = useMemo(() => filtered.map((g) => g.id), [filtered]);
  useSetGemList(filteredIds);

  const libraryEmpty = gems.length === 0;
  const noResults = !libraryEmpty && filtered.length === 0;

  return (
    <>
      <PageHeader
        title="trove"
        subtitle={
          libraryEmpty
            ? "gems from every trove appear here"
            : `${filtered.length} gems across your troves`
        }
      />
      <main className="flex-1 px-5 pb-8">
        {libraryEmpty ? (
          <EmptyState
            icon={<GemsEmptyIcon />}
            title="no gems yet"
            description="stash images, videos, and links. everything you keep shows up here, searchable by description, tag, link, or title."
            action={{ label: "add your first gem", onClick: openCreate }}
          />
        ) : (
          <>
            <div className="mb-4">
              <SearchInput value={query} onChange={setQuery} />
            </div>
            <div className="mb-5">
              <div className="mb-1.5 flex items-center justify-between px-1">
                <span className="text-[12.5px] font-medium lowercase text-text-subtle">
                  tags
                </span>
                <Link
                  href="/tags"
                  aria-label="Manage tags"
                  className="tappable -mr-1 flex h-6 w-6 items-center justify-center rounded-full text-text-subtle hover:text-text"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              </div>
              <TagFilter tags={tags} counts={counts} onAdd={openNewTag} />
            </div>
            {noResults ? (
              q ? (
                <EmptyState
                  icon={<SearchEmptyIcon />}
                  title={`no matches for "${query.trim()}"`}
                  description="try a different word, or clear the search to browse everything."
                  action={{ label: "clear search", onClick: () => setQuery("") }}
                />
              ) : (
                <EmptyState
                  icon={<TagEmptyIcon />}
                  title="no gems with this tag"
                  description="try a different tag or clear the filter."
                  action={{ label: "clear filter", href: pathname }}
                />
              )
            ) : (
              <GemMasonry gems={filtered} />
            )}
          </>
        )}
      </main>
    </>
  );
}

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative flex items-center">
      <svg
        viewBox="0 0 24 24"
        className="pointer-events-none absolute left-4 h-5 w-5 text-text-subtle"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="search your gems…"
        className="w-full rounded-2xl border border-border bg-surface-2/60 py-3 pl-12 pr-12 text-[15px] text-text placeholder:text-text-subtle outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="tappable absolute right-3 flex h-7 w-7 items-center justify-center rounded-full bg-surface-3 text-text-muted"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
