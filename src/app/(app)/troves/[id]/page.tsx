import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { PageHeader } from "@/components/layout/PageHeader";
import { TroveBody } from "@/components/troves/TroveBody";
import { TroveMenu } from "@/components/troves/TroveMenu";
import { SelectableTroveView } from "@/components/troves/SelectableTroveView";
import { getTrove } from "@/lib/queries/troves";
import { listTroveGems } from "@/lib/queries/gems";
import { listTagsForTrove } from "@/lib/queries/tags";

export default async function TroveDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string; tag?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const trove = await getTrove(id);
  if (!trove) notFound();

  const gems = await listTroveGems(trove.id);

  if (sp.mode === "select") {
    return (
      <Suspense fallback={null}>
        <SelectableTroveView gems={gems} />
      </Suspense>
    );
  }

  const tags = await listTagsForTrove(trove.id);
  return (
    <>
      <TopBar backHref="/profile" />
      <PageHeader
        title={trove.name}
        description={trove.description ?? undefined}
        compact
        inlineAction={
          <Suspense fallback={null}>
            <TroveMenu />
          </Suspense>
        }
      />
      <main className="flex-1 px-5 pb-8 lg:px-10">
        <Suspense fallback={null}>
          <TroveBody troveId={trove.id} gems={gems} tags={tags} />
        </Suspense>
      </main>
    </>
  );
}
