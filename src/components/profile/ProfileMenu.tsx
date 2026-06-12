"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { signOut } from "@/lib/actions/session";
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
function SortIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4v16M3 8l4-4 4 4" />
      <path d="M17 20V4M13 16l4 4 4-4" />
    </svg>
  );
}
function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
    </svg>
  );
}
function SignOutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
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

export function ProfileMenu({
  repoUrl,
  version,
}: {
  repoUrl: string;
  version: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    setOpen(false);
  }

  function goToSheet(name: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sheet", name);
    close();
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Profile options"
        aria-haspopup="menu"
        aria-expanded={open}
        className="tappable flex h-10 w-10 items-center justify-center rounded-full text-text"
      >
        <MoreIcon />
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <div className="fixed inset-0 z-40" onClick={close} aria-hidden />
            <motion.div
              key="menu"
              role="menu"
              aria-label="Profile options"
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.13, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "top right" }}
              className="absolute right-0 top-11 z-40 w-[200px] rounded-2xl border border-border-strong bg-surface/95 p-1.5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl"
            >
              <Row
                icon={<EditIcon />}
                label="edit profile"
                onClick={() => goToSheet("edit-profile")}
              />
              <Row
                icon={<SortIcon />}
                label="sort troves"
                onClick={() => goToSheet("sort")}
              />
              <Row
                icon={<GitHubIcon />}
                label="source on github"
                onClick={() => {
                  close();
                  window.open(repoUrl, "_blank", "noopener,noreferrer");
                }}
              />
              <Row
                icon={<SignOutIcon />}
                label={signingOut ? "signing out…" : "sign out"}
                danger
                onClick={() => startSignOut(() => signOut())}
              />
              <div className="mt-1 border-t border-border px-3 pb-1.5 pt-2 text-[11.5px] lowercase text-text-subtle">
                trove v{version}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
