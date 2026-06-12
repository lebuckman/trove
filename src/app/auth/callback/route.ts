import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth code exchange. Google redirects here (via Supabase) with ?code=…;
// we trade it for a session cookie and land the user on the app.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/"}`);
    }
  }

  return NextResponse.redirect(`${origin}/signin`);
}
