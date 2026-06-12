import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Vertical empty-state slot: soft accent icon disc, lowercase title,
 * muted description, optional CTA. Used wherever a list has no rows.
 *
 * Pass an action as either a Link (`href`) or a button (`onClick`) — never both.
 */
type Action =
  | { label: string; href: string; onClick?: never }
  | { label: string; onClick: () => void; href?: never };

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: Action;
  secondaryAction?: Action;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex max-w-xs flex-col items-center gap-3 pt-20 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          {icon}
        </div>
      ) : null}
      <h2 className="text-[17px] font-semibold lowercase text-text">{title}</h2>
      {description ? (
        <p className="text-[13.5px] leading-relaxed lowercase text-text-muted">
          {description}
        </p>
      ) : null}
      {action ? (
        <div className="mt-3 flex w-full flex-col items-center gap-2">
          <ActionButton action={action} variant="primary" />
          {secondaryAction ? (
            <ActionButton action={secondaryAction} variant="ghost" />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ActionButton({
  action,
  variant,
}: {
  action: Action;
  variant: "primary" | "ghost";
}) {
  const className = cn(
    "tappable inline-flex h-11 items-center justify-center rounded-full px-5 text-[14px] font-semibold lowercase",
    variant === "primary"
      ? "bg-accent text-bg hover:bg-accent-strong"
      : "text-text-muted hover:text-text",
  );
  if (action.href) {
    return (
      <Link href={action.href} scroll={false} className={className}>
        {action.label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={className}>
      {action.label}
    </button>
  );
}

// ---------- shared icons ----------

export function TrovesEmptyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
      <path d="M17.25 14.5v6m-3-3h6" />
    </svg>
  );
}

export function GemsEmptyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l4 6-10 12L2 9z" />
      <path d="M2 9h20M9.5 3 8 9l4 12M14.5 3 16 9l-4 12" />
    </svg>
  );
}

export function SearchEmptyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function TagEmptyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z" />
      <circle cx="8" cy="8" r="1.4" />
    </svg>
  );
}
