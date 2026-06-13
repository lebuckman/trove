import { HeaderSkeleton, HomeSkeleton } from "@/components/ui/skeletons";

// Home fallback: large title + search + tag chips + masonry.
export default function Loading() {
  return (
    <>
      <HeaderSkeleton />
      <HomeSkeleton />
    </>
  );
}
