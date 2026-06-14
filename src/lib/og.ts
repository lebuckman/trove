import ogs from "open-graph-scraper";

export type LinkPreview = {
  url: string;
  title: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  // Natural thumbnail dimensions when the source exposes them, so the gem
  // card can render at the right aspect instead of cropping a square.
  thumbnailWidth: number | null;
  thumbnailHeight: number | null;
  siteName: string | null;
};

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^169\.254\./,
  /^::1$/,
  /^fc/i,
  /^fd/i,
  /^fe80:/i,
];

export function isPubliclyFetchableUrl(raw: string): URL | null {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  const host = parsed.hostname.replace(/^\[|\]$/g, "");
  if (PRIVATE_HOST_PATTERNS.some((rx) => rx.test(host))) return null;
  return parsed;
}

function toNum(v: unknown): number | null {
  const n = typeof v === "string" ? parseInt(v, 10) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Drop thumbnail URLs that point at private/internal hosts — a page can
 *  advertise any og:image, and we don't want one aimed at an internal
 *  address to be stored and later fetched. */
function safeThumb(url: string | null | undefined): string | null {
  return url && isPubliclyFetchableUrl(url) ? url : null;
}

export async function fetchLinkPreview(raw: string): Promise<LinkPreview | null> {
  const parsed = isPubliclyFetchableUrl(raw);
  if (!parsed) return null;

  // TikTok serves no OG tags to non-browser user-agents; use its public
  // oEmbed endpoint instead.
  if (/(^|\.)tiktok\.com$/i.test(parsed.hostname)) {
    const oembed = await fetchTikTokOEmbed(parsed.toString());
    if (oembed) return oembed;
    // fall through to a generic scrape if oEmbed is unavailable
  }

  const { error, result } = await ogs({
    url: parsed.toString(),
    fetchOptions: {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; TroveBot/1.0; +https://github.com/)",
      },
    },
    timeout: 8000,
  });
  if (error) return null;

  const image = Array.isArray(result.ogImage) ? result.ogImage[0] : undefined;
  return {
    url: parsed.toString(),
    title: result.ogTitle ?? result.twitterTitle ?? null,
    description: result.ogDescription ?? result.twitterDescription ?? null,
    thumbnailUrl: safeThumb(image?.url),
    thumbnailWidth: toNum(image?.width),
    thumbnailHeight: toNum(image?.height),
    siteName: result.ogSiteName ?? null,
  };
}

async function fetchTikTokOEmbed(url: string): Promise<LinkPreview | null> {
  try {
    const res = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      title?: string;
      author_name?: string;
      thumbnail_url?: string;
      thumbnail_width?: number | string;
      thumbnail_height?: number | string;
    };
    if (!data.thumbnail_url && !data.title) return null;
    return {
      url,
      title: data.title || data.author_name || null,
      description: data.author_name ? `by ${data.author_name}` : null,
      thumbnailUrl: safeThumb(data.thumbnail_url),
      thumbnailWidth: toNum(data.thumbnail_width),
      thumbnailHeight: toNum(data.thumbnail_height),
      siteName: "TikTok",
    };
  } catch {
    return null;
  }
}
