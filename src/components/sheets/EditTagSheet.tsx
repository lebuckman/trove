"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sheet, useCloseSheet } from "./Sheet";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { TextField } from "@/components/ui/TextField";
import { fetchAllTagsLite } from "@/lib/queries/client";
import { renameTag, type TagWriteReason } from "@/lib/actions/tags";
import type { Tag } from "@/lib/queries/types";

export function EditTagSheet() {
  const router = useRouter();
  const close = useCloseSheet();
  const searchParams = useSearchParams();
  const tagId = searchParams.get("tagId");

  const [tag, setTag] = useState<Tag | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tagId) return;
    let cancelled = false;
    fetchAllTagsLite().then((all) => {
      if (cancelled) return;
      const match = all.find((t) => t.id === tagId) ?? null;
      setTag(match);
      setName(match?.name ?? "");
    });
    return () => {
      cancelled = true;
    };
  }, [tagId]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!tag || busy) return;
    const trimmed = name.trim().toLowerCase();
    if (trimmed === tag.name) {
      close();
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await renameTag(tag.id, trimmed);
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

  if (!tag) return null;

  return (
    <Sheet title="rename tag">
      <form onSubmit={save} className="flex flex-col gap-4 pb-2">
        <TextField
          label="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          autoFocus
          maxLength={40}
          hint={error ?? "gems linked to this tag will update automatically."}
        />
        <Button type="submit" disabled={busy || name.trim().length === 0}>
          {busy ? <Spinner /> : "save"}
        </Button>
      </form>
    </Sheet>
  );
}

function messageFor(reason: TagWriteReason) {
  switch (reason) {
    case "empty":
      return "name can't be blank.";
    case "too-long":
      return "name is too long (max 40 characters).";
    case "duplicate":
      return "a tag with that name already exists.";
    case "not-found":
      return "this tag no longer exists.";
  }
}
