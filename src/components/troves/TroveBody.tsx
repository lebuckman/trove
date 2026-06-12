"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSetGemList } from "@/components/gems/GemListContext";
import { GemMasonry } from "@/components/gems/GemMasonry";
import { SortableGemMasonry } from "@/components/gems/SortableGemMasonry";
import { TagFilter } from "@/components/ui/TagFilter";
import {
  GemsEmptyIcon,
  EmptyState,
  TagEmptyIcon,
} from "@/components/ui/EmptyState";
import type { Gem, Tag } from "@/lib/queries/types";
import { filterGemsByTag } from "@/lib/queries/util";
import { sortGems, useSort } from "@/lib/sort";

/**
 * View-mode body for a trove: tag filter + sorted masonry.
 * Select mode is rendered by a separate component at the page level.
 */
export function TroveBody({
  troveId,
  gems,
  tags,
}: {
  troveId: string;
  gems: Gem[];
  tags: Tag[];
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tagId = searchParams.get("tag");
  const sortKey = useSort(`trove/${troveId}`);

  const filtered = useMemo(() => {
    const byTag = filterGemsByTag(gems, tagId);
    return sortGems(byTag, sortKey);
  }, [gems, tagId, sortKey]);

  const filteredIds = useMemo(() => filtered.map((g) => g.id), [filtered]);
  useSetGemList(filteredIds);

  const troveIsEmpty = gems.length === 0;
  const filteredOut = !troveIsEmpty && filtered.length === 0;

  return (
    <>
      {tags.length > 0 ? (
        <div className="mb-5">
          <TagFilter tags={tags} />
        </div>
      ) : null}

      {troveIsEmpty ? (
        <EmptyState
          icon={<GemsEmptyIcon />}
          title="this trove is empty"
          description="add a photo, video, or link to get started."
          action={{
            label: "add gem",
            href: `${pathname}?sheet=create`,
          }}
        />
      ) : filteredOut ? (
        <EmptyState
          icon={<TagEmptyIcon />}
          title="no gems with this tag"
          description="try a different tag or clear the filter to see everything in this trove."
          action={{ label: "clear filter", href: pathname }}
        />
      ) : tagId ? (
        // A filtered subset can't define a full order — plain masonry.
        <GemMasonry gems={filtered} />
      ) : (
        <SortableGemMasonry troveId={troveId} gems={filtered} />
      )}
    </>
  );
}
