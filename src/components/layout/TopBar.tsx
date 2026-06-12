import Link from "next/link";

/**
 * Slim sticky chrome bar shown above the page. Usually only on detail
 * pages — top-level tabs (home, profile) skip this and let their
 * PageHeader sit right at the top.
 */
export function TopBar({
  backHref,
  action,
}: {
  backHref?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="surface-blur sticky top-0 z-30 pt-5">
      <div className="mx-auto flex h-12 max-w-2xl items-center px-3">
        {backHref ? (
          <Link
            href={backHref}
            className="tappable flex h-11 w-11 items-center justify-center rounded-full text-text"
            aria-label="Back"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
        ) : (
          <div className="w-11" />
        )}
        <div className="flex-1" />
        {action ?? <div className="w-11" />}
      </div>
    </header>
  );
}
