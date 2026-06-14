"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  AnimatePresence,
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "motion/react";
import { fetchGemById } from "@/lib/queries/client";
import { deleteGem, updateGemDescription } from "@/lib/actions/gems";
import { useGemNeighbors } from "./GemListContext";
import type { Gem } from "@/lib/queries/types";
import { cn } from "@/lib/utils";

// Dismiss / nav thresholds. Either offset OR velocity is enough.
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 500;
const NAV_DISTANCE = 80;
const NAV_VELOCITY = 500;

export function GemLightbox({ gemId }: { gemId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [gem, setGem] = useState<Gem | null>(null);
  // Direction of the last horizontal navigation, used to drive enter/exit
  // slide direction on the inner content. -1 = went to next, +1 = went to prev.
  const [navDirection, setNavDirection] = useState<-1 | 0 | 1>(0);

  const { prevId, nextId } = useGemNeighbors(gemId);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // As the user drags, the backdrop fades and the content scales down a
  // touch so the gesture feels grounded. Both axes contribute; useTransform
  // recomputes whenever either MotionValue updates.
  const backdropOpacity = useTransform(y, [0, 300], [1, 0.35], { clamp: true });
  const contentScale = useTransform(() => {
    const dist = Math.hypot(x.get(), y.get());
    return Math.max(0.92, 1 - dist / 1800);
  });

  const dragControls = useDragControls();

  useEffect(() => {
    let cancelled = false;
    fetchGemById(gemId).then((g) => {
      if (!cancelled) setGem(g);
    });
    return () => {
      cancelled = true;
    };
  }, [gemId]);

  const close = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("gem");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [router, pathname, searchParams]);

  const navigateTo = useCallback(
    (id: string, direction: -1 | 1) => {
      setNavDirection(direction);
      const params = new URLSearchParams(searchParams.toString());
      params.set("gem", id);
      // Replace so swiping doesn't accumulate history entries.
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  // Smoothly settle drag offsets back to center when the gem changes
  // (i.e. just after a swipe commits). Springing — rather than snapping —
  // lets the inner content's enter slide blend with the outer recovery.
  useEffect(() => {
    const spring = { type: "spring" as const, damping: 32, stiffness: 380 };
    const cx = animate(x, 0, spring);
    const cy = animate(y, 0, spring);
    return () => {
      cx.stop();
      cy.stop();
    };
  }, [gemId, x, y]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't hijack keys while the user is in the description textarea.
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "TEXTAREA" || t.tagName === "INPUT")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft" && prevId) navigateTo(prevId, 1);
      else if (e.key === "ArrowRight" && nextId) navigateTo(nextId, -1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [close, navigateTo, prevId, nextId]);

  async function handleDelete() {
    if (!gem) return;
    try {
      await deleteGem(gem.id);
    } catch {
      /* no-op; keep lightbox open if delete failed */
      return;
    }
    close();
  }

  function openMoveSheet() {
    if (!gem) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("gem");
    params.set("sheet", "move");
    params.set("gemId", gem.id);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function openEditTags() {
    if (!gem) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("sheet", "edit-gem-tags");
    params.set("gemId", gem.id);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function onDragEnd(_: PointerEvent, info: PanInfo) {
    const { offset, velocity } = info;
    // Vertical wins if it dominated.
    if (Math.abs(offset.y) > Math.abs(offset.x)) {
      if (offset.y > DISMISS_DISTANCE || velocity.y > DISMISS_VELOCITY) {
        close();
        return;
      }
    } else {
      // Horizontal: navigate if past threshold AND a neighbor exists.
      if ((offset.x < -NAV_DISTANCE || velocity.x < -NAV_VELOCITY) && nextId) {
        navigateTo(nextId, -1);
        return;
      }
      if ((offset.x > NAV_DISTANCE || velocity.x > NAV_VELOCITY) && prevId) {
        navigateTo(prevId, 1);
        return;
      }
    }
    animate(x, 0, { type: "spring", damping: 28, stiffness: 320 });
    animate(y, 0, { type: "spring", damping: 28, stiffness: 320 });
  }

  // Only the media area starts a drag — chrome buttons and the textarea
  // in the detail panel keep their normal pointer behavior.
  function startDrag(e: React.PointerEvent) {
    dragControls.start(e);
  }

  return (
    <div className="fixed inset-0 z-50">
      <motion.button
        type="button"
        aria-label="Close"
        onClick={close}
        style={{ opacity: backdropOpacity }}
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        className="absolute inset-0 flex flex-col md:flex-row"
        style={{ x, y, scale: contentScale }}
        drag
        dragListener={false}
        dragControls={dragControls}
        dragDirectionLock
        dragMomentum={false}
        dragElastic={0.6}
        onDragEnd={onDragEnd}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Media column: chrome bar + media. On desktop the detail panel
            moves out of this column into a fixed right rail. */}
        <div className="group/media flex min-h-0 min-w-0 flex-1 flex-col">
          <ChromeBar
            onClose={close}
            onDelete={handleDelete}
            onMove={openMoveSheet}
          />

          <div
            className="relative min-h-0 flex-1 overflow-y-auto"
            onPointerDown={startDrag}
          >
            <div className="flex min-h-full items-center justify-center p-4">
              <AnimatePresence mode="wait" custom={navDirection} initial={false}>
                {gem ? (
                  <motion.div
                    key={gem.id}
                    custom={navDirection}
                    variants={{
                      // Direction convention: -1 = went forward (swipe left),
                      // +1 = went back (swipe right). New content enters from
                      // the opposite side of the swipe; old exits along it.
                      enter: (d: number) => ({ x: -d * 80, opacity: 0 }),
                      center: { x: 0, opacity: 1 },
                      exit: (d: number) => ({ x: d * 80, opacity: 0 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="flex w-full items-center justify-center"
                  >
                    {gem.type === "link" ? (
                      <LinkView gem={gem} />
                    ) : (
                      <MediaView gem={gem} />
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {/* Desktop hover arrows at the media's edges. */}
            <HoverArrow
              side="left"
              visible={Boolean(prevId)}
              onClick={() => prevId && navigateTo(prevId, 1)}
            />
            <HoverArrow
              side="right"
              visible={Boolean(nextId)}
              onClick={() => nextId && navigateTo(nextId, -1)}
            />
          </div>

          {/* Mobile: detail panel docked at the bottom. Keyed by gem id so
              its description state resets when swiping between gems. */}
          {gem ? (
            <div className="md:hidden">
              <DetailPanel
                key={gem.id}
                gem={gem}
                tags={gem.tags}
                onAddTag={openEditTags}
              />
            </div>
          ) : null}
        </div>

        {/* Desktop: the entire detail panel as a fixed right column. The
            panel is bottom-anchored and scrolls upward as the description
            grows. */}
        {gem ? (
          <div className="surface-blur hidden w-[380px] shrink-0 overflow-y-auto border-l border-border md:flex md:flex-col md:justify-end">
            <DetailPanel
              key={gem.id}
              gem={gem}
              tags={gem.tags}
              onAddTag={openEditTags}
            />
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}

// ---------- chrome ----------

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <circle cx="5" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="19" cy="12" r="1.7" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
    </svg>
  );
}
function ChromeMoveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h6l2 2h10v9a2 2 0 0 1-2 2H3z" />
      <path d="M14 12h6m-3-3 3 3-3 3" />
    </svg>
  );
}

/**
 * Top chrome: close alone in the top-right; delete + move relocated into a
 * `…` overflow popover in the top-left. Delete keeps the two-tap arm
 * pattern inside the menu.
 */
function ChromeBar({
  onClose,
  onDelete,
  onMove,
}: {
  onClose: () => void;
  onDelete: () => void;
  onMove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [armed, setArmed] = useState(false);
  const armTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function closeMenu() {
    setOpen(false);
    setArmed(false);
    if (armTimer.current) clearTimeout(armTimer.current);
  }

  function handleDeleteTap() {
    if (armed) {
      closeMenu();
      onDelete();
      return;
    }
    setArmed(true);
    if (armTimer.current) clearTimeout(armTimer.current);
    armTimer.current = setTimeout(() => setArmed(false), 2400);
  }

  useEffect(() => {
    return () => {
      if (armTimer.current) clearTimeout(armTimer.current);
    };
  }, []);

  return (
    <div className="flex items-center justify-between px-3 pb-2 pt-[calc(env(safe-area-inset-top)+48px)] md:pt-4">
      <div className="relative">
        <button
          type="button"
          onClick={() => (open ? closeMenu() : setOpen(true))}
          aria-label="More actions"
          aria-haspopup="menu"
          aria-expanded={open}
          className="tappable flex h-9 w-9 items-center justify-center rounded-full bg-surface/80 text-text-muted"
        >
          <MoreIcon />
        </button>
        <AnimatePresence>
          {open ? (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={closeMenu}
                aria-hidden
              />
              <motion.div
                key="gem-menu"
                role="menu"
                aria-label="Gem actions"
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.13, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "top left" }}
                className="absolute left-0 top-11 z-40 w-[200px] rounded-2xl border border-border-strong bg-surface/95 p-1.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    closeMenu();
                    onMove();
                  }}
                  className="tappable flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-text hover:bg-surface-3/60"
                >
                  <span className="opacity-75">
                    <ChromeMoveIcon />
                  </span>
                  <span className="text-[14.5px] font-medium lowercase">
                    move
                  </span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleDeleteTap}
                  className={cn(
                    "tappable flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left",
                    armed ? "bg-danger text-bg" : "text-danger hover:bg-danger/10",
                  )}
                >
                  <span className="opacity-90">
                    <TrashIcon />
                  </span>
                  <span className="text-[14.5px] font-medium lowercase">
                    {armed ? "tap again to delete" : "delete"}
                  </span>
                </button>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="tappable flex h-9 w-9 items-center justify-center rounded-full bg-surface/80 text-text"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

// ---------- prev / next arrows ----------
//
// Always visible on touch (swipe can be finicky depending on media size);
// on desktop they stay hidden until the media is hovered.

function HoverArrow({
  side,
  visible,
  onClick,
}: {
  side: "left" | "right";
  visible: boolean;
  onClick: () => void;
}) {
  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous gem" : "Next gem"}
      className={cn(
        "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface/85 text-text backdrop-blur transition-opacity duration-150",
        "md:opacity-0 md:group-hover/media:opacity-100 md:hover:!opacity-100",
        side === "left" ? "left-3 md:left-4" : "right-3 md:right-4",
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className={cn("h-5 w-5", side === "right" && "rotate-180")}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>
  );
}

// ---------- media area ----------

function MediaView({ gem }: { gem: Gem }) {
  if (!gem.media_url) return null;
  if (gem.type === "video") {
    // w-full upscales small clips to the media area; max-h caps tall ones.
    return (
      <video
        src={gem.media_url}
        controls
        className="max-h-[56vh] w-full max-w-full rounded-card object-contain md:max-h-[80vh]"
      />
    );
  }
  // Sized container + fill/object-contain so small media (e.g. gifs) scale
  // up to fill the area consistently with larger images, keeping aspect.
  // Heights stay within the available area so the scroll container never
  // activates and steals the drag/swipe gesture.
  return (
    <div className="relative h-[56vh] w-full md:h-[80vh]">
      <Image
        src={gem.media_url}
        alt=""
        fill
        sizes="(min-width: 768px) 65vw, 100vw"
        className="rounded-card object-contain"
        priority
        unoptimized={gem.mime_type === "image/gif"}
      />
    </div>
  );
}

// ---------- link area ----------

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

function LinkView({ gem }: { gem: Gem }) {
  return (
    <div className="flex w-full max-w-md flex-col gap-4 md:max-w-3xl">
      <div className="overflow-hidden rounded-card border border-border bg-surface-2/80">
        {gem.media_url ? (
          <div className="relative aspect-[16/9] w-full bg-surface-3">
            <Image
              src={gem.media_url}
              alt=""
              fill
              sizes="(min-width: 768px) 768px, 600px"
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="p-4 md:p-5">
          {gem.og_site_name ? (
            <div className="text-[12px] font-medium lowercase text-text-subtle md:text-[13px]">
              {gem.og_site_name}
            </div>
          ) : null}
          {gem.og_title ? (
            <div className="mt-1 line-clamp-2 text-[17px] font-semibold leading-snug text-text md:text-[20px]">
              {gem.og_title}
            </div>
          ) : null}
          {gem.og_description ? (
            <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-text-muted md:text-[14.5px]">
              {gem.og_description}
            </p>
          ) : null}
        </div>
      </div>

      {gem.url ? (
        <a
          href={gem.url}
          target="_blank"
          rel="noopener noreferrer"
          className="tappable inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent text-[15px] font-semibold lowercase text-bg"
        >
          open link
          <ExternalIcon />
        </a>
      ) : null}
    </div>
  );
}

// ---------- detail panel (bottom on mobile, right rail on desktop) ----------

function DetailPanel({
  gem,
  tags,
  onAddTag,
}: {
  gem: Gem;
  tags: { id: string; name: string }[];
  onAddTag: () => void;
}) {
  const initial = gem.description ?? "";
  const [description, setDescription] = useState<string>(initial);
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-grow to fit content. On desktop the bottom-anchored rail lets this
  // grow upward and fill the sidebar; on mobile a max-height caps it so it
  // never swallows the media, scrolling internally past the cap.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [description]);

  function commit() {
    if (description === initial) return;
    // Fire-and-forget; lightbox stays usable while the request lands.
    void updateGemDescription(gem.id, description);
  }

  return (
    <div className="surface-blur border-t border-border px-5 pt-4 pb-[calc(18px+env(safe-area-inset-bottom))] md:border-t-0 md:bg-transparent md:pb-6 md:[backdrop-filter:none]">
      <textarea
        ref={ref}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={commit}
        placeholder="add a description…"
        rows={2}
        className="max-h-[160px] w-full resize-none overflow-y-auto bg-transparent px-0 text-[16px] leading-relaxed text-text placeholder:text-text-subtle outline-none md:max-h-none md:overflow-y-visible"
      />

      <div className="mt-3 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span
            key={t.id}
            className="rounded-chip border border-border bg-surface-2/60 px-2.5 py-1 text-[12px] font-medium lowercase text-text-muted"
          >
            {t.name}
          </span>
        ))}
        <button
          type="button"
          onClick={onAddTag}
          className="tappable inline-flex items-center gap-1 rounded-chip border border-dashed border-border bg-transparent px-2.5 py-1 text-[12px] font-medium lowercase text-text-muted hover:border-border-strong hover:text-text"
        >
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {tags.length === 0 ? "add tag" : null}
        </button>
      </div>
    </div>
  );
}
