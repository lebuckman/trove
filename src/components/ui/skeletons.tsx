/** Shared shimmer building blocks for route-level loading.tsx files.
 *  Header geometry mirrors PageHeader so the title doesn't jump when real
 *  content arrives. */

function Block({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-surface-2 ${className ?? ""}`} />;
}

/** Page header placeholder: optional floating back chevron + title + subtitle. */
export function HeaderSkeleton({
  back,
  leadingAvatar,
  narrow,
}: {
  back?: boolean;
  leadingAvatar?: boolean;
  narrow?: boolean;
}) {
  return (
    <header
      className={
        narrow
          ? "relative px-5 pt-[4.5rem] pb-5 lg:pt-20"
          : "relative px-5 pt-[4.5rem] pb-5 lg:px-10 lg:pt-20 lg:pb-7"
      }
    >
      {back ? (
        <div
          className={
            narrow
              ? "absolute left-3 top-5 h-10 w-10 animate-pulse rounded-full bg-surface-2 lg:top-7"
              : "absolute left-3 top-5 h-10 w-10 animate-pulse rounded-full bg-surface-2 lg:left-8 lg:top-7"
          }
        />
      ) : null}
      <div className="flex items-center gap-3">
        {leadingAvatar ? (
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-surface-2 lg:h-14 lg:w-14" />
        ) : null}
        <Block className="h-9 w-44 lg:h-12 lg:w-64" />
      </div>
      <Block className="mt-3 h-4 w-56 lg:w-72" />
    </header>
  );
}

/** Home body: search field + tag chips + masonry. */
export function HomeSkeleton() {
  return (
    <main className="flex-1 px-5 pb-8 lg:px-10">
      <Block className="mb-4 h-12 max-w-2xl lg:mb-6 lg:h-14 lg:max-w-none" />
      <div className="mb-5 flex gap-2 lg:mb-7 lg:gap-2.5">
        {["w-12", "w-20", "w-16", "w-24", "w-14"].map((w, i) => (
          <Block key={i} className={`h-8 rounded-chip lg:h-9 ${w}`} />
        ))}
      </div>
      <MasonrySkeleton />
    </main>
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
    <div className="flex flex-col gap-1.5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-[52px] animate-pulse rounded-2xl bg-surface-2"
        />
      ))}
    </div>
  );
}
