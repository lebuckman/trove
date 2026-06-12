"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Sheet, useCloseSheet } from "./Sheet";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { TextField } from "@/components/ui/TextField";
import { fetchTroveForEdit } from "@/lib/queries/client";
import { updateTrove } from "@/lib/actions/troves";
import type { Trove, Gem } from "@/lib/queries/types";
import { cn } from "@/lib/utils";

type CoverPick = Pick<Gem, "id" | "type" | "media_url" | "storage_path">;

export function EditTroveSheet() {
  const close = useCloseSheet();
  const pathname = usePathname();
  const troveId = pathname.match(/^\/troves\/([^/]+)/)?.[1];

  const [trove, setTrove] = useState<Trove | null>(null);
  const [gems, setGems] = useState<CoverPick[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverId, setCoverId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!troveId) return;
    let cancelled = false;
    fetchTroveForEdit(troveId).then((res) => {
      if (cancelled || !res) return;
      setTrove(res.trove);
      setGems(res.gems);
      setName(res.trove.name);
      setDescription(res.trove.description ?? "");
      setCoverId(res.trove.cover_gem_id ?? res.gems[0]?.id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [troveId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!troveId || busy) return;
    setBusy(true);
    try {
      await updateTrove({
        id: troveId,
        name,
        description: description || null,
        cover_gem_id: coverId,
      });
      close();
    } catch {
      setBusy(false);
    }
  }

  if (!trove) return null;

  return (
    <Sheet title="edit trove">
      <form onSubmit={submit} className="flex flex-col gap-4 pb-2">
        <TextField
          label="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          maxLength={80}
        />
        <TextField
          kind="textarea"
          label="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="optional"
          maxLength={280}
        />

        {gems.length > 0 ? (
          <div>
            <span className="mb-1.5 block px-1 text-[12.5px] font-medium lowercase text-text-subtle">
              cover
            </span>
            <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-2 pb-1">
                {gems.map((c) => {
                  const active = c.id === coverId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCoverId(c.id)}
                      className={cn(
                        "tappable relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-surface-2",
                        active ? "border-accent ring-2 ring-accent" : "border-border",
                      )}
                      aria-pressed={active}
                      aria-label={`Set cover to gem ${c.id}`}
                    >
                      {c.media_url ? (
                        <Image
                          src={c.media_url}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        <Button type="submit" disabled={busy || name.trim().length === 0}>
          {busy ? <Spinner /> : "save"}
        </Button>
      </form>
    </Sheet>
  );
}
