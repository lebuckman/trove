import Link from "next/link";

/**
 * In-page hero header. Every page uses this so the large title lands at the
 * exact same position and size across the app. The optional back chevron is
 * absolutely positioned in the top padding zone, so its presence never
 * shifts the title down — navigating between pages keeps the title put.
 */
export function PageHeader({
  title,
  subtitle,
  description,
  backHref,
  leading,
  titleAction,
  inlineAction,
}: {
  title: string;
  /** Small line directly under the title (e.g. "6 troves"). */
  subtitle?: string;
  /** Longer paragraph under the title (e.g. trove description). */
  description?: string;
  /** Renders a floating back chevron in the top-left chrome zone. */
  backHref?: string;
  /** Element before the title (e.g. profile avatar). */
  leading?: React.ReactNode;
  /** Small action right beside the title (e.g. edit pencil). */
  titleAction?: React.ReactNode;
  /** Action pinned to the far right (e.g. overflow menu, new-tag button). */
  inlineAction?: React.ReactNode;
}) {
  return (
    <header className="relative px-5 pt-14 pb-5 lg:px-10 lg:pt-16 lg:pb-7">
      {backHref ? (
        <Link
          href={backHref}
          aria-label="Back"
          className="tappable absolute left-3 top-4 flex h-10 w-10 items-center justify-center rounded-full text-text lg:left-8 lg:top-5"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {leading}
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="min-w-0 truncate text-[34px] font-bold leading-[1.05] tracking-tight lowercase lg:text-[44px] xl:text-[50px]">
              {title}
            </h1>
            {titleAction}
          </div>
        </div>
        {inlineAction ? <div className="shrink-0 pt-1.5">{inlineAction}</div> : null}
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
