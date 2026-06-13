import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  href: string;
  active?: boolean;
  count?: number;
};

export function TagChip({ name, href, active, count }: Props) {
  return (
    <Link
      href={href}
      scroll={false}
      className={cn(
        "tappable inline-flex shrink-0 items-center gap-1.5 rounded-chip border px-3 py-1.5 text-[13px] font-medium lowercase lg:px-4 lg:py-2 lg:text-[14.5px]",
        active
          ? "border-accent bg-accent text-bg"
          : "border-border bg-surface-2/60 text-text-muted hover:text-text",
      )}
    >
      <span>{name}</span>
      {count !== undefined ? (
        <span
          className={cn(
            "rounded-full px-1 text-[11px]",
            active ? "text-bg/70" : "text-text-subtle",
          )}
        >
          {count}
        </span>
      ) : null}
    </Link>
  );
}
