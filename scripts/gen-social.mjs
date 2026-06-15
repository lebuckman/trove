// Generates the GitHub social preview card (1280x640). Run:
//   node scripts/gen-social.mjs
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const W = 1280;
const H = 640;
const cx = W / 2;

// Faceted gem glyph (matches the app icon), centred at (gx, gy) in a box of
// side `s`, teal with a small gold sparkle.
function gem(gx, gy, s) {
  const bx = gx - s / 2;
  const by = gy - s / 2;
  const x = (v) => (bx + v * s).toFixed(1);
  const y = (v) => (by + v * s).toFixed(1);
  const sw = (s * 0.025).toFixed(1);
  const sp = s * 0.16; // sparkle scale
  const spx = bx + s * 0.9;
  const spy = by + s * 0.02;
  return `
    <path d="M ${x(0.25)} ${y(0.22)} L ${x(0.75)} ${y(0.22)} L ${x(0.92)} ${y(0.45)} L ${x(0.5)} ${y(0.9)} L ${x(0.08)} ${y(0.45)} Z" fill="url(#teal)"/>
    <g stroke="#0d0c0a" stroke-width="${sw}" stroke-linejoin="round" fill="none" opacity="0.92">
      <path d="M ${x(0.08)} ${y(0.45)} L ${x(0.92)} ${y(0.45)}"/>
      <path d="M ${x(0.39)} ${y(0.22)} L ${x(0.32)} ${y(0.45)} L ${x(0.5)} ${y(0.9)}"/>
      <path d="M ${x(0.61)} ${y(0.22)} L ${x(0.68)} ${y(0.45)} L ${x(0.5)} ${y(0.9)}"/>
    </g>
    <path d="M ${spx} ${spy} l ${sp * 0.28} ${sp * 0.72} l ${sp * 0.72} ${sp * 0.28} l ${-sp * 0.72} ${sp * 0.28} l ${-sp * 0.28} ${sp * 0.72} l ${-sp * 0.28} ${-sp * 0.72} l ${-sp * 0.72} ${-sp * 0.28} l ${sp * 0.72} ${-sp * 0.28} Z" fill="#e8c268"/>`;
}

const font = "SF Pro Display, Helvetica Neue, Helvetica, Arial, sans-serif";

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#16140f"/>
      <stop offset="1" stop-color="#0d0c0a"/>
    </linearGradient>
    <linearGradient id="teal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2dd4bf"/>
      <stop offset="1" stop-color="#0d9488"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#17b3a3" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#17b3a3" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="${cx}" cy="232" r="220" fill="url(#glow)"/>

  ${gem(cx, 232, 150)}

  <text x="${cx}" y="438" text-anchor="middle" font-family="${font}" font-weight="800" font-size="116" letter-spacing="-4" fill="#f5f3ef">trove</text>
  <text x="${cx}" y="500" text-anchor="middle" font-family="${font}" font-weight="500" font-size="31" letter-spacing="0.2" fill="#9c978d">a private gallery for the things worth keeping</text>
</svg>`;

await mkdir("docs", { recursive: true });
await sharp(Buffer.from(svg)).png().toFile("docs/social-preview.png");
console.log("wrote docs/social-preview.png (1280x640)");
