import { Suspense } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { TagsBody } from "@/components/tags/TagsBody";
import { TagsSubtitle } from "@/components/tags/TagsSubtitle";
import { EmptyState, TagEmptyIcon } from "@/components/ui/EmptyState";
import { ListSkeleton } from "@/components/ui/skeletons";
import { listAllTagsWithCounts } from "@/lib/queries/tags";
import { getTagCount } from "@/lib/queries/stats";

export const metadata = { title: "tags" };

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

// Static title + counting subtitle paint instantly; the list streams in.
export default function TagsPage() {
  return (
    // Centered single column on desktop — the tags page reads like the
    // mobile layout at desktop sizing rather than stretching to full width.
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader
        title="tags"
        backHref="/"
        narrow
        subtitle={
          <Suspense fallback="0 tags">
            <SubtitleLoader />
          </Suspense>
        }
        inlineAction={
          <Link
            href="/tags?sheet=new-tag"
            scroll={false}
            aria-label="New tag"
            className="tappable flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-text"
          >
            <PlusIcon />
          </Link>
        }
      />
      <main className="flex-1 px-5 pb-8">
        <Suspense fallback={<ListSkeleton />}>
          <List />
        </Suspense>
      </main>
    </div>
  );
}

async function SubtitleLoader() {
  const count = await getTagCount();
  return <TagsSubtitle count={count} />;
}

async function List() {
  const tags = await listAllTagsWithCounts();
  if (tags.length === 0) {
    return (
      <EmptyState
        icon={<TagEmptyIcon />}
        title="no tags yet"
        description="create one here, or add tags as you save gems. they'll appear in this list."
        action={{ label: "new tag", href: "/tags?sheet=new-tag" }}
      />
    );
  }
  return <TagsBody tags={tags} />;
}
