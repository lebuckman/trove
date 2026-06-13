"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { GemCard } from "@/components/gems/GemCard";
import { Spinner } from "@/components/ui/Spinner";
import { GemsEmptyIcon, EmptyState } from "@/components/ui/EmptyState";
import { bulkDeleteGems } from "@/lib/actions/gems";
import type { Gem } from "@/lib/queries/types";
import { cn } from "@/lib/utils";

/**
 * Self-contained select mode for a trove. Owns its own chrome (sticky
 * simplified header, no tag filter or description) and a floating icon-only
 * action pill at the bottom. The parent page mounts this whenever
 * ?mode=select is on the URL and skips the regular TopBar + PageHeader.
 */
export function SelectableTroveView({ gems }: { gems: Gem[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  function exitMode() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("mode");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === gems.length) setSelected(new Set());
    else setSelected(new Set(gems.map((g) => g.id)));
  }

  function moveSelected() {
    if (busy || selected.size === 0) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("mode");
    params.set("sheet", "move");
    params.set("gemIds", Array.from(selected).join(","));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  async function deleteSelected() {
    if (busy || selected.size === 0) return;
    setBusy(true);
    try {
      await bulkDeleteGems(Array.from(selected));
      exitMode();
    } catch {
      setBusy(false);
    }
  }

  const count = selected.size;
  const allSelected = count > 0 && count === gems.length;

  return (
    <>
      <SelectHeader
        allSelected={allSelected}
        canSelectAll={gems.length > 0}
        onExit={exitMode}
        onSelectAll={selectAll}
      />
      <main className="flex-1 px-5 pt-4 pb-32 lg:px-10">
        {gems.length === 0 ? (
          <EmptyState
            icon={<GemsEmptyIcon />}
            title="nothing to select"
            description="this trove has no gems yet."
            action={{ label: "exit select mode", onClick: exitMode }}
          />
        ) : (
          <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-3 lg:gap-5 xl:columns-4">
            {gems.map((g, i) => (
              <GemCard
                key={g.id}
                gem={g}
                selectable
                selected={selected.has(g.id)}
                onToggleSelect={() => toggle(g.id)}
                priority={i < 6}
              />
            ))}
          </div>
        )}
      </main>
      <FloatingActionPill
        count={count}
        busy={busy}
        onMove={moveSelected}
        onDelete={deleteSelected}
      />
    </>
  );
}

// ---------- header ----------

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function SelectHeader({
  allSelected,
  canSelectAll,
  onExit,
  onSelectAll,
}: {
  allSelected: boolean;
  canSelectAll: boolean;
  onExit: () => void;
  onSelectAll: () => void;
}) {
  return (
    <header className="surface-blur sticky top-0 z-30 pt-5">
      <div className="flex h-12 items-center justify-between px-3 lg:h-14 lg:px-8">
        <button
          type="button"
          onClick={onExit}
          aria-label="Exit select mode"
          className="tappable flex h-11 w-11 items-center justify-center rounded-full text-text lg:h-12 lg:w-12"
        >
          <BackIcon />
        </button>

        <button
          type="button"
          onClick={onSelectAll}
          disabled={!canSelectAll}
          className="tappable rounded-full px-3 py-1.5 text-[13.5px] font-semibold lowercase text-gold disabled:opacity-40 lg:px-4 lg:text-[15px]"
        >
          {allSelected ? "deselect" : "select all"}
        </button>
      </div>
    </header>
  );
}

// ---------- floating action pill ----------

function PillMoveIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7h6l2 2h10v9a2 2 0 0 1-2 2H3z" />
      <path d="M14 12h6m-3-3 3 3-3 3" />
    </svg>
  );
}

function PillTrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
    </svg>
  );
}

function FloatingActionPill({
  count,
  busy,
  onMove,
  onDelete,
}: {
  count: number;
  busy: boolean;
  onMove: () => void;
  onDelete: () => void;
}) {
  const hasSelection = count > 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", damping: 26, stiffness: 320 }}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[calc(20px+env(safe-area-inset-bottom))]"
    >
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border-strong bg-surface/95 p-1.5 pl-4 shadow-[0_12px_36px_-10px_rgba(0,0,0,0.7)] backdrop-blur-xl lg:gap-1.5 lg:pl-5">
        <div className="pr-1 text-[13.5px] font-semibold lowercase text-text-muted tabular-nums lg:text-[15px]">
          {count} selected
        </div>
        <div className="mx-1 h-6 w-px bg-border lg:h-7" />
        <button
          type="button"
          onClick={onMove}
          disabled={busy || !hasSelection}
          aria-label="Move selected"
          className={cn(
            "tappable flex h-11 w-11 items-center justify-center rounded-full text-text lg:h-12 lg:w-12",
            "hover:bg-surface-3/80 disabled:opacity-40",
          )}
        >
          <PillMoveIcon />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy || !hasSelection}
          aria-label="Delete selected"
          className={cn(
            "tappable flex h-11 w-11 items-center justify-center rounded-full text-danger lg:h-12 lg:w-12",
            "hover:bg-danger/15 disabled:opacity-40",
          )}
        >
          {busy ? <Spinner className="text-danger" /> : <PillTrashIcon />}
        </button>
      </div>
    </motion.div>
  );
}
