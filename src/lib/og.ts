import ogs from "open-graph-scraper";

export type LinkPreview = {
  url: string;
  title: string | null;
  description: string | null;
  thumbnailUrl: string | null;
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

export async function fetchLinkPreview(raw: string): Promise<LinkPreview | null> {
  const parsed = isPubliclyFetchableUrl(raw);
  if (!parsed) return null;

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

  const thumb = Array.isArray(result.ogImage) ? result.ogImage[0]?.url : undefined;
  return {
    url: parsed.toString(),
    title: result.ogTitle ?? result.twitterTitle ?? null,
    description: result.ogDescription ?? result.twitterDescription ?? null,
    thumbnailUrl: thumb ?? null,
    siteName: result.ogSiteName ?? null,
  };
}
