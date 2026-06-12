"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function GoogleSignInButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError("could not start sign-in. try again.");
      setBusy(false);
    }
    // On success the browser navigates away to Google.
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={signIn}
        disabled={busy}
        className="tappable inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-accent text-[15px] font-semibold lowercase text-bg disabled:opacity-60"
      >
        <GoogleIcon />
        {busy ? "redirecting…" : "continue with google"}
      </button>
      {error ? (
        <p className="text-[13px] lowercase text-danger">{error}</p>
      ) : null}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="currentColor">
      <path d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.74 2.98-4.31 2.98-7.35z" />
      <path d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.04.95-3.38.95-2.6 0-4.8-1.75-5.58-4.1H3.07v2.58A10 10 0 0 0 12 22z" />
      <path d="M6.42 13.93a6 6 0 0 1 0-3.86V7.49H3.07a10 10 0 0 0 0 9.02l3.35-2.58z" />
      <path d="M12 5.97c1.47 0 2.78.5 3.82 1.5l2.86-2.86A9.97 9.97 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.35 2.58C7.2 7.72 9.4 5.97 12 5.97z" />
    </svg>
  );
}
