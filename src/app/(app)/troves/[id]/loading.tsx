import { HeaderSkeleton, MasonrySkeleton } from "@/components/ui/skeletons";

// Trove detail fallback: back-chevron header + masonry.
export default function Loading() {
  return (
    <>
      <HeaderSkeleton back />
      <main className="flex-1 px-5 pb-8 lg:px-10">
        <MasonrySkeleton />
      </main>
    </>
  );
}
