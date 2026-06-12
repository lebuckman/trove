"use client";

import { useEffect, useState } from "react";
import { Sheet, useCloseSheet } from "./Sheet";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { TextField } from "@/components/ui/TextField";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/actions/profile";

export function EditProfileSheet() {
  const close = useCloseSheet();
  const [name, setName] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user || cancelled) return;
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setName(data?.display_name ?? "");
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await updateProfile({ display_name: name });
      close();
    } catch {
      setError("could not save. try again.");
      setBusy(false);
    }
  }

  if (!ready) return null;

  return (
    <Sheet title="edit profile">
      <form onSubmit={submit} className="flex flex-col gap-4 pb-2">
        <TextField
          label="display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="your name"
          maxLength={80}
          autoFocus
        />
        <p className="px-1 text-[12px] leading-relaxed lowercase text-text-subtle">
          your avatar comes from your google account.
        </p>
        {error ? (
          <p className="rounded-2xl border border-danger/30 bg-danger/10 px-3 py-2 text-[12.5px] text-danger">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={busy}>
          {busy ? <Spinner /> : "save"}
        </Button>
      </form>
    </Sheet>
  );
}
