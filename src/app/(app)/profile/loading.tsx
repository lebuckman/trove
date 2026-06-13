import { GridSkeleton } from "@/components/ui/skeletons";

// Profile fallback: avatar + name header, then a troves grid.
export default function Loading() {
  return (
    <>
      <header className="px-5 pt-14 pb-5 lg:px-10 lg:pt-16 lg:pb-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-surface-2" />
          <div>
            <div className="h-7 w-44 animate-pulse rounded-lg bg-surface-2 lg:h-8" />
            <div className="mt-2 h-4 w-32 animate-pulse rounded bg-surface-2/70" />
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 pb-8 lg:px-10">
        <GridSkeleton />
      </main>
    </>
  );
}
