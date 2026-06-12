import { createClient } from "@/lib/supabase/server";

// Temporary auth verification page — replaced by the gem masonry home
// once the data layer lands.
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  return (
    <main className="mx-auto w-full max-w-2xl px-5 pt-12 pb-24">
      <header className="mb-8">
        <h1 className="text-[34px] leading-[1.1] font-bold lowercase">trove</h1>
        <p className="text-text-muted mt-1 lowercase">
          signed in. auth wiring verified.
        </p>
      </header>
      <div className="rounded-card border border-border bg-surface p-5 font-mono text-[13px]">
        <p className="text-text-muted">auth.uid()</p>
        <p className="mt-1 break-all">{user?.id ?? "none"}</p>
        <p className="mt-4 text-text-muted">trove.profiles row</p>
        <p className="mt-1 break-all">
          {profile
            ? `${profile.display_name ?? "(no name)"} · ${profile.avatar_url ? "avatar set" : "no avatar"}`
            : "missing — signup trigger did not fire"}
        </p>
      </div>
    </main>
  );
}
