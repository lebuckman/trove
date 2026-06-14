"use client";

import { CountUp } from "@/components/ui/CountUp";

export function TagsSubtitle({ count }: { count: number }) {
  if (count === 0) return <>tags appear here as you add them to gems</>;
  return (
    <>
      <CountUp value={count} /> {count === 1 ? "tag" : "tags"}
    </>
  );
}
