import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { HomeBody } from "@/components/home/HomeBody";
import { HomeSubtitle } from "@/components/home/HomeSubtitle";
import { ProfileShellPreview } from "@/components/profile/ProfileShellPreview";
import type { Gem, Tag, Trove } from "@/lib/queries/types";

// Dev-only playground for tuning desktop layout without a session. Renders
// the real surfaces with mock data so sizing/spacing can be verified.
const DIMS: [number, number][] = [
  [1200, 800], [900, 1200], [1600, 900], [1000, 1000], [800, 1100],
  [1500, 1000], [1100, 1400], [1300, 870], [960, 1280], [1400, 933],
  [1024, 1024], [1280, 720],
];

const TAGS: Tag[] = [
  { id: "t1", name: "ghibli" },
  { id: "t2", name: "warm-tones" },
  { id: "t3", name: "music" },
  { id: "t4", name: "architecture" },
];

const GEMS: Gem[] = DIMS.map(([w, h], i) => ({
  id: `g${i}`,
  trove_id: "tr1",
  type: "image",
  storage_path: `mock/${i}.jpg`,
  mime_type: "image/jpeg",
  url: null,
  description: null,
  og_title: null,
  og_description: null,
  og_thumbnail_url: null,
  og_site_name: null,
  width: w,
  height: h,
  position: i,
  created_at: new Date(Date.now() - i * 1000).toISOString(),
  media_url: `https://picsum.photos/seed/trove${i}/${Math.round(w / 2)}/${Math.round(h / 2)}`,
  tags: i % 3 === 0 ? [TAGS[i % TAGS.length]] : [],
}));

const COUNTS: Record<string, number> = { t1: 4, t2: 2, t3: 3, t4: 1 };

const TROVES: Trove[] = Array.from({ length: 7 }, (_, i) => ({
  id: `tr${i}`,
  name: ["sketches", "music", "places", "interiors", "film stills", "type", "misc"][i],
  description: null,
  cover_gem_id: null,
  position: i,
  created_at: new Date(Date.now() - i * 1000).toISOString(),
  cover_url: `https://picsum.photos/seed/cover${i}/600/800`,
  gem_count: (i * 3) % 11,
}));

export default async function DevShell({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { view } = await searchParams;

  return (
    <AppShell>
      {view === "profile" ? (
        <ProfileShellPreview troves={TROVES} />
      ) : (
        <>
          <PageHeader
            title="trove"
            subtitle={<HomeSubtitle count={GEMS.length} />}
          />
          <HomeBody gems={GEMS} tags={TAGS} counts={COUNTS} />
        </>
      )}
    </AppShell>
  );
}
