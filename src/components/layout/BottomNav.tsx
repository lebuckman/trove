"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

// Active tabs fill in (solid) rather than recoloring, so the indicator
// doesn't compete with the teal center button.
function HomeIcon({ className, active }: { className?: string; active?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={active ? "currentColor" : "none"}
      strokeWidth={1.7}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7.5" height="9.5" rx="2" />
      <rect x="13.5" y="3" width="7.5" height="6" rx="2" />
      <rect x="3" y="15.5" width="7.5" height="5.5" rx="2" />
      <rect x="13.5" y="12" width="7.5" height="9" rx="2" />
    </svg>
  );
}

function ProfileIcon({ className, active }: { className?: string; active?: boolean }) {
  if (active) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor">
        <circle cx="12" cy="8" r="4.2" />
        <path d="M3.8 20.5c1.4-3.8 4.4-5.6 8.2-5.6s6.8 1.8 8.2 5.6a1 1 0 0 1-.94 1.4H4.74a1 1 0 0 1-.94-1.4z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" strokeWidth={1.7} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5c1.5-3.4 4.2-5 7.5-5s6 1.6 7.5 5" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" strokeWidth={2.4} stroke="currentColor" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isHome = pathname === "/" || pathname.startsWith("/troves");
  const isProfile = pathname.startsWith("/profile");

  // While a trove is in select mode, the SelectActionBar takes over the
  // bottom slot — hide the nav so they don't overlap.
  const inSelect =
    pathname.startsWith("/troves/") && searchParams.get("mode") === "select";
  if (inSelect) return null;

  function openCreate() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sheet", "create");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  // Floating pill, capped width on every viewport so it reads as a
  // deliberate element rather than a stretched bar.
  return (
    <nav
      className="fixed inset-x-0 bottom-[calc(12px+env(safe-area-inset-bottom))] z-40 px-5"
      aria-label="Primary"
    >
      <div className="surface-blur mx-auto flex h-[64px] w-full max-w-xs items-center justify-around rounded-full border border-border px-4 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)]">
        <Link
          href="/"
          aria-label="Home"
          aria-current={isHome && !isProfile ? "page" : undefined}
          className={cn(
            "tappable flex h-12 w-14 items-center justify-center rounded-2xl transition-colors",
            isHome && !isProfile ? "text-text" : "text-text-subtle",
          )}
        >
          <HomeIcon className="h-6.5 w-6.5" active={isHome && !isProfile} />
        </Link>

        <button
          type="button"
          onClick={openCreate}
          aria-label="Create"
          className="tappable relative -mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-bg shadow-[0_10px_28px_-6px_rgba(45,212,191,0.6)] ring-1 ring-accent-strong/30 hover:bg-accent-strong"
        >
          <PlusIcon className="h-6.5 w-6.5" />
        </button>

        <Link
          href="/profile"
          aria-label="Profile"
          aria-current={isProfile ? "page" : undefined}
          className={cn(
            "tappable flex h-12 w-14 items-center justify-center rounded-2xl transition-colors",
            isProfile ? "text-text" : "text-text-subtle",
          )}
        >
          <ProfileIcon className="h-6.5 w-6.5" active={isProfile} />
        </Link>
      </div>
    </nav>
  );
}
