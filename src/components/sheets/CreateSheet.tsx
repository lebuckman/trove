"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Sheet } from "./Sheet";

function Row({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="tappable flex w-full items-center gap-4 rounded-2xl border border-border bg-surface-2/70 px-4 py-3.5 text-left"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-strong">
        {icon}
      </div>
      <div className="flex-1 text-[15px] font-semibold lowercase">{label}</div>
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-text-subtle" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  );
}

const PhotoIcon = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <circle cx="9" cy="11" r="1.6" />
    <path d="m3.5 17 5-4.5 4.5 4 3-2.5 4.5 4" />
  </svg>
);

const LinkIcon = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
  </svg>
);

const TroveIcon = (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
    <path d="M17.25 14.5v6m-3-3h6" />
  </svg>
);

export function CreateSheet() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigateToSheet(name: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sheet", name);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <Sheet title="create">
      <div className="flex flex-col gap-2.5 pb-2">
        <Row icon={PhotoIcon} label="photo or video" onClick={() => navigateToSheet("add-media")} />
        <Row icon={LinkIcon} label="link" onClick={() => navigateToSheet("add-link")} />
        <Row icon={TroveIcon} label="new trove" onClick={() => navigateToSheet("new-trove")} />
      </div>
    </Sheet>
  );
}
