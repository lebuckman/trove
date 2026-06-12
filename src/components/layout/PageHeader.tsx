/**
 * In-page hero header. iOS-style large title that scrolls with the content
 * (TopBar handles the small, sticky chrome bar above it when needed).
 */
export function PageHeader({
  title,
  subtitle,
  description,
  inlineAction,
}: {
  title: string;
  /** Small line directly under the title (e.g. "6 collections"). */
  subtitle?: string;
  /** Longer paragraph under the title (e.g. board description). */
  description?: string;
  /** Rendered to the right of the title on the same row. */
  inlineAction?: React.ReactNode;
}) {
  return (
    <header className="px-5 pt-14 pb-5">
      <div className="flex items-start justify-between gap-3">
        <h1 className="min-w-0 text-[36px] font-bold leading-[1.05] tracking-tight lowercase">
          {title}
        </h1>
        {inlineAction ? <div className="shrink-0 pt-2">{inlineAction}</div> : null}
      </div>
      {subtitle ? (
        <p className="mt-1.5 text-[14px] lowercase text-text-muted">{subtitle}</p>
      ) : null}
      {description ? (
        <p className="mt-2.5 max-w-prose text-[15px] leading-relaxed text-text-muted">
          {description}
        </p>
      ) : null}
    </header>
  );
}
