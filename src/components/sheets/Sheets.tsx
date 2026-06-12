"use client";

import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { CreateSheet } from "./CreateSheet";

/**
 * Reads the `?sheet=…` and `?gem=…` query params and renders the
 * matching overlay. Overlays are dismissed by removing the param
 * (browser back also works). Wrapped in AnimatePresence so the
 * unmount path can run an exit animation.
 *
 * The lightbox (keyed by `?gem=`) renders first so sheets opened from
 * inside it (e.g. edit-tags, move) layer above it.
 */
export function Sheets() {
  const params = useSearchParams();
  const sheet = params.get("sheet");

  return (
    <>
      <AnimatePresence>
        {sheet === "create" ? <CreateSheet key="create" /> : null}
      </AnimatePresence>
    </>
  );
}
