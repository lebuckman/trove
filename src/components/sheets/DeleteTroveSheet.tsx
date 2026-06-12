"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sheet, useCloseSheet } from "./Sheet";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { fetchTroveForEdit } from "@/lib/queries/client";
import { deleteTrove } from "@/lib/actions/troves";

export function DeleteTroveSheet() {
  const close = useCloseSheet();
  const router = useRouter();
  const pathname = usePathname();
  const troveId = pathname.match(/^\/troves\/([^/]+)/)?.[1];

  const [data, setData] = useState<{ name: string; count: number } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!troveId) return;
    let cancelled = false;
    fetchTroveForEdit(troveId).then((res) => {
      if (cancelled || !res) return;
      setData({ name: res.trove.name, count: res.trove.gem_count });
    });
    return () => {
      cancelled = true;
    };
  }, [troveId]);

  async function confirmDelete() {
    if (!troveId || busy) return;
    setBusy(true);
    try {
      await deleteTrove(troveId);
      close();
      router.push("/profile");
    } catch {
      setBusy(false);
    }
  }

  if (!data) return null;

  return (
    <Sheet title="delete trove?">
      <div className="flex flex-col gap-4 pb-2">
        <p className="text-[14.5px] leading-relaxed text-text-muted">
          this will permanently remove{" "}
          <span className="text-text">{data.name}</span> and its{" "}
          <span className="text-text">
            {data.count} {data.count === 1 ? "gem" : "gems"}
          </span>
          . this can&rsquo;t be undone.
        </p>
        <Button
          onClick={confirmDelete}
          disabled={busy}
          className="bg-danger text-bg hover:bg-danger"
        >
          {busy ? <Spinner /> : "delete trove"}
        </Button>
        <Button variant="secondary" onClick={close}>
          cancel
        </Button>
      </div>
    </Sheet>
  );
}
