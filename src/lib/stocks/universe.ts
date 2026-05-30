import { readFileSync } from "fs";
import path from "path";
import { normalizeStockCode } from "./code";
import type { StockEntry, StockUniverseFile } from "./types";

let cache: StockEntry[] | null = null;

function dataPath(): string {
  return path.join(process.cwd(), "data", "krx-universe.json");
}

export function loadUniverse(): StockEntry[] {
  if (cache) return cache;
  try {
    const raw = readFileSync(dataPath(), "utf-8");
    const parsed = JSON.parse(raw) as StockUniverseFile;
    cache = parsed.items.map((item) => {
      const code = normalizeStockCode(item.code);
      return {
        ...item,
        code,
        yahooSymbol: toYahooSymbol(code, item.market),
      };
    });
    return cache;
  } catch {
    return [];
  }
}

export function toYahooSymbol(code: string, market: string): string {
  const normalized = normalizeStockCode(code);
  const suffix =
    market === "KOSDAQ" ? "KQ" : market === "KONEX" ? "KN" : "KS";
  return `${normalized}.${suffix}`;
}

export function findByCode(code: string): StockEntry | undefined {
  const normalized = normalizeStockCode(code);
  return loadUniverse().find((s) => s.code === normalized);
}
