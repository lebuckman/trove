"use client";

import { usePathname } from "next/navigation";
import { Sheet, useCloseSheet } from "./Sheet";
import {
  scopeForPathname,
  useSort,
  writeSort,
  type SortKey,
} from "@/lib/sort";
import { cn } from "@/lib/utils";

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 5 5 9-11" />
    </svg>
  );
}

/** Context-aware sort: pins on a trove page, troves on the home grid. */
export function SortSheet() {
  const close = useCloseSheet();
  const pathname = usePathname();
  const subject = pathname.startsWith("/troves/") ? "gems" : "troves";
  const scope = scopeForPathname(pathname);
  const current = useSort(scope);

  function pick(value: SortKey) {
    writeSort(scope, value);
    close();
  }

  const options: { value: SortKey; label: string }[] = [
    { value: "newest", label: "newest first" },
    { value: "oldest", label: "oldest first" },
    { value: "alpha", label: "alphabetical" },
    // "custom" follows your manual order; dragging a card switches to it.
    { value: "custom", label: "manual" },
  ];

  return (
    <Sheet title={`sort ${subject}`}>
      <div className="flex flex-col gap-2 pb-2">
        {options.map((o) => {
          const active = o.value === current;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => pick(o.value)}
              className={cn(
                "tappable flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left",
                active
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border bg-surface-2/70",
              )}
            >
              <span className="text-[15px] font-semibold lowercase">
                {o.label}
              </span>
              {active ? <CheckIcon /> : null}
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}
