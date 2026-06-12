"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sheet, useCloseSheet } from "./Sheet";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { TextField } from "@/components/ui/TextField";
import { createTag } from "@/lib/actions/tags";

type CreateTagReason = "empty" | "too-long" | "duplicate";

export function NewTagSheet() {
  const router = useRouter();
  const close = useCloseSheet();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await createTag(name);
      if (!res.ok) {
        setError(messageFor(res.reason));
        setBusy(false);
        return;
      }
      close();
      router.refresh();
    } catch {
      setError("something went wrong. try again.");
      setBusy(false);
    }
  }

  return (
    <Sheet title="new tag">
      <form onSubmit={submit} className="flex flex-col gap-4 pb-2">
        <TextField
          label="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          autoFocus
          maxLength={40}
          placeholder="e.g. warm-tones"
          hint={error ?? "tags are case-insensitive and reusable across troves."}
        />
        <Button type="submit" disabled={busy || name.trim().length === 0}>
          {busy ? <Spinner /> : "create"}
        </Button>
      </form>
    </Sheet>
  );
}

function messageFor(reason: CreateTagReason) {
  switch (reason) {
    case "empty":
      return "name can't be blank.";
    case "too-long":
      return "name is too long (max 40 characters).";
    case "duplicate":
      return "a tag with that name already exists.";
  }
}
