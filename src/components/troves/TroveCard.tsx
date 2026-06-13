import Link from "next/link";
import Image from "next/image";
import type { Trove } from "@/lib/queries/types";

export function TroveCard({
  trove,
  priority,
}: {
  trove: Trove;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/troves/${trove.id}`}
      className="tappable group relative block aspect-[3/4] overflow-hidden rounded-card border border-border bg-surface-2 transition-shadow duration-300 lg:hover:shadow-[0_12px_34px_-8px_rgba(45,212,191,0.35)] lg:hover:ring-1 lg:hover:ring-accent-strong/50"
    >
      {trove.cover_url ? (
        <Image
          src={trove.cover_url}
          alt=""
          fill
          sizes="(min-width: 1024px) 280px, (min-width: 640px) 320px, 45vw"
          className="object-cover transition-transform duration-[450ms] ease-out lg:group-hover:scale-[1.05]"
          priority={priority}
        />
      ) : (
        <EmptyCover name={trove.name} />
      )}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3.5">
        <div className="flex items-baseline gap-2">
          <span className="text-[18px] font-semibold leading-tight lowercase text-white drop-shadow-sm">
            {trove.name}
          </span>
          <span className="text-[14px] font-medium leading-tight text-white/55">
            {trove.gem_count}
          </span>
        </div>
      </div>
    </Link>
  );
}

function EmptyCover({ name }: { name: string }) {
  // Deterministic gradient angle per trove name.
  const seed = Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0);
  const angle = seed % 360;
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background: `linear-gradient(${angle}deg, var(--color-surface-3), var(--color-surface-2))`,
      }}
    >
      <span className="select-none text-7xl font-bold text-white/10 mix-blend-overlay">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
