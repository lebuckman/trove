"use client";

import { CountUp } from "@/components/ui/CountUp";

export function ProfileSubtitle({
  troves,
  gems,
}: {
  troves: number;
  gems: number;
}) {
  if (troves === 0) return <>make your first trove</>;
  return (
    <>
      <CountUp value={troves} /> {troves === 1 ? "trove" : "troves"} ·{" "}
      <CountUp value={gems} /> {gems === 1 ? "gem" : "gems"}
    </>
  );
}
