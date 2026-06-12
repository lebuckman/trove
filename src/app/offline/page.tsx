export const metadata = { title: "offline" };

export default function Offline() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="rounded-card border border-border bg-surface p-6">
        <h1 className="text-2xl font-bold lowercase">you&rsquo;re offline</h1>
        <p className="text-text-muted mt-2 text-sm lowercase">
          trove needs a connection to load new gems. cached pages may still
          work.
        </p>
      </div>
    </main>
  );
}
