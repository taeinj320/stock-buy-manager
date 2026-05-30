import {
  extractChosung,
  isChosungQuery,
  matchesChosungSubsequence,
} from "./chosung";
import type { StockEntry } from "./types";
import { loadUniverse } from "./universe";

function scoreMatch(entry: StockEntry, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const name = entry.name.toLowerCase();
  const code = entry.code;

  if (name === q || code === q) return 100;
  if (name.startsWith(q) || code.startsWith(q)) return 80;
  if (name.includes(q)) return 60;
  if (code.includes(q)) return 50;

  if (isChosungQuery(q)) {
    if (matchesChosungSubsequence(entry.chosung, q)) {
      const density = q.length / Math.max(entry.chosung.length, 1);
      return 65 + density * 35;
    }
  } else {
    const qChosung = extractChosung(q);
    if (qChosung && matchesChosungSubsequence(entry.chosung, qChosung)) {
      return 55;
    }
  }

  return 0;
}

export function searchStocks(query: string, limit = 20): StockEntry[] {
  const q = query.trim();
  if (!q) return [];

  const items = loadUniverse();
  if (items.length === 0) return [];

  return items
    .map((entry) => ({ entry, score: scoreMatch(entry, q) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.entry);
}
