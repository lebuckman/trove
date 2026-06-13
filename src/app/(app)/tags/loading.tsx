import { HeaderSkeleton, ListSkeleton } from "@/components/ui/skeletons";

// Tags fallback: centered column, back-chevron header, stacked rows.
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <HeaderSkeleton back narrow />
      <main className="flex-1 px-5 pb-8">
        <ListSkeleton />
      </main>
    </div>
  );
}
