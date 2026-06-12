// Generates the PWA icon set from an inline SVG. Run: node scripts/gen-icons.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

// Faceted gem in deep teal with a gold sparkle, on the warm dark bg.
// `pad` insets the glyph; maskable icons need extra safe-area padding.
function gemSvg({ size, pad, radius, bg = "#0d0c0a" }) {
  const s = size - pad * 2;
  const x = (v) => pad + v * s;
  const y = (v) => pad + v * s;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#14b8a6"/>
      <stop offset="1" stop-color="#0d9488"/>
    </linearGradient>
    <linearGradient id="bgg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#16140f"/>
      <stop offset="1" stop-color="${bg}"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" fill="url(#bgg)"/>
  <!-- gem body -->
  <path d="M ${x(0.25)} ${y(0.22)} L ${x(0.75)} ${y(0.22)} L ${x(0.92)} ${y(0.45)} L ${x(0.5)} ${y(0.88)} L ${x(0.08)} ${y(0.45)} Z"
        fill="url(#g)"/>
  <!-- facets -->
  <g stroke="${bg}" stroke-width="${s * 0.028}" stroke-linejoin="round" fill="none" opacity="0.9">
    <path d="M ${x(0.08)} ${y(0.45)} L ${x(0.92)} ${y(0.45)}"/>
    <path d="M ${x(0.39)} ${y(0.22)} L ${x(0.32)} ${y(0.45)} L ${x(0.5)} ${y(0.88)}"/>
    <path d="M ${x(0.61)} ${y(0.22)} L ${x(0.68)} ${y(0.45)} L ${x(0.5)} ${y(0.88)}"/>
  </g>
  <!-- gold sparkle -->
  <path d="M ${x(0.79)} ${y(0.08)} l ${s * 0.028} ${s * 0.072} l ${s * 0.072} ${s * 0.028} l ${-s * 0.072} ${s * 0.028} l ${-s * 0.028} ${s * 0.072} l ${-s * 0.028} ${-s * 0.072} l ${-s * 0.072} ${-s * 0.028} l ${s * 0.072} ${-s * 0.028} Z"
        fill="#e8c268"/>
</svg>`;
}

await mkdir("public/icons", { recursive: true });

const targets = [
  { file: "public/icons/icon-192.png", size: 192, pad: 28, radius: 42 },
  { file: "public/icons/icon-512.png", size: 512, pad: 76, radius: 112 },
  // Maskable: bigger safe area, square-ish corners (the platform masks it).
  { file: "public/icons/icon-maskable-512.png", size: 512, pad: 128, radius: 0 },
  { file: "public/icons/apple-touch-icon.png", size: 180, pad: 26, radius: 0 },
  // Served by Next's app-icon convention as the favicon.
  { file: "src/app/icon.png", size: 64, pad: 8, radius: 14 },
];

for (const t of targets) {
  const svg = gemSvg(t);
  await sharp(Buffer.from(svg)).png().toFile(t.file);
  console.log("wrote", t.file);
}
