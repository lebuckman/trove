"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserId } from "./auth";
import { STORAGE_BUCKET } from "@/lib/queries/util";

export async function createTrove(input: {
  name: string;
  description: string | null;
}): Promise<string> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);

  // Append at the end of the user's manual order.
  const { count, error: countErr } = await supabase
    .from("troves")
    .select("id", { count: "exact", head: true });
  if (countErr) throw countErr;

  const { data, error } = await supabase
    .from("troves")
    .insert({
      user_id: userId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      position: count ?? 0,
    })
    .select("id")
    .single();
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/profile");
  return data.id as string;
}

export async function updateTrove(input: {
  id: string;
  name: string;
  description: string | null;
  cover_gem_id: string | null;
}): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("troves")
    .update({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      cover_gem_id: input.cover_gem_id,
    })
    .eq("id", input.id);
  if (error) throw error;
  revalidatePath("/profile");
  revalidatePath(`/troves/${input.id}`);
}

export async function deleteTrove(id: string): Promise<void> {
  const supabase = await createClient();

  // Gems cascade-delete by FK; their storage files need explicit cleanup.
  const gemsRes = await supabase
    .from("gems")
    .select("storage_path")
    .eq("trove_id", id);
  if (gemsRes.error) throw gemsRes.error;
  const paths = (gemsRes.data ?? [])
    .map((g) => g.storage_path as string | null)
    .filter((p): p is string => Boolean(p));
  if (paths.length > 0) {
    await supabase.storage.from(STORAGE_BUCKET).remove(paths);
  }

  const { error } = await supabase.from("troves").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/profile");
}

/** Persist a full manual reorder of the user's troves in one pass. */
export async function reorderTroves(orderedIds: string[]): Promise<void> {
  if (orderedIds.length === 0) return;
  const supabase = await createClient();
  // Full renumber — fine at personal-collection scale.
  const results = await Promise.all(
    orderedIds.map((id, i) =>
      supabase.from("troves").update({ position: i }).eq("id", id),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
  revalidatePath("/profile");
}
