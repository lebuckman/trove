import "server-only";

import { createClient } from "@/lib/supabase/server";

// Lightweight count(*) queries. These resolve much faster than the full
// content reads (which sign a storage URL per image), so the header stat
// lines can count up while the masonry/grid is still streaming in. RLS
// scopes every count to the session user.

async function count(
  table: "gems" | "troves" | "tags",
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

export function getGemCount() {
  return count("gems");
}

export function getTroveCount() {
  return count("troves");
}

export function getTagCount() {
  return count("tags");
}
