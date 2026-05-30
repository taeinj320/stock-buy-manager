const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") ||
  "https://stock-buy-manager.vercel.app";

export interface StockItem {
  code: string;
  name: string;
  market: string;
  yahooSymbol: string;
}

export interface AnalyzeResult {
  indicatorId: string;
  name: string;
  label: string;
  valueDisplay: string;
  summary: string;
}

const DEFAULT_INDICATORS = [
  "rsi",
  "mfi",
  "stochastic",
  "macd",
  "bollinger",
  "ichimoku",
] as const;

export async function searchStocks(q: string): Promise<StockItem[]> {
  const res = await fetch(
    `${API_BASE}/api/stocks/search?q=${encodeURIComponent(q)}`,
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "검색 실패");
  return data.items ?? [];
}

export async function analyzeStock(stock: StockItem): Promise<AnalyzeResult[]> {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: stock.code,
      yahooSymbol: stock.yahooSymbol,
      indicators: DEFAULT_INDICATORS.map((id) => ({ id })),
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "분석 실패");
  return data.results ?? [];
}

export { API_BASE };
