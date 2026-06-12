import { GemCard } from "./GemCard";
import type { Gem } from "@/lib/queries/types";

/**
 * Pure masonry. Renders nothing for an empty array — callers handle the
 * empty state with the appropriate <EmptyState /> for their context.
 */
export function GemMasonry({ gems }: { gems: Gem[] }) {
  if (gems.length === 0) return null;
  return (
    <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 xl:columns-5">
      {gems.map((g, i) => (
        <GemCard key={g.id} gem={g} priority={i < 6} />
      ))}
    </div>
  );
}
