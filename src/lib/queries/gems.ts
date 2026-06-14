import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Gem } from "./types";
import { GEM_SELECT_WITH_TAGS, mapGems, type GemRow } from "./util";

// RLS already scopes every select to the session user; these queries are
// deliberately free of explicit user filters so there is exactly one
// source of truth for visibility.

export async function listAllGems(): Promise<Gem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gems")
    .select(GEM_SELECT_WITH_TAGS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return mapGems(supabase, (data as unknown as GemRow[] | null) ?? []);
}

export async function listTroveGems(troveId: string): Promise<Gem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gems")
    .select(GEM_SELECT_WITH_TAGS)
    .eq("trove_id", troveId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return mapGems(supabase, (data as unknown as GemRow[] | null) ?? []);
}
