import { Suspense } from "react";
import { BottomNav } from "./BottomNav";
import { GemListProvider } from "@/components/gems/GemListContext";
import { Sheets } from "@/components/sheets/Sheets";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <GemListProvider>
      <div className="mx-auto flex min-h-dvh w-full max-w-[1600px] flex-col pb-[calc(96px+env(safe-area-inset-bottom))]">
        {children}
      </div>
      {/* BottomNav + Sheets read search params; Suspense is required in App Router. */}
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
      <Suspense fallback={null}>
        <Sheets />
      </Suspense>
    </GemListProvider>
  );
}
