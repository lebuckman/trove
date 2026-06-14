import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { HomeBody } from "@/components/home/HomeBody";
import { HomeSubtitle } from "@/components/home/HomeSubtitle";
import { HomeSkeleton } from "@/components/ui/skeletons";
import { listAllGems } from "@/lib/queries/gems";
import { listAllTags, countGemsByTag } from "@/lib/queries/tags";
import { getGemCount } from "@/lib/queries/stats";

// The shell (title + counting subtitle) paints instantly; the gem grid and
// tag chips stream in under their own Suspense boundary.
export default function HomePage() {
  return (
    <>
      <PageHeader
        title="trove"
        subtitle={
          <Suspense fallback="0 gems across your troves">
            <SubtitleLoader />
          </Suspense>
        }
      />
      <Suspense fallback={<HomeSkeleton />}>
        <BodyLoader />
      </Suspense>
    </>
  );
}

// Fast count query resolves well before the body, so the number can count up
// while the masonry is still loading.
async function SubtitleLoader() {
  const count = await getGemCount();
  return <HomeSubtitle count={count} />;
}

async function BodyLoader() {
  const [gems, tags, counts] = await Promise.all([
    listAllGems(),
    listAllTags(),
    countGemsByTag(),
  ]);
  return <HomeBody gems={gems} tags={tags} counts={counts} />;
}
