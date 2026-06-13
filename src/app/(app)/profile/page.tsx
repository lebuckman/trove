import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
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
      <header className="px-5 pt-14 pb-5 lg:px-10 lg:pt-16 lg:pb-8">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar url={profile?.avatar_url ?? null} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="truncate text-[28px] font-bold leading-[1.1] tracking-tight lowercase lg:text-[32px]">
                  {profile?.display_name ?? "your trove"}
                </h1>
                <Link
                  href="/profile?sheet=edit-profile"
                  scroll={false}
                  aria-label="Edit profile"
                  className="tappable flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-text-subtle hover:bg-surface-2 hover:text-text"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </Link>
              </div>
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
      <main className="flex-1 px-4 pb-8 lg:px-10">
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
