import {
  HeaderSkeleton,
  ListSkeleton,
  TopBarSkeleton,
} from "@/components/ui/skeletons";

// Tags fallback: back-chevron chrome, header, stacked rows.
export default function Loading() {
  return (
    <>
      <TopBarSkeleton />
      <HeaderSkeleton compact />
      <main className="flex-1 px-5 pb-8 lg:px-10">
        <ListSkeleton />
      </main>
    </>
  );
}
