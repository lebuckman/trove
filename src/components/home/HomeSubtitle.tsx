"use client";

import { CountUp } from "@/components/ui/CountUp";

export function HomeSubtitle({ count }: { count: number }) {
  if (count === 0) return <>gems from every trove appear here</>;
  return (
    <>
      <CountUp value={count} /> {count === 1 ? "gem" : "gems"} across your troves
    </>
  );
}
