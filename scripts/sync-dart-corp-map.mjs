#!/usr/bin/env node
/** DART corp_code ↔ 종목코드 매핑 (corpCode.xml) */
import { execFileSync } from "child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outPath = path.join(root, "data", "dart-corp-map.json");
const KEY = process.env.DART_API_KEY;

function normalizeStockCode(raw) {
  const digits = String(raw).replace(/\D/g, "");
  if (!digits) return "";
  return digits.slice(-6).padStart(6, "0");
}

async function main() {
  if (!KEY) {
    console.error("[dart] DART_API_KEY 없음 — .env.local 확인");
    process.exit(1);
  }

  const url = `https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key=${KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error("[dart] corpCode 다운로드 실패", res.status);
    process.exit(1);
  }

  const zipBuf = Buffer.from(await res.arrayBuffer());
  const tmp = mkdtempSync(path.join(tmpdir(), "dart-corp-"));
  const zipPath = path.join(tmp, "corp.zip");
  writeFileSync(zipPath, zipBuf);
  execFileSync("unzip", ["-o", "-q", zipPath, "-d", tmp], { stdio: "pipe" });
  const xmlFile = readdirSync(tmp).find((n) => n.endsWith(".xml"));
  if (!xmlFile) {
    console.error("[dart] ZIP 내 XML 없음");
    process.exit(1);
  }
  const xml = readFileSync(path.join(tmp, xmlFile), "utf-8");
  rmSync(tmp, { recursive: true, force: true });
  const items = [];
  const blocks = xml.match(/<list>[\s\S]*?<\/list>/g) ?? [];
  for (const block of blocks) {
    const corpCode = block.match(/<corp_code>([^<]+)<\/corp_code>/)?.[1]?.trim();
    const corpName = block.match(/<corp_name>([^<]+)<\/corp_name>/)?.[1]?.trim();
    const stockRaw = block.match(/<stock_code>([^<]*)<\/stock_code>/)?.[1];
    if (!corpCode || !corpName || stockRaw == null) continue;
    const code = normalizeStockCode(stockRaw);
    if (!code || code === "000000") continue;
    items.push({ corpCode, corpName, stockCode: code });
  }

  mkdirSync(path.join(root, "data"), { recursive: true });
  writeFileSync(
    outPath,
    JSON.stringify(
      { updatedAt: new Date().toISOString(), count: items.length, items },
      null,
      2,
    ),
  );
  console.log(`[dart] 매핑 ${items.length}건 → ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
