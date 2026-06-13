/**
 * In-page hero header. iOS-style large title that scrolls with the content
 * (TopBar handles the small, sticky chrome bar above it when needed).
 */
export function PageHeader({
  title,
  subtitle,
  description,
  inlineAction,
  compact,
}: {
  title: string;
  /** Small line directly under the title (e.g. "6 collections"). */
  subtitle?: string;
  /** Longer paragraph under the title (e.g. trove description). */
  description?: string;
  /** Rendered to the right of the title on the same row. */
  inlineAction?: React.ReactNode;
  /** Tighter top padding for pages that already have a TopBar above. */
  compact?: boolean;
}) {
  return (
    <header
      className={
        compact
          ? "px-5 pt-2 pb-5 lg:px-10 lg:pb-7"
          : "px-5 pt-14 pb-5 lg:px-10 lg:pt-16 lg:pb-8"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <h1 className="min-w-0 text-[36px] font-bold leading-[1.05] tracking-tight lowercase lg:text-[48px] xl:text-[56px]">
          {title}
        </h1>
        {inlineAction ? <div className="shrink-0 pt-2">{inlineAction}</div> : null}
      </div>
      {subtitle ? (
        <p className="mt-2 text-[14px] lowercase text-text-muted lg:text-[16px]">
          {subtitle}
        </p>
      ) : null}
      {description ? (
        <p className="mt-2.5 max-w-prose text-[15px] leading-relaxed text-text-muted lg:text-[17px]">
          {description}
        </p>
      ) : null}
    </header>
  );
}
