import Link from "next/link";

export const metadata = { title: "not found" };

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent-strong">
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12l4 6-10 12L2 9z" />
          <path d="M2 9h20M9.5 3 8 9l4 12M14.5 3 16 9l-4 12" />
        </svg>
      </div>
      <h1 className="mt-6 text-[28px] font-bold lowercase">nothing here</h1>
      <p className="mt-2 text-[15px] lowercase text-text-muted">
        this page doesn&rsquo;t exist, or the gem moved on.
      </p>
      <Link
        href="/"
        className="tappable mt-8 inline-flex h-11 items-center justify-center rounded-full bg-accent px-6 text-[14px] font-semibold lowercase text-bg hover:bg-accent-strong"
      >
        back home
      </Link>
    </main>
  );
}
