export type MarketCategory = "KOSPI" | "KOSDAQ" | "KONEX" | "OTHER";

export interface StockEntry {
  /** 6자리 단축코드 */
  code: string;
  name: string;
  market: MarketCategory;
  /** Yahoo Finance 심볼 */
  yahooSymbol: string;
  chosung: string;
}

export interface StockUniverseFile {
  updatedAt: string;
  source: "data.go.kr" | "kind.krx" | "merged";
  count: number;
  items: StockEntry[];
}
