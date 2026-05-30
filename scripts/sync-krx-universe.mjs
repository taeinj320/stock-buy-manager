#!/usr/bin/env node
/**
 * KRX 상장 종목 마스터 동기화
 * 1) 공공데이터포털 API (DATA_GO_KR_SERVICE_KEY)
 * 2) 실패 시 KIND HTML 목록
 */
import { writeFileSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import iconv from "iconv-lite";
const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ".split("");

function extractChosung(text) {
  let result = "";
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      result += CHO[Math.floor((code - 0xac00) / 588)] ?? "";
    }
  }
  return result;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outPath = path.join(root, "data", "krx-universe.json");

const SERVICE_KEY = process.env.DATA_GO_KR_SERVICE_KEY;

function normalizeStockCode(raw) {
  const digits = String(raw).replace(/\D/g, "");
  if (!digits) return "";
  return digits.slice(-6).padStart(6, "0");
}

function toYahooSymbol(code, market) {
  const normalized = normalizeStockCode(code);
  const suffix =
    market === "KOSDAQ" ? "KQ" : market === "KONEX" ? "KN" : "KS";
  return `${normalized}.${suffix}`;
}

function normalizeMarket(raw) {
  const t = String(raw).replace(/\s/g, "");
  if (t.includes("코스닥")) return "KOSDAQ";
  if (t.includes("코넥스")) return "KONEX";
  if (t.includes("유가") || t.includes("KOSPI")) return "KOSPI";
  return "OTHER";
}

async function fetchFromDataGoKr() {
  if (!SERVICE_KEY) {
    console.warn("[sync] DATA_GO_KR_SERVICE_KEY 없음");
    return null;
  }

  const basDtCandidates = buildBasDtCandidates();
  const items = [];

  for (const basDt of basDtCandidates) {
    console.log(`[sync] data.go.kr 시도 basDt=${basDt}`);
    const pageItems = await fetchDataGoKrPage(SERVICE_KEY, basDt);
    if (pageItems?.length) {
      items.push(...pageItems);
      break;
    }
  }

  if (items.length === 0) return null;
  return { items: dedupeByCode(items), source: "data.go.kr" };
}

async function fetchDataGoKrPage(serviceKey, basDt) {
  const items = [];
  let pageNo = 1;
  let totalCount = Infinity;

  while (items.length < totalCount) {
    const url = new URL(
      "https://apis.data.go.kr/1160100/service/GetKrxListedInfoService/getItemInfo",
    );
    url.searchParams.set("serviceKey", serviceKey);
    url.searchParams.set("numOfRows", "1000");
    url.searchParams.set("pageNo", String(pageNo));
    url.searchParams.set("resultType", "json");
    url.searchParams.set("basDt", basDt);

    const res = await fetch(url.toString());
    const text = await res.text();
    if (
      !res.ok ||
      text.startsWith("Unauthorized") ||
      text.includes("SERVICE_KEY_IS_NOT_REGISTERED")
    ) {
      console.warn("[sync] data.go.kr 실패:", res.status, text.slice(0, 160));
      return null;
    }

    let json;
    try {
      json = JSON.parse(text);
    } catch {
      console.warn("[sync] JSON 파싱 실패");
      return null;
    }

    const body = json.response?.body;
    if (!body) return null;

    totalCount = Number(body.totalCount ?? 0);
    const rawItems = body.items?.item;
    const list = Array.isArray(rawItems)
      ? rawItems
      : rawItems
        ? [rawItems]
        : [];

    for (const row of list) {
      const code = normalizeStockCode(row.srtnCd ?? "");
      const name = String(row.itmsNm ?? "").trim();
      const market = normalizeMarket(row.mrktCtg ?? "");
      if (!code || !name || code === "000000") continue;
      items.push({
        code,
        name,
        market,
        yahooSymbol: toYahooSymbol(code, market),
        chosung: extractChosung(name),
      });
    }

    if (list.length === 0) break;
    pageNo++;
    if (pageNo > 50) break;
  }

  return items.length > 0 ? items : null;
}

function buildBasDtCandidates() {
  const out = [];
  const d = new Date();
  for (let i = 0; i < 14 && out.length < 7; i++) {
    const c = new Date(d);
    c.setDate(d.getDate() - i);
    const dow = c.getDay();
    if (dow === 0 || dow === 6) continue;
    out.push(formatDate(c));
  }
  return out.length ? out : [formatDate(d)];
}

async function fetchFromKind() {
  console.log("[sync] KIND 목록 다운로드...");
  const res = await fetch(
    "https://kind.krx.co.kr/corpgeneral/corpList.do?method=download&searchType=13",
  );
  const buf = Buffer.from(await res.arrayBuffer());
  const html = iconv.decode(buf, "euc-kr");
  const items = [];
  const rowRe =
    /<tr>\s*<td>([^<]+)<\/td>\s*<td>[\s\S]*?<\/td>\s*<td[^>]*>(\d{6})<\/td>/g;
  let m;
  while ((m = rowRe.exec(html)) !== null) {
    const name = m[1].trim();
    const code = normalizeStockCode(m[2]);
    const block = m[0];
    let market = "KOSPI";
    if (block.includes("코스닥")) market = "KOSDAQ";
    else if (block.includes("코넥스")) market = "KONEX";

    items.push({
      code,
      name,
      market,
      yahooSymbol: toYahooSymbol(code, market),
      chosung: extractChosung(name),
    });
  }

  const unique = dedupeByCode(items);
  return { items: unique, source: "kind.krx" };
}

function dedupeByCode(items) {
  const map = new Map();
  for (const item of items) {
    if (!map.has(item.code)) map.set(item.code, item);
  }
  return [...map.values()];
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

async function main() {
  mkdirSync(path.join(root, "data"), { recursive: true });

  let result = await fetchFromDataGoKr();
  if (!result) {
    result = await fetchFromKind();
  }

  if (!result?.items?.length) {
    console.error("[sync] 종목 목록을 가져오지 못했습니다.");
    process.exit(1);
  }

  const payload = {
    updatedAt: new Date().toISOString(),
    source: result.source,
    count: result.items.length,
    items: result.items,
  };

  writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf-8");
  console.log(
    `[sync] 저장 완료: ${payload.count}종목 (${payload.source}) → ${outPath}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
