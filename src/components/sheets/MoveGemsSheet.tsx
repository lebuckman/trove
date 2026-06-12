"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sheet, useCloseSheet } from "./Sheet";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { fetchAllTrovesLite } from "@/lib/queries/client";
import { createTrove } from "@/lib/actions/troves";
import { moveGems } from "@/lib/actions/gems";
import type { Trove } from "@/lib/queries/types";
import { cn } from "@/lib/utils";

function parseIds(searchParams: URLSearchParams): string[] {
  const single = searchParams.get("gemId");
  if (single) return [single];
  const bulk = searchParams.get("gemIds");
  if (bulk) return bulk.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

export function MoveGemsSheet() {
  const close = useCloseSheet();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ids = parseIds(new URLSearchParams(searchParams.toString()));

  const [troves, setTroves] = useState<Pick<Trove, "id" | "name">[]>([]);
  const [troveId, setTroveId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatingTrove, setCreatingTrove] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchAllTrovesLite().then((bs) => {
      if (cancelled) return;
      setTroves(bs);
      if (bs[0]) setTroveId(bs[0].id);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreateInlineTrove(
    name: string,
    description: string,
  ): Promise<void> {
    const id = await createTrove({
      name,
      description: description || null,
    });
    setTroves((prev) => [{ id, name }, ...prev]);
    setTroveId(id);
    setCreatingTrove(false);
  }

  async function handleMove() {
    if (busy || !troveId || ids.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      await moveGems(ids, troveId);
      router.push(`/troves/${troveId}`);
      // Force a re-fetch even if the router cache thinks the page is fresh.
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "could not move");
      setBusy(false);
    }
  }

  const title =
    ids.length > 1 ? `move ${ids.length} gems` : "move to trove";

  return (
    <Sheet title={title}>
      <div className="flex flex-col gap-4 pb-2">
        <AnimatePresence mode="wait" initial={false}>
          {creatingTrove ? (
            <motion.div
              key="inline-new-trove"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              <InlineNewTroveForm
                onCreate={handleCreateInlineTrove}
                onCancel={() => setCreatingTrove(false)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="trove-picker"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              <TrovePicker
                troves={troves}
                value={troveId}
                onChange={setTroveId}
                onAddNew={() => setCreatingTrove(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {error ? (
          <p className="rounded-2xl border border-danger/30 bg-danger/10 px-3 py-2 text-[12.5px] text-danger">
            {error}
          </p>
        ) : null}

        <Button
          type="button"
          onClick={handleMove}
          disabled={busy || !troveId || ids.length === 0}
        >
          {busy ? <Spinner /> : "move"}
        </Button>
        <Button type="button" variant="secondary" onClick={close} disabled={busy}>
          cancel
        </Button>
      </div>
    </Sheet>
  );
}

function TrovePicker({
  troves,
  value,
  onChange,
  onAddNew,
}: {
  troves: Pick<Trove, "id" | "name">[];
  value: string;
  onChange: (id: string) => void;
  onAddNew: () => void;
}) {
  return (
    <div>
      <span className="mb-1.5 block px-1 text-[12.5px] font-medium lowercase text-text-subtle">
        trove
      </span>
      <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2 pb-1">
          {troves.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => onChange(b.id)}
              className={cn(
                "tappable shrink-0 rounded-chip border px-3 py-1.5 text-[13px] font-medium lowercase",
                value === b.id
                  ? "border-accent bg-accent text-bg"
                  : "border-border bg-surface-2/60 text-text-muted",
              )}
            >
              {b.name}
            </button>
          ))}
          <button
            type="button"
            onClick={onAddNew}
            aria-label="New trove"
            className="tappable inline-flex shrink-0 items-center gap-1 rounded-chip border border-dashed border-border-strong bg-surface-2/30 px-3 py-1.5 text-[13px] font-medium lowercase text-text-muted hover:text-text"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            new
          </button>
        </div>
      </div>
    </div>
  );
}

function InlineNewTroveForm({
  onCreate,
  onCancel,
}: {
  onCreate: (name: string, description: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  async function submit() {
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onCreate(name, description);
    } catch (e) {
      setError(e instanceof Error ? e.message : "could not create trove");
      setBusy(false);
    }
  }

  const canCreate = name.trim().length > 0 && !busy;

  return (
    <div>
      <span className="mb-1.5 block px-1 text-[12.5px] font-medium lowercase text-text-subtle">
        new trove
      </span>
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-surface-2/60 p-3">
        <input
          ref={nameRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="name"
          maxLength={80}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (canCreate) submit();
            }
          }}
          className="w-full bg-transparent text-[15px] font-medium text-text outline-none placeholder:text-text-subtle"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="description (optional)"
          rows={2}
          maxLength={280}
          className="w-full resize-none bg-transparent text-[13.5px] leading-relaxed text-text outline-none placeholder:text-text-subtle"
        />
        {error ? <p className="text-[12.5px] text-danger">{error}</p> : null}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="tappable rounded-chip border border-border bg-surface-2/60 px-3 py-1.5 text-[13px] font-medium lowercase text-text-muted"
          >
            cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canCreate}
            className={cn(
              "tappable inline-flex min-w-[64px] items-center justify-center rounded-chip px-3 py-1.5 text-[13px] font-medium lowercase",
              canCreate
                ? "bg-accent text-bg"
                : "border border-border bg-surface-2/40 text-text-subtle",
            )}
          >
            {busy ? <Spinner /> : "create"}
          </button>
        </div>
      </div>
    </div>
  );
}
