import { PageHeader } from "@/components/layout/PageHeader";
import { TrovesGrid } from "@/components/troves/TrovesGrid";
import type { Trove } from "@/lib/queries/types";

// Dev-only: mirrors the profile page header + grid for layout tuning.
export function ProfileShellPreview({ troves }: { troves: Trove[] }) {
  return (
    <>
      <PageHeader
        title="liam buckman"
        subtitle={`${troves.length} troves · 24 gems`}
        leading={
          <div className="h-16 w-16 shrink-0 rounded-full bg-accent-soft lg:h-[72px] lg:w-[72px]" />
        }
        titleAction={
          <span className="flex h-7 w-7 items-center justify-center rounded-full text-text-subtle">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
          </span>
        }
      />
      <main className="flex-1 px-4 pb-8 lg:px-10">
        <TrovesGrid troves={troves} />
      </main>
    </>
  );
}
