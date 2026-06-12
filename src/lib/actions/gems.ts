"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fetchLinkPreview } from "@/lib/og";
import { requireUserId, type SupabaseServerClient } from "./auth";
import { STORAGE_BUCKET } from "@/lib/queries/util";

/**
 * Upsert the given tag names (scoped to the user) and replace this gem's
 * tag joins with exactly that set. Names are lowercased + trimmed first.
 */
async function setGemTags(
  supabase: SupabaseServerClient,
  userId: string,
  gemId: string,
  rawNames: string[],
): Promise<void> {
  const names = Array.from(
    new Set(rawNames.map((n) => n.trim().toLowerCase()).filter(Boolean)),
  );

  // Always wipe the existing joins so that empty/edited tag sets work.
  await supabase.from("gem_tags").delete().eq("gem_id", gemId);
  if (names.length === 0) return;

  // Find which of the user's tags already exist.
  const existingRes = await supabase
    .from("tags")
    .select("id, name")
    .in("name", names);
  if (existingRes.error) throw existingRes.error;
  const existing = existingRes.data ?? [];
  const existingNames = new Set(existing.map((t) => t.name));
  const missing = names.filter((n) => !existingNames.has(n));

  if (missing.length > 0) {
    const insertRes = await supabase
      .from("tags")
      .insert(missing.map((name) => ({ name, user_id: userId })));
    if (insertRes.error) throw insertRes.error;
  }

  // Re-fetch all tag ids for our names and wire up the joins.
  const allRes = await supabase
    .from("tags")
    .select("id, name")
    .in("name", names);
  if (allRes.error) throw allRes.error;
  const all = allRes.data ?? [];
  if (all.length === 0) return;

  const joinRes = await supabase
    .from("gem_tags")
    .insert(all.map((t) => ({ gem_id: gemId, tag_id: t.id as string })));
  if (joinRes.error) throw joinRes.error;
}

export async function createLinkGem(input: {
  trove_id: string;
  url: string;
  description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_thumbnail_url: string | null;
  og_site_name: string | null;
  tag_names: string[];
}): Promise<string> {
  // If the client didn't pre-fetch a preview (e.g. user skipped the
  // Preview button), enrich server-side so the saved card has metadata.
  let og_title = input.og_title;
  let og_description = input.og_description;
  let og_thumbnail_url = input.og_thumbnail_url;
  let og_site_name = input.og_site_name;
  const hasMeta =
    og_title || og_description || og_thumbnail_url || og_site_name;
  if (!hasMeta) {
    try {
      const preview = await fetchLinkPreview(input.url);
      if (preview) {
        og_title = preview.title;
        og_description = preview.description;
        og_thumbnail_url = preview.thumbnailUrl;
        og_site_name = preview.siteName;
      }
    } catch {
      // Save without metadata rather than failing the action.
    }
  }

  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  const { data, error } = await supabase
    .from("gems")
    .insert({
      trove_id: input.trove_id,
      user_id: userId,
      type: "link",
      url: input.url,
      description: input.description?.trim() || null,
      og_title,
      og_description,
      og_thumbnail_url,
      og_site_name,
    })
    .select("id")
    .single();
  if (error) throw error;
  const id = data.id as string;
  await setGemTags(supabase, userId, id, input.tag_names);
  revalidatePath(`/troves/${input.trove_id}`);
  revalidatePath("/");
  return id;
}

export async function createMediaGem(input: {
  trove_id: string;
  type: "image" | "video";
  storage_path: string;
  mime_type: string;
  width: number;
  height: number;
  description: string | null;
  tag_names: string[];
}): Promise<string> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  const { data, error } = await supabase
    .from("gems")
    .insert({
      trove_id: input.trove_id,
      user_id: userId,
      type: input.type,
      storage_path: input.storage_path,
      mime_type: input.mime_type,
      width: input.width,
      height: input.height,
      description: input.description?.trim() || null,
    })
    .select("id")
    .single();
  if (error) throw error;
  const id = data.id as string;
  await setGemTags(supabase, userId, id, input.tag_names);
  revalidatePath(`/troves/${input.trove_id}`);
  revalidatePath("/");
  return id;
}

export async function updateGemTags(
  gemId: string,
  tagNames: string[],
): Promise<void> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  // Need the trove_id to revalidate the right trove page.
  const fetchRes = await supabase
    .from("gems")
    .select("trove_id")
    .eq("id", gemId)
    .maybeSingle();
  if (fetchRes.error) throw fetchRes.error;
  const row = fetchRes.data;
  if (!row) return;

  await setGemTags(supabase, userId, gemId, tagNames);
  revalidatePath(`/troves/${row.trove_id}`);
  revalidatePath("/tags");
  revalidatePath("/");
}

export async function updateGemDescription(
  id: string,
  description: string,
): Promise<void> {
  const supabase = await createClient();
  const value = description.trim() || null;
  const { data, error } = await supabase
    .from("gems")
    .update({ description: value })
    .eq("id", id)
    .select("trove_id")
    .single();
  if (error) throw error;
  revalidatePath(`/troves/${data.trove_id}`);
  revalidatePath("/");
}

export async function deleteGem(id: string): Promise<void> {
  const supabase = await createClient();
  // Fetch first so we know the trove_id (to revalidate) and storage_path
  // (so we can clean up the file).
  const fetchRes = await supabase
    .from("gems")
    .select("trove_id, storage_path")
    .eq("id", id)
    .maybeSingle();
  if (fetchRes.error) throw fetchRes.error;
  const row = fetchRes.data;
  if (!row) return;

  if (row.storage_path) {
    await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([row.storage_path as string]);
  }

  const delRes = await supabase.from("gems").delete().eq("id", id);
  if (delRes.error) throw delRes.error;

  revalidatePath(`/troves/${row.trove_id}`);
  revalidatePath("/");
}

export async function moveGems(
  ids: string[],
  targetTroveId: string,
): Promise<void> {
  if (ids.length === 0) return;
  const supabase = await createClient();

  // Grab the source trove ids first so we can revalidate them.
  const fetchRes = await supabase
    .from("gems")
    .select("trove_id")
    .in("id", ids);
  if (fetchRes.error) throw fetchRes.error;
  const sourceTroveIds = new Set(
    (fetchRes.data ?? []).map((r) => r.trove_id as string),
  );

  // Update + select so we can verify rows actually got touched.
  const updRes = await supabase
    .from("gems")
    .update({ trove_id: targetTroveId })
    .in("id", ids)
    .select("id");
  if (updRes.error) throw updRes.error;
  if (!updRes.data || updRes.data.length === 0) {
    throw new Error(
      `move matched 0 gems (requested ${ids.length}); ids may be stale`,
    );
  }

  for (const tid of sourceTroveIds) revalidatePath(`/troves/${tid}`);
  revalidatePath(`/troves/${targetTroveId}`);
  revalidatePath("/");
}

export async function bulkDeleteGems(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const supabase = await createClient();

  // Fetch all rows we're about to delete so we can clean up their files
  // and figure out which troves to revalidate.
  const fetchRes = await supabase
    .from("gems")
    .select("trove_id, storage_path")
    .in("id", ids);
  if (fetchRes.error) throw fetchRes.error;
  const rows = fetchRes.data ?? [];
  const paths = rows
    .map((r) => r.storage_path as string | null)
    .filter((p): p is string => Boolean(p));

  if (paths.length > 0) {
    await supabase.storage.from(STORAGE_BUCKET).remove(paths);
  }

  const delRes = await supabase.from("gems").delete().in("id", ids);
  if (delRes.error) throw delRes.error;

  const troveIds = new Set(rows.map((r) => r.trove_id as string));
  for (const tid of troveIds) revalidatePath(`/troves/${tid}`);
  revalidatePath("/");
}

/** Persist a full manual reorder of one trove's gems in one pass. */
export async function reorderGems(
  troveId: string,
  orderedIds: string[],
): Promise<void> {
  if (orderedIds.length === 0) return;
  const supabase = await createClient();
  const results = await Promise.all(
    orderedIds.map((id, i) =>
      supabase
        .from("gems")
        .update({ position: i })
        .eq("id", id)
        .eq("trove_id", troveId),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
  revalidatePath(`/troves/${troveId}`);
}
