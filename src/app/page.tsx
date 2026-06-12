export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 pt-12 pb-24">
      <header className="mb-8">
        <h1 className="text-[34px] leading-[1.1] font-bold lowercase">trove</h1>
        <p className="text-text-muted mt-1 lowercase">
          your gem gallery, coming together.
        </p>
      </header>
      <div className="rounded-card border border-border bg-surface p-5">
        <p className="text-sm text-text-muted lowercase">
          scaffold is in place. next: auth, troves, gems, and tags.
        </p>
      </div>
    </main>
  );
}
