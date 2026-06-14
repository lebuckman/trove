import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
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

  const subtitle = isEmpty
    ? "make your first trove"
    : `${troves.length} ${troves.length === 1 ? "trove" : "troves"} · ${gemTotal} ${gemTotal === 1 ? "gem" : "gems"}`;

  return (
    <>
      <PageHeader
        title={profile?.display_name ?? "your trove"}
        subtitle={subtitle}
        leading={<Avatar url={profile?.avatar_url ?? null} />}
        titleAction={
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
        }
        inlineAction={
          <Suspense fallback={null}>
            <ProfileMenu repoUrl={REPO_URL} version={pkg.version} />
          </Suspense>
        }
      />
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
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-strong lg:h-[72px] lg:w-[72px]">
        <svg viewBox="0 0 24 24" className="h-8 w-8 lg:h-9 lg:w-9" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 20.5c1.5-3.4 4.2-5 7.5-5s6 1.6 7.5 5" />
        </svg>
      </div>
    );
  }
  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border-strong lg:h-[72px] lg:w-[72px]">
      <Image src={url} alt="" fill sizes="72px" className="object-cover" />
    </div>
  );
}
