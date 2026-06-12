/**
 * Canonical data shapes consumed by the UI. These differ slightly from the
 * raw Supabase row shapes — they pre-compute a few fields the components
 * actually want:
 *
 * - Gem has `media_url` (a signed URL for storage files, or
 *   og_thumbnail_url for links) and `tags` (joined from gem_tags).
 * - Trove has `cover_url` (the cover gem's media URL, with fallback to
 *   the most recent gem) and `gem_count`.
 *
 * Both width and height on Gem are non-null here — query helpers default
 * them to 800 when the DB row has nulls, so the masonry layout never breaks.
 */

import type { GemType } from "@/lib/supabase/types";

export type { GemType };

export type Tag = {
  id: string;
  name: string;
};

export type Trove = {
  id: string;
  name: string;
  description: string | null;
  cover_gem_id: string | null;
  position: number;
  created_at: string;
  cover_url: string | null;
  gem_count: number;
};

export type Gem = {
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
  width: number;
  height: number;
  position: number;
  created_at: string;
  media_url: string | null;
  tags: Tag[];
};

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
};
