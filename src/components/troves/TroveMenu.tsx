"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <circle cx="5" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="19" cy="12" r="1.7" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}
function SelectIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="m8 12 3 3 5-6" />
    </svg>
  );
}
function SortIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4v16M3 8l4-4 4 4" />
      <path d="M17 20V4M13 16l4 4 4-4" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
    </svg>
  );
}

function Row({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "tappable flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left",
        danger ? "text-danger hover:bg-danger/10" : "text-text hover:bg-surface-3/60",
      )}
    >
      <span className="opacity-75">{icon}</span>
      <span className="text-[14.5px] font-medium lowercase">{label}</span>
    </button>
  );
}

export function TroveMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  // Esc closes the popover. Effect declared up here, before any conditional
  // return, so hook ordering stays stable.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // In select mode the floating action pill handles cancel/delete —
  // the menu button steps aside.
  if (searchParams.get("mode") === "select") return null;

  function close() {
    setOpen(false);
  }

  function goToSheet(name: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sheet", name);
    close();
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function enterSelectMode() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", "select");
    close();
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Trove options"
        aria-haspopup="menu"
        aria-expanded={open}
        className="tappable flex h-10 w-10 items-center justify-center rounded-full text-text"
      >
        <MoreIcon />
      </button>

      <AnimatePresence>
        {open ? (
          <>
            {/* Invisible click-catcher to dismiss on outside tap. */}
            <div
              className="fixed inset-0 z-40"
              onClick={close}
              aria-hidden
            />
            <motion.div
              key="menu"
              role="menu"
              aria-label="Trove options"
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.13, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "top right" }}
              className="absolute right-0 top-11 z-40 w-[170px] rounded-2xl border border-border-strong bg-surface/95 p-1.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl"
            >
              <Row icon={<EditIcon />} label="edit" onClick={() => goToSheet("edit-trove")} />
              <Row icon={<SelectIcon />} label="select" onClick={enterSelectMode} />
              <Row icon={<SortIcon />} label="sort" onClick={() => goToSheet("sort")} />
              <Row icon={<TrashIcon />} label="delete" danger onClick={() => goToSheet("delete-trove")} />
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
