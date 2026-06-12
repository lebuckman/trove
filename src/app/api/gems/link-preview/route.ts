import { NextResponse } from "next/server";
import { fetchLinkPreview } from "@/lib/og";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { url?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.url !== "string" || body.url.length === 0) {
    return NextResponse.json({ error: "Missing 'url'" }, { status: 400 });
  }

  const preview = await fetchLinkPreview(body.url);
  if (!preview) {
    return NextResponse.json(
      { error: "Could not fetch preview" },
      { status: 422 },
    );
  }

  return NextResponse.json(preview);
}
