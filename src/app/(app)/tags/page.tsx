import { Suspense } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { PageHeader } from "@/components/layout/PageHeader";
import { TagsBody } from "@/components/tags/TagsBody";
import { EmptyState, TagEmptyIcon } from "@/components/ui/EmptyState";
import { listAllTagsWithCounts } from "@/lib/queries/tags";

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export default async function TagsPage() {
  const tags = await listAllTagsWithCounts();

  return (
    <>
      <TopBar backHref="/" />
      <PageHeader
        title="tags"
        subtitle={
          tags.length === 0
            ? "tags appear here as you add them to gems"
            : `${tags.length} ${tags.length === 1 ? "tag" : "tags"}`
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
        {tags.length === 0 ? (
          <EmptyState
            icon={<TagEmptyIcon />}
            title="no tags yet"
            description="create one here, or add tags as you save gems. they'll appear in this list."
            action={{ label: "new tag", href: "/tags?sheet=new-tag" }}
          />
        ) : (
          <Suspense fallback={null}>
            <TagsBody tags={tags} />
          </Suspense>
        )}
      </main>
    </>
  );
}
