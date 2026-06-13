import { MasonrySkeleton } from "@/components/ui/MasonrySkeleton";

// Shown on every navigation within the authenticated app while the
// server component fetches. Mirrors the header + masonry so the layout
// doesn't jump when real content arrives.
export default function Loading() {
  return (
    <>
      <header className="px-5 pt-14 pb-5 lg:px-8 lg:pt-16 lg:pb-7">
        <div className="h-9 w-40 animate-pulse rounded-lg bg-surface-2 lg:h-11" />
        <div className="mt-2.5 h-4 w-56 animate-pulse rounded bg-surface-2/70" />
      </header>
      <main className="flex-1 px-5 pb-8 lg:px-8">
        <MasonrySkeleton />
      </main>
    </>
  );
}
