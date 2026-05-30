import { readFileSync } from "fs";
import path from "path";

interface DartCorpMapFile {
  items: { corpCode: string; corpName: string; stockCode: string }[];
}

let cache: Map<string, string> | null = null;

function loadMap(): Map<string, string> {
  if (cache) return cache;
  const filePath = path.join(process.cwd(), "data", "dart-corp-map.json");
  try {
    const raw = readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as DartCorpMapFile;
    cache = new Map(
      data.items.map((row) => [row.stockCode.padStart(6, "0"), row.corpCode]),
    );
    return cache;
  } catch {
    cache = new Map();
    return cache;
  }
}

export function getCorpCodeByStockCode(stockCode: string): string | null {
  const digits = stockCode.replace(/\D/g, "").slice(-6).padStart(6, "0");
  return loadMap().get(digits) ?? null;
}
