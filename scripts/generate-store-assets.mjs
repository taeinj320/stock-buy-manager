#!/usr/bin/env node
/**
 * 스토어 제출용 이미지 생성 (정확한 픽셀 규격)
 * 실행: node scripts/generate-store-assets.mjs
 */
import { mkdirSync, writeFileSync } from "fs";
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

function escXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function chartIcon(x, y, size, stroke = "#fff") {
  const s = size;
  return `
    <g transform="translate(${x},${y})">
      <path d="M4 ${s * 0.75} L${s * 0.28} ${s * 0.42} L${s * 0.5} ${s * 0.55} L${s * 0.88} ${s * 0.22}"
        fill="none" stroke="${stroke}" stroke-width="${s * 0.08}" stroke-linecap="round" stroke-linejoin="round"/>
    </g>`;
}

function logoSvg(dark = false) {
  const bg = dark ? "#0f172a" : "#ffffff";
  const sub = dark ? "#94a3b8" : "#64748b";
  const title = dark ? "#f8fafc" : "#0f172a";
  const iconStroke = "#fff";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <defs>${GRAD}</defs>
    <rect width="600" height="600" fill="${bg}" rx="120"/>
    <rect x="150" y="150" width="300" height="300" rx="72" fill="url(#brand)"/>
    ${chartIcon(300, 300, 140, iconStroke)}
    <text x="300" y="500" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="42" font-weight="700" fill="${title}">ChartCheck</text>
    <text x="300" y="542" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" fill="${sub}">지표별 독립 분석</text>
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
    <ellipse cx="1700" cy="120" rx="280" ry="200" fill="#38bdf8" opacity="0.2"/>
    <ellipse cx="200" cy="700" rx="320" ry="220" fill="#818cf8" opacity="0.18"/>
    <rect x="120" y="140" width="88" height="88" rx="24" fill="url(#brand)"/>
    ${chartIcon(164, 184, 48)}
    <text x="230" y="195" font-family="system-ui,sans-serif" font-size="56" font-weight="700" fill="#0f172a">ChartCheck</text>
    <text x="230" y="250" font-family="system-ui,sans-serif" font-size="28" fill="#475569">RSI · MACD · 일목 · 뉴스·공시 한 화면</text>
    <text x="230" y="300" font-family="system-ui,sans-serif" font-size="22" fill="#64748b">매매 권유 없음 · 투자 판단은 사용자 책임</text>
  </svg>`;
}

function phoneMock({ title, subtitle, body }) {
  return `
    <rect x="48" y="120" width="540" height="880" rx="48" fill="#fff" stroke="rgba(148,163,184,0.35)" stroke-width="2"/>
    <rect x="48" y="120" width="540" height="880" rx="48" fill="url(#bg)" opacity="0.5"/>
    <text x="318" y="200" text-anchor="middle" font-family="system-ui,sans-serif" font-size="32" font-weight="700" fill="#0f172a">${title}</text>
    <text x="318" y="248" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" fill="#64748b">${subtitle}</text>
    ${body}
  `;
}

function screenshotPortrait(variant) {
  const bodies = {
    1: `
      <rect x="88" y="280" width="460" height="120" rx="20" fill="rgba(255,255,255,0.85)" stroke="rgba(255,255,255,0.9)"/>
      <text x="120" y="330" font-family="system-ui,sans-serif" font-size="20" fill="#475569">종목 검색</text>
      <text x="120" y="370" font-family="system-ui,sans-serif" font-size="28" font-weight="600" fill="#0f172a">삼성전자 · 005930</text>
      <rect x="88" y="420" width="460" height="320" rx="20" fill="rgba(255,255,255,0.85)" stroke="rgba(255,255,255,0.9)"/>
      <text x="120" y="460" font-family="system-ui,sans-serif" font-size="20" font-weight="600" fill="#334155">분석 지표 6종</text>
      <rect x="120" y="490" width="400" height="44" rx="12" fill="#f0f9ff" stroke="#bae6fd"/>
      <rect x="120" y="548" width="400" height="44" rx="12" fill="#f0f9ff" stroke="#bae6fd"/>
      <rect x="120" y="606" width="400" height="44" rx="12" fill="#f0f9ff" stroke="#bae6fd"/>
      <rect x="88" y="760" width="460" height="72" rx="16" fill="url(#brand)"/>
      <text x="318" y="808" text-anchor="middle" font-family="system-ui,sans-serif" font-size="24" font-weight="600" fill="#fff">분석 실행</text>
    `,
    2: `
      <rect x="88" y="280" width="460" height="200" rx="20" fill="rgba(255,255,255,0.9)"/>
      <text x="120" y="320" font-family="system-ui,sans-serif" font-size="22" font-weight="600" fill="#0f172a">분석 결과</text>
      <text x="120" y="360" font-family="system-ui,sans-serif" font-size="18" fill="#334155">RSI · 적정 · 65.9</text>
      <text x="120" y="395" font-family="system-ui,sans-serif" font-size="18" fill="#334155">MACD · 적정 · 상승 모멘텀</text>
      <text x="120" y="430" font-family="system-ui,sans-serif" font-size="18" fill="#334155">일목 · 구름대 위</text>
      <rect x="88" y="500" width="460" height="180" rx="20" fill="#fffbeb" stroke="#fde68a"/>
      <text x="120" y="540" font-family="system-ui,sans-serif" font-size="20" font-weight="600" fill="#92400e">종합의견</text>
      <text x="120" y="580" font-family="system-ui,sans-serif" font-size="16" fill="#78350f">기술 신호 참고 · 매매 권유 아님</text>
      <rect x="88" y="700" width="460" height="200" rx="20" fill="rgba(255,255,255,0.9)"/>
      <text x="120" y="740" font-family="system-ui,sans-serif" font-size="18" font-weight="600" fill="#334155">뉴스 · 공시 · 리서치</text>
      <text x="120" y="780" font-family="system-ui,sans-serif" font-size="15" fill="#64748b">한경·매경 · DART · 네이버</text>
    `,
    3: `
      <rect x="88" y="280" width="460" height="380" rx="20" fill="rgba(255,255,255,0.92)"/>
      <text x="120" y="320" font-family="system-ui,sans-serif" font-size="20" font-weight="600" fill="#334155">가격 차트 · 일봉</text>
      <path d="M120 600 L200 520 L280 560 L360 480 L440 500 L520 420" fill="none" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>
      <path d="M120 620 L200 580 L280 600 L360 540 L440 560 L520 500" fill="none" stroke="#7c3aed" stroke-width="2" stroke-dasharray="8 6"/>
      <rect x="120" y="640" width="180" height="8" rx="4" fill="#86efac" opacity="0.7"/>
      <rect x="300" y="650" width="120" height="8" rx="4" fill="#fca5a5" opacity="0.7"/>
      <text x="120" y="680" font-family="system-ui,sans-serif" font-size="14" fill="#64748b">${escXml("구름 초록 상승 · 후행 보라 점선")}</text>
      <rect x="88" y="680" width="460" height="120" rx="20" fill="rgba(255,255,255,0.9)"/>
      <text x="120" y="720" font-family="system-ui,sans-serif" font-size="16" fill="#475569">일목 · RSI · MACD 오버레이 선택</text>
      <text x="120" y="755" font-family="system-ui,sans-serif" font-size="14" fill="#94a3b8">전일 완성 봉 기준</text>
    `,
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" width="636" height="1048" viewBox="0 0 636 1048">
    <defs>${GRAD}</defs>
    <rect width="636" height="1048" fill="url(#bg)"/>
    ${phoneMock({
      title: "ChartCheck",
      subtitle:
        variant === 1
          ? "종목 선택"
          : variant === 2
            ? "지표 분석"
            : "차트 · 오버레이",
      body: bodies[variant],
    })}
  </svg>`;
}

function screenshotLandscapeSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1504" height="741" viewBox="0 0 1504 741">
    <defs>${GRAD}</defs>
    <rect width="1504" height="741" fill="url(#bg)"/>
    <rect x="80" y="80" width="64" height="64" rx="16" fill="url(#brand)"/>
    ${chartIcon(112, 112, 32)}
    <text x="164" y="125" font-family="system-ui,sans-serif" font-size="36" font-weight="700" fill="#0f172a">ChartCheck</text>
    <text x="164" y="165" font-family="system-ui,sans-serif" font-size="20" fill="#64748b">지표별 독립 분석 · 매매 권유 없음</text>
    <rect x="80" y="220" width="420" height="460" rx="24" fill="rgba(255,255,255,0.88)" stroke="rgba(255,255,255,0.95)"/>
    <text x="110" y="270" font-family="system-ui,sans-serif" font-size="22" font-weight="600" fill="#334155">6종 지표 + 종합의견</text>
    <text x="110" y="310" font-family="system-ui,sans-serif" font-size="17" fill="#475569">RSI · MFI · 스토캐스틱</text>
    <text x="110" y="345" font-family="system-ui,sans-serif" font-size="17" fill="#475569">MACD · 볼린저 · 일목</text>
    <rect x="110" y="380" width="360" height="100" rx="16" fill="#fffbeb" stroke="#fde68a"/>
    <text x="130" y="430" font-family="system-ui,sans-serif" font-size="18" fill="#92400e">뉴스 · DART 공시 · 리서치</text>
    <rect x="540" y="220" width="880" height="460" rx="24" fill="rgba(255,255,255,0.92)"/>
    <text x="570" y="270" font-family="system-ui,sans-serif" font-size="22" font-weight="600" fill="#334155">멀티 타임프레임 차트</text>
    <path d="M570 580 L700 480 L820 520 L940 420 L1060 460 L1180 380 L1320 400" fill="none" stroke="#ef4444" stroke-width="5" stroke-linecap="round"/>
    <path d="M570 620 L700 560 L820 590 L940 520 L1060 550 L1180 480 L1320 500" fill="none" stroke="#2563eb" stroke-width="3"/>
    <rect x="570" y="640" width="200" height="12" rx="6" fill="#86efac" opacity="0.6"/>
    <rect x="800" y="640" width="200" height="12" rx="6" fill="#fca5a5" opacity="0.6"/>
    <text x="570" y="680" font-family="system-ui,sans-serif" font-size="16" fill="#64748b">일봉 · 주봉 · 월봉 · 구름 채색 · 후행스팬</text>
  </svg>`;
}

const ASSETS = [
  { name: "app-logo.png", w: 600, h: 600, svg: logoSvg(false) },
  { name: "app-logo-dark.png", w: 600, h: 600, svg: logoSvg(true) },
  { name: "thumbnail.png", w: 1932, h: 828, svg: thumbnailSvg() },
  {
    name: "screenshot-portrait-1.png",
    w: 636,
    h: 1048,
    svg: screenshotPortrait(1),
  },
  {
    name: "screenshot-portrait-2.png",
    w: 636,
    h: 1048,
    svg: screenshotPortrait(2),
  },
  {
    name: "screenshot-portrait-3.png",
    w: 636,
    h: 1048,
    svg: screenshotPortrait(3),
  },
  {
    name: "screenshot-landscape-1.png",
    w: 1504,
    h: 741,
    svg: screenshotLandscapeSvg(),
  },
];

mkdirSync(OUT, { recursive: true });

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
  JSON.stringify({ generatedAt: new Date().toISOString(), assets: manifest }, null, 2),
);

console.log(`\nSaved to ${OUT}`);
