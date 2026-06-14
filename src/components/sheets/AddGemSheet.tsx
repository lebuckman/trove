"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Sheet } from "./Sheet";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { TextField } from "@/components/ui/TextField";
import { ChipInput } from "@/components/ui/ChipInput";
import { fetchAllTrovesLite, fetchAllTagsLite } from "@/lib/queries/client";
import { createTrove } from "@/lib/actions/troves";
import {
  createLinkGem,
  createMediaGem,
} from "@/lib/actions/gems";
import {
  deleteGemFile,
  extractDimensions,
  imageDimensionsFromUrl,
  uploadGemFile,
} from "@/lib/storage";
import type { Trove, Tag } from "@/lib/queries/types";
import { cn } from "@/lib/utils";

type Mode = "media" | "link";

export function AddGemSheet({ mode }: { mode: Mode }) {
  const router = useRouter();

  const [troves, setTroves] = useState<Pick<Trove, "id" | "name">[]>([]);
  const [tagOptions, setTagOptions] = useState<Tag[]>([]);
  const [troveId, setTroveId] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [creatingTrove, setCreatingTrove] = useState(false);

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

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchAllTrovesLite(), fetchAllTagsLite()]).then(([bs, ts]) => {
      if (cancelled) return;
      setTroves(bs);
      setTagOptions(ts);
      if (bs[0]) setTroveId(bs[0].id);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Media-mode local state
  const [file, setFile] = useState<File | null>(null);
  const previewUrl = file ? URL.createObjectURL(file) : null;

  // Link-mode local state
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<{
    title: string | null;
    description: string | null;
    thumbnailUrl: string | null;
    thumbnailWidth: number | null;
    thumbnailHeight: number | null;
    siteName: string | null;
  } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  async function fetchPreview() {
    if (!url.trim()) return;
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const res = await fetch("/api/gems/link-preview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not fetch preview");
      }
      setPreview(await res.json());
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : "Could not fetch preview");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setSaveError(null);
    let uploadedPath: string | null = null;
    try {
      if (mode === "media") {
        if (!file) {
          setBusy(false);
          return;
        }
        const dims = await extractDimensions(file).catch(() => ({
          width: 800,
          height: 800,
        }));
        const uploaded = await uploadGemFile(file);
        uploadedPath = uploaded.storage_path;
        await createMediaGem({
          trove_id: troveId,
          type: file.type.startsWith("video/") ? "video" : "image",
          storage_path: uploaded.storage_path,
          mime_type: uploaded.mime_type,
          width: dims.width,
          height: dims.height,
          description: description || null,
          tag_names: tags,
        });
      } else {
        // Prefer dimensions the preview reported; otherwise probe the
        // thumbnail so the card isn't forced into a cropped square.
        let width = preview?.thumbnailWidth ?? null;
        let height = preview?.thumbnailHeight ?? null;
        if (preview?.thumbnailUrl && (!width || !height)) {
          const dims = await imageDimensionsFromUrl(preview.thumbnailUrl);
          if (dims) {
            width = dims.width;
            height = dims.height;
          }
        }
        await createLinkGem({
          trove_id: troveId,
          url,
          description: description || null,
          og_title: preview?.title ?? null,
          og_description: preview?.description ?? null,
          og_thumbnail_url: preview?.thumbnailUrl ?? null,
          og_site_name: preview?.siteName ?? null,
          width,
          height,
          tag_names: tags,
        });
      }
      router.push(`/troves/${troveId}`);
    } catch (err) {
      // The file uploaded but the gem row didn't save — remove the orphan.
      if (uploadedPath) void deleteGemFile(uploadedPath);
      setSaveError(err instanceof Error ? err.message : "could not save");
      setBusy(false);
    }
  }

  const canSubmit = mode === "media" ? Boolean(file && troveId) : Boolean(url && troveId);

  return (
    <Sheet title={mode === "link" ? "save link" : "add photo or video"}>
      <form onSubmit={submit} className="flex flex-col gap-4 pb-2">
        {mode === "media" ? (
          <MediaPicker file={file} onChange={setFile} previewUrl={previewUrl} />
        ) : (
          <LinkPicker
            url={url}
            onUrlChange={setUrl}
            onFetchPreview={fetchPreview}
            loading={previewLoading}
            error={previewError}
            preview={preview}
          />
        )}

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

        <TextField
          kind="textarea"
          label="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="optional"
          maxLength={500}
        />

        <ChipInput
          label="Tags"
          values={tags}
          onChange={setTags}
          suggestions={tagOptions.map((t) => t.name)}
        />

        {saveError ? (
          <p className="rounded-2xl border border-danger/30 bg-danger/10 px-3 py-2 text-[12.5px] text-danger">
            {saveError}
          </p>
        ) : null}

        <Button type="submit" disabled={busy || !canSubmit}>
          {busy ? <Spinner /> : "save"}
        </Button>
      </form>
    </Sheet>
  );
}

function MediaPicker({
  file,
  onChange,
  previewUrl,
}: {
  file: File | null;
  onChange: (f: File | null) => void;
  previewUrl: string | null;
}) {
  return (
    <div>
      <span className="mb-1.5 block px-1 text-[12.5px] font-medium lowercase text-text-subtle">
        photo or video
      </span>
      <label className="tappable group relative flex h-44 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border-strong bg-surface-2/40">
        {previewUrl && file ? (
          file.type.startsWith("video/") ? (
            <video src={previewUrl} className="h-full w-full object-cover" muted />
          ) : (
            <Image src={previewUrl} alt="" fill sizes="600px" className="object-cover" unoptimized />
          )
        ) : (
          <div className="px-6 text-center">
            <div className="text-[14px] font-semibold lowercase text-text">tap to choose a file</div>
            <div className="mt-1 text-[12.5px] lowercase text-text-subtle">
              jpg, png, webp, mp4, mov, or gif
            </div>
          </div>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );
}

function LinkPicker({
  url,
  onUrlChange,
  onFetchPreview,
  loading,
  error,
  preview,
}: {
  url: string;
  onUrlChange: (v: string) => void;
  onFetchPreview: () => void;
  loading: boolean;
  error: string | null;
  preview:
    | {
        title: string | null;
        description: string | null;
        thumbnailUrl: string | null;
        siteName: string | null;
      }
    | null;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <TextField
            label="url"
            type="url"
            inputMode="url"
            placeholder="https://"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            autoFocus
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={onFetchPreview}
          disabled={loading || url.trim().length === 0}
          className="!h-12 !w-auto px-4 text-[13px]"
        >
          {loading ? "fetching…" : "preview"}
        </Button>
      </div>

      {error ? (
        <p className="rounded-2xl border border-danger/30 bg-danger/10 px-3 py-2 text-[12.5px] text-danger">
          {error}
        </p>
      ) : null}

      <AnimatePresence>
        {preview ? (
          <motion.div
            key="link-preview"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden rounded-2xl border border-border bg-surface-2/60"
          >
            {preview.thumbnailUrl ? (
              <div className="relative aspect-[16/9] w-full bg-surface-3">
                <Image
                  src={preview.thumbnailUrl}
                  alt=""
                  fill
                  sizes="600px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : null}
            <div className="p-3">
              {preview.siteName ? (
                <div className="text-[11.5px] font-medium lowercase text-text-subtle">
                  {preview.siteName}
                </div>
              ) : null}
              {preview.title ? (
                <div className="mt-0.5 line-clamp-2 text-[14px] font-semibold text-text">
                  {preview.title}
                </div>
              ) : null}
              {preview.description ? (
                <div className="mt-1 line-clamp-2 text-[12.5px] text-text-muted">
                  {preview.description}
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
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
            // Don't let the parent gem form submit on Enter.
            if (e.key === "Enter") {
              e.preventDefault();
              if (canCreate) submit();
            }
          }}
          className="w-full bg-transparent text-[16px] font-medium text-text outline-none placeholder:text-text-subtle"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="description (optional)"
          rows={2}
          maxLength={280}
          className="w-full resize-none bg-transparent text-[16px] leading-relaxed text-text outline-none placeholder:text-text-subtle"
        />
        {error ? (
          <p className="text-[12.5px] text-danger">{error}</p>
        ) : null}
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
              "tappable inline-flex items-center justify-center rounded-chip px-3 py-1.5 text-[13px] font-medium lowercase min-w-[64px]",
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
