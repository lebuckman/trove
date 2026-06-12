import type { NextConfig } from "next";

const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : undefined;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              // Signed URLs for the private trove-media bucket.
              pathname: "/storage/v1/object/sign/**",
            },
          ]
        : []),
      // OG thumbnails can live anywhere.
      { protocol: "https" as const, hostname: "**" },
    ],
  },
};

export default nextConfig;
