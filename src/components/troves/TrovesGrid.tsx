"use client";

import { useMemo, useState } from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { TroveCard } from "./TroveCard";
import { SortableItem, useReorderSensors } from "@/components/dnd/sortable";
import { reorderTroves } from "@/lib/actions/troves";
import { sortTroves, useSort, writeSort } from "@/lib/sort";
import type { Trove } from "@/lib/queries/types";

/**
 * Troves grid with always-on manual reorder: cards are draggable in any
 * sort; dropping a card out of order persists the displayed order as
 * positions and flips the sort preset to "custom".
 */
export function TrovesGrid({ troves }: { troves: Trove[] }) {
  const sortKey = useSort("troves");
  const sensors = useReorderSensors();

  const sorted = useMemo(() => sortTroves(troves, sortKey), [troves, sortKey]);
  // Local order so the drop settles instantly; reset during render (not in
  // an effect) whenever the server data or sort preset changes.
  const sortedIds = useMemo(() => sorted.map((t) => t.id), [sorted]);
  const [order, setOrder] = useState(sortedIds);
  const [baseIds, setBaseIds] = useState(sortedIds);
  if (baseIds !== sortedIds && baseIds.join() !== sortedIds.join()) {
    setBaseIds(sortedIds);
    setOrder(sortedIds);
  }

  const byId = useMemo(() => new Map(troves.map((t) => [t.id, t])), [troves]);
  const display = order
    .map((id) => byId.get(id))
    .filter((t): t is Trove => Boolean(t));

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = order.indexOf(String(active.id));
    const to = order.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    const next = arrayMove(order, from, to);
    setOrder(next);
    writeSort("troves", "custom");
    void reorderTroves(next);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={order} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {display.map((t, i) => (
            <SortableItem key={t.id} id={t.id}>
              <TroveCard trove={t} priority={i < 4} />
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
