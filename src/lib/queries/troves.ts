import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Trove, GemType } from "./types";
import { gemMediaUrl, signedUrlMap } from "./util";

type TroveRow = {
  id: string;
  name: string;
  description: string | null;
  cover_gem_id: string | null;
  position: number;
  created_at: string;
};

/** The bits of a gem we need for cover-image and count computations. */
type CoverableGem = {
  id: string;
  trove_id: string;
  type: GemType;
  storage_path: string | null;
  og_thumbnail_url: string | null;
  created_at: string;
};

const TROVE_SELECT =
  "id, name, description, cover_gem_id, position, created_at";
const COVERABLE_SELECT =
  "id, trove_id, type, storage_path, og_thumbnail_url, created_at";

async function buildCovers(
  supabase: Awaited<ReturnType<typeof createClient>>,
  troves: TroveRow[],
  gems: CoverableGem[],
): Promise<Trove[]> {
  // Group gems by trove, already sorted newest-first by the caller.
  const byTrove = new Map<string, CoverableGem[]>();
  for (const g of gems) {
    const arr = byTrove.get(g.trove_id);
    if (arr) arr.push(g);
    else byTrove.set(g.trove_id, [g]);
  }
  // Resolve each trove's cover gem first, then sign only those paths.
  const covers = troves.map((t) => {
    const list = byTrove.get(t.id) ?? [];
    return (
      (t.cover_gem_id && list.find((g) => g.id === t.cover_gem_id)) ||
      list[0] ||
      null
    );
  });
  const signed = await signedUrlMap(
    supabase,
    covers
      .map((c) => c?.storage_path ?? null)
      .filter((p): p is string => Boolean(p)),
  );
  return troves.map((t, i) => {
    const cover = covers[i];
    return {
      id: t.id,
      name: t.name,
      description: t.description,
      cover_gem_id: t.cover_gem_id,
      position: t.position,
      created_at: t.created_at,
      cover_url: cover ? gemMediaUrl(cover, signed) : null,
      gem_count: (byTrove.get(t.id) ?? []).length,
    };
  });
}

export async function listTroves(): Promise<Trove[]> {
  const supabase = await createClient();
  const [trovesRes, gemsRes] = await Promise.all([
    supabase
      .from("troves")
      .select(TROVE_SELECT)
      .order("position")
      .order("created_at", { ascending: false }),
    supabase
      .from("gems")
      .select(COVERABLE_SELECT)
      .order("created_at", { ascending: false }),
  ]);
  if (trovesRes.error) throw trovesRes.error;
  if (gemsRes.error) throw gemsRes.error;
  return buildCovers(
    supabase,
    (trovesRes.data ?? []) as TroveRow[],
    (gemsRes.data ?? []) as CoverableGem[],
  );
}

/** Just the trove's name + description — fast (no gems, no signing).
 *  Used to render the detail header instantly while gems stream in. */
export async function getTroveMeta(
  id: string,
): Promise<{ name: string; description: string | null } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("troves")
    .select("name, description")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}
