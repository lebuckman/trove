"use client";

import { useEffect, useState } from "react";

/**
 * Animates a number from 0 up to `value` once, on mount. Used as the
 * "skeleton alternative" for stat lines: the text is present immediately
 * (starting at 0) and counts up as the page's heavier content streams in.
 *
 * Renders 0 during SSR and the first client paint, then animates — so there
 * is never a flash from the final value back to 0.
 */
export function CountUp({
  value,
  durationMs = 750,
}: {
  value: number;
  durationMs?: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    // duration 0 (reduced motion or non-positive target) snaps on the first
    // frame. Keeping the only setState inside rAF avoids a synchronous
    // state write during the effect.
    const dur = reduce || value <= 0 ? 0 : durationMs;

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = dur <= 0 ? 1 : Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplay(Math.round(eased * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return <span className="tabular-nums">{display}</span>;
}
