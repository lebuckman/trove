import {
  HeaderSkeleton,
  MasonrySkeleton,
  TopBarSkeleton,
} from "@/components/ui/skeletons";

// Trove detail fallback: back-chevron chrome, compact header, masonry.
export default function Loading() {
  return (
    <>
      <TopBarSkeleton />
      <HeaderSkeleton compact />
      <main className="flex-1 px-5 pb-8 lg:px-10">
        <MasonrySkeleton />
      </main>
    </>
  );
}
