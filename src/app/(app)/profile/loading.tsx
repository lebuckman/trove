import { GridSkeleton, HeaderSkeleton } from "@/components/ui/skeletons";

// Profile fallback: avatar + name header, then a troves grid.
export default function Loading() {
  return (
    <>
      <HeaderSkeleton leadingAvatar />
      <main className="flex-1 px-4 pb-8 lg:px-10">
        <GridSkeleton />
      </main>
    </>
  );
}
