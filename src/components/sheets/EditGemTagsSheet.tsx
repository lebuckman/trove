"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sheet, useCloseSheet } from "./Sheet";
import { Button } from "@/components/ui/Button";
import { ChipInput } from "@/components/ui/ChipInput";
import { Spinner } from "@/components/ui/Spinner";
import { fetchAllTagsLite, fetchGemById } from "@/lib/queries/client";
import { updateGemTags } from "@/lib/actions/gems";

export function EditGemTagsSheet() {
  const router = useRouter();
  const close = useCloseSheet();
  const searchParams = useSearchParams();
  const gemId = searchParams.get("gemId");

  const [ready, setReady] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!gemId) return;
    let cancelled = false;
    Promise.all([fetchGemById(gemId), fetchAllTagsLite()]).then(
      ([gem, all]) => {
        if (cancelled || !gem) return;
        setTags(gem.tags.map((t) => t.name));
        setSuggestions(all.map((t) => t.name));
        setReady(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [gemId]);

  async function save() {
    if (!gemId || busy) return;
    setBusy(true);
    try {
      await updateGemTags(gemId, tags);
      close();
      router.refresh();
    } catch {
      setBusy(false);
    }
  }

  if (!gemId || !ready) return null;

  return (
    <Sheet title="edit tags">
      <div className="flex flex-col gap-4 pb-2">
        <ChipInput
          label="tags"
          values={tags}
          onChange={setTags}
          suggestions={suggestions}
          placeholder="add tag…"
        />
        <Button type="button" onClick={save} disabled={busy}>
          {busy ? <Spinner /> : "save"}
        </Button>
      </div>
    </Sheet>
  );
}
