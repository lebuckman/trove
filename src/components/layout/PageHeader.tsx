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
  narrow,
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
  /** Centered narrow columns (e.g. tags): keep px-5 so the header lines up
   *  with the content instead of indenting further on desktop. */
  narrow?: boolean;
}) {
  return (
    <header
      className={
        narrow
          ? "relative px-5 pt-[4.5rem] pb-5 lg:pt-20"
          : "relative px-5 pt-[4.5rem] pb-5 lg:px-10 lg:pt-20 lg:pb-7"
      }
    >
      {backHref ? (
        <Link
          href={backHref}
          aria-label="Back"
          className={
            narrow
              ? "tappable absolute left-3 top-5 flex h-10 w-10 items-center justify-center rounded-full text-text lg:top-7"
              : "tappable absolute left-3 top-5 flex h-10 w-10 items-center justify-center rounded-full text-text lg:left-8 lg:top-7"
          }
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        {/* items-start keeps the title pinned to the top so its position
            stays identical across pages even when a tall avatar leads it.
            The subtitle lives in this column so it aligns under the title
            (beside the avatar), not under the avatar itself. */}
        <div className="flex min-w-0 items-start gap-4">
          {leading}
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="min-w-0 truncate pb-1 text-[34px] font-bold leading-[1.2] tracking-tight lowercase lg:text-[44px] xl:text-[50px]">
                {title}
              </h1>
              {titleAction}
            </div>
            {subtitle ? (
              <p className="-mt-0.5 text-[14px] lowercase text-text-muted lg:text-[16px]">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {inlineAction ? <div className="shrink-0 pt-1.5">{inlineAction}</div> : null}
      </div>

      {description ? (
        <p className="mt-2.5 max-w-prose text-[15px] leading-relaxed text-text-muted lg:text-[17px]">
          {description}
        </p>
      ) : null}
    </header>
  );
}
