"use client";

import { useMemo } from "react";
import { TroveCard } from "./TroveCard";
import { sortTroves, useSort } from "@/lib/sort";
import type { Trove } from "@/lib/queries/types";

export function TrovesGrid({ troves }: { troves: Trove[] }) {
  const sortKey = useSort("troves");
  const sorted = useMemo(() => sortTroves(troves, sortKey), [troves, sortKey]);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {sorted.map((t, i) => (
        <TroveCard key={t.id} trove={t} priority={i < 4} />
      ))}
    </div>
  );
}
