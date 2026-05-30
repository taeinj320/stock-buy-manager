const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") ||
  "https://stock-buy-manager.vercel.app";

export interface StockItem {
  code: string;
  name: string;
  market: string;
  yahooSymbol: string;
}

export interface EvaluationResult {
  indicatorId: string;
  name: string;
  label: string;
  valueDisplay: string;
  summary: string;
  tier?: string;
}

export interface ChartCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TimeframeChartData {
  candles: ChartCandle[];
  overlays: Record<string, unknown>;
}

export interface ChartPayload {
  daily: TimeframeChartData;
  weekly: TimeframeChartData;
  monthly: TimeframeChartData;
}

export interface StockInsights {
  news: {
    source: string;
    title: string;
    link: string;
    pubDate: string;
  }[];
  disclosures: {
    title: string;
    reportNm: string;
    rceptDt: string;
    link: string;
  }[];
  research: {
    available: boolean;
    consensusLabel: string | null;
    targetPrice: number | null;
    recentReports: { title: string; broker: string; date: string; link: string }[];
    note?: string;
  };
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

export async function analyzeStock(stock: StockItem): Promise<EvaluationResult[]> {
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

export async function fetchChartData(stock: StockItem): Promise<ChartPayload> {
  const res = await fetch(`${API_BASE}/api/chart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: stock.code,
      yahooSymbol: stock.yahooSymbol,
      indicators: DEFAULT_INDICATORS.map((id) => ({ id })),
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "차트 실패");
  return {
    daily: data.daily,
    weekly: data.weekly,
    monthly: data.monthly,
  };
}

export async function fetchInsights(
  stock: StockItem,
): Promise<StockInsights> {
  const res = await fetch(`${API_BASE}/api/insights`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: stock.code, name: stock.name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "뉴스·공시 조회 실패");
  return data;
}

export { API_BASE };
