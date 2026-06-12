"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sheet, useCloseSheet } from "./Sheet";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { createClient } from "@/lib/supabase/client";
import { deleteTag } from "@/lib/actions/tags";

export function DeleteTagSheet() {
  const router = useRouter();
  const close = useCloseSheet();
  const searchParams = useSearchParams();
  const tagId = searchParams.get("tagId");

  const [data, setData] = useState<{ name: string; count: number } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!tagId) return;
    let cancelled = false;
    const supabase = createClient();
    Promise.all([
      supabase.from("tags").select("name").eq("id", tagId).maybeSingle(),
      supabase
        .from("gem_tags")
        .select("tag_id", { count: "exact", head: true })
        .eq("tag_id", tagId),
    ]).then(([tagRes, countRes]) => {
      if (cancelled) return;
      if (!tagRes.data) return;
      setData({
        name: (tagRes.data as { name: string }).name,
        count: countRes.count ?? 0,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [tagId]);

  async function confirm() {
    if (!tagId || busy) return;
    setBusy(true);
    try {
      await deleteTag(tagId);
      close();
      router.refresh();
    } catch {
      setBusy(false);
    }
  }

  if (!data) return null;

  return (
    <Sheet title="delete tag?">
      <div className="flex flex-col gap-4 pb-2">
        <p className="text-[14.5px] leading-relaxed text-text-muted">
          this will remove <span className="text-text">{data.name}</span> from{" "}
          <span className="text-text">
            {data.count} {data.count === 1 ? "gem" : "gems"}
          </span>
          . the gems themselves are kept.
        </p>
        <Button
          onClick={confirm}
          disabled={busy}
          className="bg-danger text-bg hover:bg-danger"
        >
          {busy ? <Spinner /> : "delete tag"}
        </Button>
        <Button variant="secondary" onClick={close}>
          cancel
        </Button>
      </div>
    </Sheet>
  );
}
