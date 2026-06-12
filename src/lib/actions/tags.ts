"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserId } from "./auth";

export type TagWriteReason = "empty" | "too-long" | "duplicate" | "not-found";
export type RenameTagResult =
  | { ok: true }
  | { ok: false; reason: TagWriteReason };
export type CreateTagResult =
  | { ok: true; id: string }
  | { ok: false; reason: Exclude<TagWriteReason, "not-found"> };

export async function createTag(rawName: string): Promise<CreateTagResult> {
  const name = rawName.trim().toLowerCase();
  if (name.length === 0) return { ok: false, reason: "empty" };
  if (name.length > 40) return { ok: false, reason: "too-long" };

  const supabase = await createClient();
  const userId = await requireUserId(supabase);

  const { data: existing, error: lookupErr } = await supabase
    .from("tags")
    .select("id, name")
    .ilike("name", name);
  if (lookupErr) throw lookupErr;
  if ((existing ?? []).length > 0) {
    return { ok: false, reason: "duplicate" };
  }

  const { data, error } = await supabase
    .from("tags")
    .insert({ name, user_id: userId })
    .select("id")
    .single();
  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/tags");
  return { ok: true, id: data.id as string };
}

export async function renameTag(
  id: string,
  rawName: string,
): Promise<RenameTagResult> {
  const name = rawName.trim().toLowerCase();
  if (name.length === 0) return { ok: false, reason: "empty" };
  if (name.length > 40) return { ok: false, reason: "too-long" };

  const supabase = await createClient();

  // citext + the (user_id, name) unique constraint will already reject
  // duplicates, but checking up front lets us surface a friendlier
  // message and skip the round trip when the rename is a no-op.
  const { data: existing, error: lookupErr } = await supabase
    .from("tags")
    .select("id, name")
    .ilike("name", name);
  if (lookupErr) throw lookupErr;
  const conflict = (existing ?? []).find((t) => t.id !== id);
  if (conflict) return { ok: false, reason: "duplicate" };

  const { data, error } = await supabase
    .from("tags")
    .update({ name })
    .eq("id", id)
    .select("id");
  if (error) throw error;
  if (!data || data.length === 0) return { ok: false, reason: "not-found" };

  // Tags appear in filters, search, and the lightbox's tag chips —
  // revalidate everything that lists them.
  revalidatePath("/");
  revalidatePath("/tags");
  revalidatePath("/troves/[id]", "page");
  return { ok: true };
}

export async function deleteTag(id: string): Promise<void> {
  // gem_tags rows cascade-delete via FK; gems themselves are untouched,
  // they just lose this tag.
  const supabase = await createClient();
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/tags");
  revalidatePath("/troves/[id]", "page");
}
