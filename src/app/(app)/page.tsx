import { Suspense } from "react";
import { HomeBody } from "@/components/home/HomeBody";
import { listAllGems } from "@/lib/queries/gems";
import { listAllTags, countGemsByTag } from "@/lib/queries/tags";

export default async function HomePage() {
  const [gems, tags, counts] = await Promise.all([
    listAllGems(),
    listAllTags(),
    countGemsByTag(),
  ]);

  return (
    <Suspense fallback={null}>
      <HomeBody gems={gems} tags={tags} counts={counts} />
    </Suspense>
  );
}
