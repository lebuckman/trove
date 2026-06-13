/** Shared shimmer building blocks for route-level loading.tsx files. */

function Block({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-surface-2 ${className ?? ""}`} />;
}

/** Large-title page header placeholder (home / profile / tags). */
export function HeaderSkeleton({ compact }: { compact?: boolean }) {
  return (
    <header
      className={
        compact
          ? "px-5 pt-2 pb-5 lg:px-10 lg:pb-7"
          : "px-5 pt-14 pb-5 lg:px-10 lg:pt-16 lg:pb-8"
      }
    >
      <Block className="h-9 w-44 lg:h-12 lg:w-64" />
      <Block className="mt-3 h-4 w-56 lg:h-4.5 lg:w-72" />
    </header>
  );
}

/** Home: search field + tag chips + masonry. */
export function HomeSkeleton() {
  return (
    <main className="flex-1 px-5 pb-8 lg:px-10">
      <Block className="mb-4 h-12 max-w-2xl lg:mb-6 lg:h-14 lg:max-w-3xl" />
      <div className="mb-5 flex gap-2 lg:mb-7 lg:gap-2.5">
        {["w-12", "w-20", "w-16", "w-24", "w-14"].map((w, i) => (
          <Block key={i} className={`h-8 rounded-chip lg:h-9 ${w}`} />
        ))}
      </div>
      <MasonrySkeleton />
    </main>
  );
}

/** Sticky chrome bar placeholder with a back-chevron disc. */
export function TopBarSkeleton() {
  return (
    <div className="px-2 pt-5 lg:px-5">
      <div className="flex h-12 items-center">
        <div className="h-9 w-9 animate-pulse rounded-full bg-surface-2" />
      </div>
    </div>
  );
}

/** Masonry shimmer columns (gems). */
export function MasonrySkeleton() {
  const heights = [
    220, 300, 180, 260, 200, 320, 240, 190, 280, 210, 300, 230, 250, 200, 290,
  ];
  return (
    <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-3 lg:gap-5 xl:columns-4">
      {heights.map((h, i) => (
        <div
          key={i}
          className="mb-3 animate-pulse rounded-card bg-surface-2"
          style={{ height: h }}
        />
      ))}
    </div>
  );
}

/** Grid of 3:4 cover cards (troves). */
export function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[3/4] animate-pulse rounded-card bg-surface-2"
        />
      ))}
    </div>
  );
}

/** Stacked list rows (tags). */
export function ListSkeleton() {
  return (
    <div className="flex max-w-xl flex-col gap-1.5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-[52px] animate-pulse rounded-2xl bg-surface-2"
        />
      ))}
    </div>
  );
}
