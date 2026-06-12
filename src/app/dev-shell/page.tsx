import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState, GemsEmptyIcon } from "@/components/ui/EmptyState";

// Dev-only playground for verifying shell chrome without a session.
export default function DevShell() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <AppShell>
      <PageHeader title="dev shell" subtitle="chrome playground" />
      <EmptyState
        icon={<GemsEmptyIcon />}
        title="no gems yet"
        description="stash your first gem and it will show up here."
        action={{ label: "add a gem", href: "/dev-shell?sheet=create" }}
      />
    </AppShell>
  );
}
