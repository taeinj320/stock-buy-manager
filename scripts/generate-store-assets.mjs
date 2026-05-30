#!/usr/bin/env node
/**
 * 웹 스토어용 로고·썸네일 (스크린샷은 실제 앱 캡처로 별도)
 * 실행: npm run store-assets
 */
import { mkdirSync, writeFileSync, unlinkSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "public", "store-assets");

const GRAD = `
  <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#0ea5e9"/>
    <stop offset="100%" stop-color="#4f46e5"/>
  </linearGradient>
  <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#f8fafc"/>
    <stop offset="45%" stop-color="#e0f2fe"/>
    <stop offset="100%" stop-color="#e0e7ff"/>
  </linearGradient>
`;

const THUMB_TAGLINE = "내 종목, 차트로 먼저 본다";
const THUMB_SUB = "흐름·뉴스·공시를 한곳에서";

function escXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function chartIcon(cx, cy, size, stroke = "#fff") {
  const half = size / 2;
  return `
    <g transform="translate(${cx - half},${cy - half})">
      <path d="M4 ${size * 0.75} L${size * 0.28} ${size * 0.42} L${size * 0.5} ${size * 0.55} L${size * 0.88} ${size * 0.22}"
        fill="none" stroke="${stroke}" stroke-width="${size * 0.08}" stroke-linecap="round" stroke-linejoin="round"/>
    </g>`;
}

function logoSvg(dark = false) {
  const bg = dark ? "#0f172a" : "#ffffff";
  const title = dark ? "#f8fafc" : "#0f172a";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <defs>${GRAD}</defs>
    <rect width="600" height="600" fill="${bg}" rx="120"/>
    <rect x="150" y="130" width="300" height="300" rx="72" fill="url(#brand)"/>
    ${chartIcon(300, 280, 140)}
    <text x="300" y="510" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="48" font-weight="700" fill="${title}">ChartCheck</text>
  </svg>`;
}

function thumbnailSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1932" height="828" viewBox="0 0 1932 828">
    <defs>
      ${GRAD}
      <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.2" fill="#64748b" opacity="0.15"/>
      </pattern>
    </defs>
    <rect width="1932" height="828" fill="url(#bg)"/>
    <rect width="1932" height="828" fill="url(#dots)"/>
    <ellipse cx="1650" cy="100" rx="300" ry="220" fill="#38bdf8" opacity="0.22"/>
    <ellipse cx="180" cy="720" rx="340" ry="240" fill="#818cf8" opacity="0.16"/>
    <rect x="100" y="200" width="100" height="100" rx="28" fill="url(#brand)"/>
    ${chartIcon(150, 250, 56)}
    <text x="220" y="265" font-family="system-ui,sans-serif" font-size="72" font-weight="700" fill="#0f172a">ChartCheck</text>
    <text x="220" y="340" font-family="system-ui,sans-serif" font-size="40" font-weight="600" fill="#1e293b">${escXml(THUMB_TAGLINE)}</text>
    <text x="220" y="395" font-family="system-ui,sans-serif" font-size="28" fill="#64748b">${escXml(THUMB_SUB)}</text>
  </svg>`;
}

const ASSETS = [
  { name: "app-logo.png", w: 600, h: 600, svg: logoSvg(false) },
  { name: "app-logo-dark.png", w: 600, h: 600, svg: logoSvg(true) },
  { name: "thumbnail.png", w: 1932, h: 828, svg: thumbnailSvg() },
];

const DEPRECATED_SCREENSHOTS = [
  "screenshot-portrait-1.png",
  "screenshot-portrait-2.png",
  "screenshot-portrait-3.png",
  "screenshot-landscape-1.png",
];

mkdirSync(OUT, { recursive: true });

for (const name of DEPRECATED_SCREENSHOTS) {
  const p = path.join(OUT, name);
  if (existsSync(p)) unlinkSync(p);
}

const manifest = [];

for (const asset of ASSETS) {
  const outPath = path.join(OUT, asset.name);
  const buf = await sharp(Buffer.from(asset.svg)).png().toBuffer();
  const resized = await sharp(buf)
    .resize(asset.w, asset.h, { fit: "fill" })
    .png({ compressionLevel: 9 })
    .toBuffer();
  writeFileSync(outPath, resized);
  manifest.push({
    file: asset.name,
    width: asset.w,
    height: asset.h,
    bytes: resized.length,
  });
  console.log(`✓ ${asset.name} (${asset.w}×${asset.h})`);
}

writeFileSync(
  path.join(OUT, "manifest.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      tagline: { main: THUMB_TAGLINE, sub: THUMB_SUB },
      assets: manifest,
      note: "스크린샷은 프로덕션 앱 실캡처 후 별도 업로드",
    },
    null,
    2,
  ),
);

const ICONS_DIR = path.join(__dirname, "..", "public", "icons");
mkdirSync(ICONS_DIR, { recursive: true });
const logoPath = path.join(OUT, "app-logo.png");
for (const size of [192, 512]) {
  const name = `icon-${size}.png`;
  await sharp(logoPath)
    .resize(size, size)
    .png()
    .toFile(path.join(ICONS_DIR, name));
  console.log(`✓ icons/${name}`);
}

console.log(`\nSaved to ${OUT}`);
