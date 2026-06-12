"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "./Sheet";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { TextField } from "@/components/ui/TextField";
import { createTrove } from "@/lib/actions/troves";

export function NewTroveSheet() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const id = await createTrove({
        name,
        description: description || null,
      });
      router.push(`/troves/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "could not create trove");
      setBusy(false);
    }
  }

  return (
    <Sheet title="new trove">
      <form onSubmit={submit} className="flex flex-col gap-4 pb-2">
        <TextField
          label="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. studio"
          autoFocus
          maxLength={80}
        />
        <TextField
          kind="textarea"
          label="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="optional — what belongs here?"
          maxLength={280}
        />
        {error ? (
          <p className="rounded-2xl border border-danger/30 bg-danger/10 px-3 py-2 text-[12.5px] text-danger">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={busy || name.trim().length === 0}>
          {busy ? <Spinner /> : "create trove"}
        </Button>
      </form>
    </Sheet>
  );
}
