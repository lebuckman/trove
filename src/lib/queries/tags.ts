import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Tag } from "./types";

export async function listAllTags(): Promise<Tag[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .select("id, name")
    .order("name");
  if (error) throw error;
  return (data ?? []) as Tag[];
}

export type TagWithCount = Tag & { count: number };

/** Alphabetical, with gem counts attached. */
export async function listAllTagsWithCounts(): Promise<TagWithCount[]> {
  const [tags, counts] = await Promise.all([listAllTags(), countGemsByTag()]);
  return tags.map((t) => ({ ...t, count: counts[t.id] ?? 0 }));
}

export async function countGemsByTag(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("gem_tags").select("tag_id");
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.tag_id] = (counts[row.tag_id] ?? 0) + 1;
  }
  return counts;
}

/** Distinct tags used by any gem in a given trove. */
export async function listTagsForTrove(troveId: string): Promise<Tag[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gems")
    .select("tags(id, name)")
    .eq("trove_id", troveId);
  if (error) throw error;
  const seen = new Map<string, Tag>();
  for (const row of (data ?? []) as { tags: Tag[] | Tag | null }[]) {
    const list = !row.tags ? [] : Array.isArray(row.tags) ? row.tags : [row.tags];
    for (const t of list) seen.set(t.id, t);
  }
  return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
}
