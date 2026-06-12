"use client";

import { useMemo, useState } from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { GemCard } from "./GemCard";
import { SortableItem, useReorderSensors } from "@/components/dnd/sortable";
import { reorderGems } from "@/lib/actions/gems";
import { writeSort } from "@/lib/sort";
import type { Gem } from "@/lib/queries/types";

/**
 * Masonry with always-on manual reorder for a single trove. Dropping a
 * card persists the displayed order as positions and flips the trove's
 * sort preset to "custom". Callers should fall back to the plain
 * <GemMasonry /> when a tag filter is active — a filtered subset can't
 * define a full order.
 */
export function SortableGemMasonry({
  troveId,
  gems,
}: {
  troveId: string;
  gems: Gem[];
}) {
  const sensors = useReorderSensors();

  // Local order so the drop settles instantly; reset during render (not in
  // an effect) whenever the server data changes.
  const gemIds = useMemo(() => gems.map((g) => g.id), [gems]);
  const [order, setOrder] = useState(gemIds);
  const [baseIds, setBaseIds] = useState(gemIds);
  if (baseIds !== gemIds && baseIds.join() !== gemIds.join()) {
    setBaseIds(gemIds);
    setOrder(gemIds);
  }

  const byId = useMemo(() => new Map(gems.map((g) => [g.id, g])), [gems]);
  const display = order
    .map((id) => byId.get(id))
    .filter((g): g is Gem => Boolean(g));

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = order.indexOf(String(active.id));
    const to = order.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    const next = arrayMove(order, from, to);
    setOrder(next);
    writeSort(`trove/${troveId}`, "custom");
    void reorderGems(troveId, next);
  }

  if (display.length === 0) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={order} strategy={rectSortingStrategy}>
        <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 xl:columns-5">
          {display.map((g, i) => (
            <SortableItem key={g.id} id={g.id} className="mb-3 break-inside-avoid">
              <GemCard gem={g} priority={i < 6} />
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
