/** Shimmer placeholder columns matching the gem masonry, shown by
 *  route-level loading.tsx so navigation feels instant. */
export function MasonrySkeleton() {
  // Varied heights so the columns read as a real masonry, not a grid.
  const heights = [
    220, 300, 180, 260, 200, 320, 240, 190, 280, 210, 300, 230, 250, 200, 290,
  ];
  return (
    <div className="columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 xl:columns-5">
      {heights.map((h, i) => (
        <div
          key={i}
          className="mb-3 animate-pulse rounded-card bg-surface-2"
          style={{ height: h }}
        />
      ))}
    </div>
  );
}
