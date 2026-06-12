import type { Gem, GemType, Tag } from "./types";

export const STORAGE_BUCKET = "trove-media";
/** Signed URL lifetime. Long browse sessions past this need a refresh
 *  (page reload re-signs); tracked as a known v1 limitation. */
export const SIGNED_URL_TTL_SECONDS = 60 * 60;

/** Minimal structural type satisfied by both the browser and server
 *  Supabase clients — keeps these helpers usable from either side. */
type StorageCapableClient = {
  storage: {
    from(bucket: string): {
      createSignedUrls(
        paths: string[],
        expiresIn: number,
      ): Promise<{
        data:
          | { path: string | null; signedUrl: string | null }[]
          | null;
        error: Error | null;
      }>;
    };
  };
};

/**
 * Batch-sign storage paths. Returns a map of path → signed URL. Paths the
 * bucket rejects (deleted file, foreign user) are simply absent.
 */
export async function signedUrlMap(
  supabase: StorageCapableClient,
  paths: string[],
): Promise<Map<string, string>> {
  const unique = Array.from(new Set(paths.filter(Boolean)));
  if (unique.length === 0) return new Map();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrls(unique, SIGNED_URL_TTL_SECONDS);
  if (error) throw error;
  const map = new Map<string, string>();
  for (const row of data ?? []) {
    if (row.path && row.signedUrl) map.set(row.path, row.signedUrl);
  }
  return map;
}

/**
 * For a gem, return the URL the UI should render as its media:
 * - image/video: the signed URL for its storage object
 * - link: the OG thumbnail URL (may be null if no thumbnail was found)
 */
export function gemMediaUrl(
  input: {
    type: GemType;
    storage_path: string | null;
    og_thumbnail_url: string | null;
  },
  signed: Map<string, string>,
): string | null {
  if (input.type === "link") return input.og_thumbnail_url;
  if (input.storage_path) return signed.get(input.storage_path) ?? null;
  return null;
}

/** Drop gems that don't carry the given tag id. Null tagId = no filter. */
export function filterGemsByTag<T extends Pick<Gem, "tags">>(
  gems: T[],
  tagId: string | null,
): T[] {
  if (!tagId) return gems;
  return gems.filter((g) => g.tags.some((t) => t.id === tagId));
}

/** Tally gems per tag id across a list of gems. */
export function countGemsByTagFromGems(
  gems: Pick<Gem, "tags">[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const g of gems) {
    for (const t of g.tags) {
      counts[t.id] = (counts[t.id] ?? 0) + 1;
    }
  }
  return counts;
}

/** Compact a row's tag join into a flat Tag[]. Supabase's nested select for a
 *  many-to-many returns the related rows nested under the table name. */
export function flattenTags(
  raw: { tags?: Tag[] | Tag | null } | null | undefined,
): Tag[] {
  if (!raw?.tags) return [];
  return Array.isArray(raw.tags) ? raw.tags : [raw.tags];
}

/** Raw gem row shape shared by the server and client query helpers. */
export type GemRow = {
  id: string;
  trove_id: string;
  type: GemType;
  storage_path: string | null;
  mime_type: string | null;
  url: string | null;
  description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_thumbnail_url: string | null;
  og_site_name: string | null;
  width: number | null;
  height: number | null;
  position: number;
  created_at: string;
  tags: Tag[] | null;
};

export const GEM_SELECT_WITH_TAGS =
  "id, trove_id, type, storage_path, mime_type, url, description, og_title, og_description, og_thumbnail_url, og_site_name, width, height, position, created_at, tags(id, name)";

export function mapGem(row: GemRow, signed: Map<string, string>): Gem {
  return {
    id: row.id,
    trove_id: row.trove_id,
    type: row.type,
    storage_path: row.storage_path,
    mime_type: row.mime_type,
    url: row.url,
    description: row.description,
    og_title: row.og_title,
    og_description: row.og_description,
    og_thumbnail_url: row.og_thumbnail_url,
    og_site_name: row.og_site_name,
    width: row.width ?? 800,
    height: row.height ?? 800,
    position: row.position,
    created_at: row.created_at,
    media_url: gemMediaUrl(row, signed),
    tags: flattenTags(row),
  };
}

export async function mapGems(
  supabase: StorageCapableClient,
  rows: GemRow[],
): Promise<Gem[]> {
  const signed = await signedUrlMap(
    supabase,
    rows
      .map((r) => r.storage_path)
      .filter((p): p is string => Boolean(p)),
  );
  return rows.map((r) => mapGem(r, signed));
}
