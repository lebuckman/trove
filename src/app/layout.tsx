import type { Metadata, Viewport } from "next";
import "./globals.css";

const description = "A personal gallery of gems: images, video, and links.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "trove",
    template: "%s · trove",
  },
  description,
  applicationName: "Trove",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Trove",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Trove",
    title: "trove",
    description,
  },
  twitter: {
    card: "summary",
    title: "trove",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0c0a",
  width: "device-width",
  initialScale: 1,
  // Pinch-zoom left enabled (accessibility). Inputs use a 16px base so iOS
  // doesn't auto-zoom them on focus.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-bg text-text">{children}</body>
    </html>
  );
}
