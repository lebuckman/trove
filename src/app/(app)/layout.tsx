import { AppShell } from "@/components/layout/AppShell";

// Authenticated app surface — the proxy guarantees a session for
// everything inside this group.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
