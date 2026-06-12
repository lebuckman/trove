import "server-only";

import { createClient } from "@/lib/supabase/server";

export type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Resolve the session user's id for write paths. RLS would reject the
 * write anyway, but failing early gives a clear error instead of a
 * confusing zero-row result.
 */
export async function requireUserId(
  supabase: SupabaseServerClient,
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("not signed in");
  return user.id;
}
