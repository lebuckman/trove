import { TrovesGrid } from "@/components/troves/TrovesGrid";
import type { Trove } from "@/lib/queries/types";

// Dev-only: mirrors the profile page header + grid for layout tuning.
export function ProfileShellPreview({ troves }: { troves: Trove[] }) {
  return (
    <>
      <header className="px-5 pt-14 pb-5 lg:px-10 lg:pt-16 lg:pb-8">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4.5 20.5c1.5-3.4 4.2-5 7.5-5s6 1.6 7.5 5" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[28px] font-bold leading-[1.1] tracking-tight lowercase lg:text-[32px]">
                liam buckman
              </h1>
              <p className="mt-1 text-[14px] lowercase text-text-muted">
                {troves.length} troves · 24 gems
              </p>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 pb-8 lg:px-10">
        <TrovesGrid troves={troves} />
      </main>
    </>
  );
}
