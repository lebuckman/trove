import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TroveBody } from "@/components/troves/TroveBody";
import { TroveMenu } from "@/components/troves/TroveMenu";
import { SelectableTroveView } from "@/components/troves/SelectableTroveView";
import { HeaderSkeleton, MasonrySkeleton } from "@/components/ui/skeletons";
import { getTroveMeta } from "@/lib/queries/troves";
import { listTroveGems } from "@/lib/queries/gems";
import { listTagsForTrove } from "@/lib/queries/tags";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const meta = await getTroveMeta(id);
  return { title: meta?.name ?? "trove" };
}

export default async function TroveDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string; tag?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  if (sp.mode === "select") {
    return (
      <Suspense
        fallback={
          <main className="flex-1 px-5 pb-32 pt-20 lg:px-10">
            <MasonrySkeleton />
          </main>
        }
      >
        <SelectLoader id={id} />
      </Suspense>
    );
  }

  // Header resolves from a fast name/description query; the gem masonry
  // streams in separately.
  return (
    <>
      <Suspense fallback={<HeaderSkeleton back />}>
        <Header id={id} />
      </Suspense>
      <main className="flex-1 px-5 pb-8 lg:px-10">
        <Suspense fallback={<MasonrySkeleton />}>
          <Gems id={id} />
        </Suspense>
      </main>
    </>
  );
}

async function Header({ id }: { id: string }) {
  const meta = await getTroveMeta(id);
  if (!meta) notFound();
  return (
    <PageHeader
      title={meta.name}
      description={meta.description ?? undefined}
      backHref="/profile"
      inlineAction={<TroveMenu />}
    />
  );
}

async function Gems({ id }: { id: string }) {
  const [gems, tags] = await Promise.all([
    listTroveGems(id),
    listTagsForTrove(id),
  ]);
  return <TroveBody troveId={id} gems={gems} tags={tags} />;
}

async function SelectLoader({ id }: { id: string }) {
  const gems = await listTroveGems(id);
  return <SelectableTroveView gems={gems} />;
}
