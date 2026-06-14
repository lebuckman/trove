/**
 * Client-side helpers for uploading gem media directly to Supabase
 * Storage and pulling dimensions out of the chosen file before we hand
 * the metadata to a Server Action.
 *
 * Paths are <user_id>/<uuid>.<ext> — the storage RLS policies key on the
 * first segment matching auth.uid(), so the path itself enforces ownership.
 */

import { createClient } from "@/lib/supabase/client";
import { STORAGE_BUCKET } from "@/lib/queries/util";

export type UploadedGem = {
  storage_path: string;
  mime_type: string;
};

export async function uploadGemFile(file: File): Promise<UploadedGem> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("not signed in");

  const ext = (file.name.split(".").pop() ?? "bin").toLowerCase();
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return { storage_path: path, mime_type: file.type };
}

/** Remove an uploaded file. Used to clean up when the gem row insert fails
 *  after the upload already succeeded, so no orphan is left behind. */
export async function deleteGemFile(path: string): Promise<void> {
  const supabase = createClient();
  await supabase.storage.from(STORAGE_BUCKET).remove([path]);
}

export type Dimensions = { width: number; height: number };

export function extractDimensions(file: File): Promise<Dimensions> {
  if (file.type.startsWith("video/")) return extractVideoDimensions(file);
  return extractImageDimensions(file);
}

/** Natural dimensions of a remote image (e.g. a link's OG thumbnail), so a
 *  link gem's card can use the right aspect. Resolves null if it can't load. */
export function imageDimensionsFromUrl(url: string): Promise<Dimensions | null> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function extractImageDimensions(file: File): Promise<Dimensions> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image dimensions"));
    };
    img.src = url;
  });
}

function extractVideoDimensions(file: File): Promise<Dimensions> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({ width: video.videoWidth, height: video.videoHeight });
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read video dimensions"));
    };
    video.src = url;
  });
}
