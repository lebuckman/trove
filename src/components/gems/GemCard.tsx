"use client";

import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Gem } from "@/lib/queries/types";
import { cn } from "@/lib/utils";

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 5 5 9-11" />
    </svg>
  );
}

type Props = {
  gem: Gem;
  /** When true, tap toggles selection instead of opening the gem. */
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  /** Set on the first few cards in a list so Next can eagerly load the
   *  LCP candidate. */
  priority?: boolean;
};

export function GemCard({
  gem,
  selectable,
  selected,
  onToggleSelect,
  priority,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const aspect = `${gem.width} / ${gem.height}`;

  function open() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("gem", gem.id);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleClick() {
    if (selectable) onToggleSelect?.();
    else open();
  }

  const selectionOverlay = selectable ? (
    <>
      <div
        className={cn(
          "absolute inset-0 rounded-card transition-colors",
          selected ? "ring-2 ring-gold ring-inset" : "ring-1 ring-transparent",
        )}
      />
      <div
        className={cn(
          "absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border",
          selected
            ? "border-gold bg-gold text-bg"
            : "border-white/40 bg-black/40 text-transparent backdrop-blur-sm",
        )}
      >
        <CheckIcon />
      </div>
    </>
  ) : null;

  return (
    <button
      type="button"
      onClick={handleClick}
      className="tappable group relative mb-3 block w-full overflow-hidden rounded-card border border-border bg-surface-2"
      style={{ aspectRatio: aspect }}
    >
      {gem.media_url ? (
        <Image
          src={gem.media_url}
          alt={gem.og_title ?? ""}
          fill
          sizes="(min-width: 1280px) 240px, (min-width: 640px) 320px, 45vw"
          className="object-cover"
          priority={priority}
        />
      ) : null}

      {gem.type === "video" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/15">
          <div className="rounded-full bg-black/55 p-2.5 text-white backdrop-blur-sm">
            <PlayIcon />
          </div>
        </div>
      ) : null}

      {selectionOverlay}
    </button>
  );
}
