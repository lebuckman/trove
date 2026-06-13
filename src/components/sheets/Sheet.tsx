"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { animate, motion, useMotionValue, type PanInfo } from "motion/react";
import { useIsDesktop } from "@/lib/useMediaQuery";

export function useCloseSheet() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return function close() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("sheet");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
}

const DISMISS_DISTANCE = 110;
const DISMISS_VELOCITY = 600;

/**
 * Overlay primitive. Branches on breakpoint:
 * - < md: bottom-anchored sheet with rubber-band drag-to-dismiss.
 * - >= md: centered modal, capped width, scale-in, no drag.
 * The inner content renders identically in both.
 */
export function Sheet({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  const close = useCloseSheet();
  const isDesktop = useIsDesktop();

  // Esc key + lock body scroll while sheet is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [close]);

  return (
    <div className="fixed inset-0 z-50">
      <motion.button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
      />
      {isDesktop ? (
        <CenteredModal title={title} onClose={close}>
          {children}
        </CenteredModal>
      ) : (
        <BottomSheet title={title} onClose={close}>
          {children}
        </BottomSheet>
      )}
    </div>
  );
}

function BottomSheet({
  title,
  onClose,
  children,
}: {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const y = useMotionValue(0);

  function onDragEnd(_: PointerEvent, info: PanInfo) {
    if (
      info.offset.y > DISMISS_DISTANCE ||
      info.velocity.y > DISMISS_VELOCITY
    ) {
      onClose();
      return;
    }
    animate(y, 0, { type: "spring", damping: 30, stiffness: 360 });
  }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="surface-blur absolute inset-x-0 bottom-0 mx-auto flex max-h-[88dvh] max-w-2xl flex-col rounded-t-[28px] border border-b-0 border-border-strong bg-surface/85 shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.6)]"
      style={{ y }}
      drag="y"
      dragDirectionLock
      dragConstraints={{ top: 0 }}
      dragElastic={{ top: 0, bottom: 0.6 }}
      dragMomentum={false}
      onDragEnd={onDragEnd}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 32, stiffness: 340, mass: 0.9 }}
    >
      <div className="flex shrink-0 justify-center pt-3 pb-1">
        <div className="h-1.5 w-10 rounded-full bg-border-strong" />
      </div>
      {title ? (
        <div className="shrink-0 px-6 pt-2 pb-4">
          <h2 className="text-[20px] font-bold lowercase">{title}</h2>
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[calc(24px+env(safe-area-inset-bottom))]">
        {children}
      </div>
    </motion.div>
  );
}

function CenteredModal({
  title,
  onClose,
  children,
}: {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    // This wrapper sits above the backdrop, so it must handle outside
    // clicks itself — closing only when the click lands on the padding
    // area, not on the modal.
    <div
      className="absolute inset-0 flex items-center justify-center p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="surface-blur flex max-h-[82dvh] w-full max-w-md flex-col rounded-sheet border border-border-strong bg-surface/85 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.7)]"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 6 }}
        transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
      >
        {title ? (
          <div className="shrink-0 px-6 pt-5 pb-4">
            <h2 className="text-[20px] font-bold lowercase">{title}</h2>
          </div>
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-1">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
