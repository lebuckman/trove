"use client";

import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { CreateSheet } from "./CreateSheet";
import { NewTroveSheet } from "./NewTroveSheet";
import { AddGemSheet } from "./AddGemSheet";
import { EditTroveSheet } from "./EditTroveSheet";
import { DeleteTroveSheet } from "./DeleteTroveSheet";
import { DeleteTagSheet } from "./DeleteTagSheet";
import { EditGemTagsSheet } from "./EditGemTagsSheet";
import { EditTagSheet } from "./EditTagSheet";
import { MoveGemsSheet } from "./MoveGemsSheet";
import { NewTagSheet } from "./NewTagSheet";
import { SortSheet } from "./SortSheet";
import { EditProfileSheet } from "./EditProfileSheet";
import { GemLightbox } from "@/components/gems/GemLightbox";

/**
 * Reads the `?sheet=…` and `?gem=…` query params and renders the
 * matching overlay. Overlays are dismissed by removing the param
 * (browser back also works). Wrapped in AnimatePresence so the
 * unmount path can run an exit animation.
 */
export function Sheets() {
  const params = useSearchParams();
  const sheet = params.get("sheet");
  const gemId = params.get("gem");

  // Lightbox renders first so sheets opened from inside it (e.g. edit-tags,
  // move) layer above it instead of disappearing underneath.
  return (
    <>
      <AnimatePresence>
        {gemId ? <GemLightbox key="lightbox" gemId={gemId} /> : null}
      </AnimatePresence>
      <AnimatePresence>
        {sheet === "create" ? <CreateSheet key="create" /> : null}
        {sheet === "new-trove" ? <NewTroveSheet key="new-trove" /> : null}
        {sheet === "add-media" ? (
          <AddGemSheet key="add-media" mode="media" />
        ) : null}
        {sheet === "add-link" ? (
          <AddGemSheet key="add-link" mode="link" />
        ) : null}
        {sheet === "edit-trove" ? <EditTroveSheet key="edit-trove" /> : null}
        {sheet === "delete-trove" ? (
          <DeleteTroveSheet key="delete-trove" />
        ) : null}
        {sheet === "move" ? <MoveGemsSheet key="move" /> : null}
        {sheet === "sort" ? <SortSheet key="sort" /> : null}
        {sheet === "new-tag" ? <NewTagSheet key="new-tag" /> : null}
        {sheet === "edit-tag" ? <EditTagSheet key="edit-tag" /> : null}
        {sheet === "delete-tag" ? <DeleteTagSheet key="delete-tag" /> : null}
        {sheet === "edit-profile" ? (
          <EditProfileSheet key="edit-profile" />
        ) : null}
        {sheet === "edit-gem-tags" ? (
          <EditGemTagsSheet key="edit-gem-tags" />
        ) : null}
      </AnimatePresence>
    </>
  );
}
