"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUserId } from "./auth";

export async function updateProfile(input: {
  display_name: string;
}): Promise<void> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: input.display_name.trim() || null })
    .eq("id", userId);
  if (error) throw error;
  revalidatePath("/profile");
}
