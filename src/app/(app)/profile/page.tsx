import { Suspense } from "react";
import Image from "next/image";
import { ProfileMenu } from "@/components/profile/ProfileMenu";
import { TrovesGrid } from "@/components/troves/TrovesGrid";
import { EmptyState, TrovesEmptyIcon } from "@/components/ui/EmptyState";
import { getProfile } from "@/lib/queries/profile";
import { listTroves } from "@/lib/queries/troves";
import pkg from "../../../../package.json";

const REPO_URL = "https://github.com/lebuckman/trove";

export const metadata = { title: "profile" };

export default async function ProfilePage() {
  const [profile, troves] = await Promise.all([getProfile(), listTroves()]);
  const isEmpty = troves.length === 0;
  const gemTotal = troves.reduce((sum, t) => sum + t.gem_count, 0);

  return (
    <>
      <header className="px-5 pt-14 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar url={profile?.avatar_url ?? null} />
            <div className="min-w-0">
              <h1 className="truncate text-[28px] font-bold leading-[1.1] tracking-tight lowercase">
                {profile?.display_name ?? "your trove"}
              </h1>
              <p className="mt-1 text-[14px] lowercase text-text-muted">
                {isEmpty
                  ? "make your first trove"
                  : `${troves.length} ${troves.length === 1 ? "trove" : "troves"} · ${gemTotal} ${gemTotal === 1 ? "gem" : "gems"}`}
              </p>
            </div>
          </div>
          <div className="shrink-0 pt-1">
            <Suspense fallback={null}>
              <ProfileMenu repoUrl={REPO_URL} version={pkg.version} />
            </Suspense>
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 pb-8">
        {isEmpty ? (
          <EmptyState
            icon={<TrovesEmptyIcon />}
            title="no troves yet"
            description="troves hold your gems, grouped however you like."
            action={{ label: "new trove", href: "/profile?sheet=new-trove" }}
          />
        ) : (
          <Suspense fallback={null}>
            <TrovesGrid troves={troves} />
          </Suspense>
        )}
      </main>
    </>
  );
}

function Avatar({ url }: { url: string | null }) {
  if (!url) {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 20.5c1.5-3.4 4.2-5 7.5-5s6 1.6 7.5 5" />
        </svg>
      </div>
    );
  }
  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border-strong">
      <Image src={url} alt="" fill sizes="64px" className="object-cover" />
    </div>
  );
}
