import YahooFinance from "yahoo-finance2";
import type { OhlcvBar } from "@/lib/evaluation/types";
import type { ChartInterval } from "./ohlcv-utils";
import { trimToCompletedBars } from "./ohlcv-utils";

const yahooFinance = new YahooFinance({
  suppressNotices: ["ripHistorical"],
});

const LOOKBACK_YEARS: Record<ChartInterval, number> = {
  "1d": 2,
  "1wk": 5,
  "1mo": 12,
};

const MAX_BARS: Record<ChartInterval, number> = {
  "1d": 120,
  "1wk": 104,
  "1mo": 60,
};

export async function fetchOhlcv(
  symbol: string,
  interval: ChartInterval,
  minBars = 30,
): Promise<OhlcvBar[]> {
  const end = new Date();
  const start = new Date();
  start.setFullYear(start.getFullYear() - LOOKBACK_YEARS[interval]);

  const chart = await yahooFinance.chart(symbol, {
    period1: start,
    period2: end,
    interval,
  });

  const quotes = chart.quotes ?? [];
  let bars: OhlcvBar[] = quotes
    .filter(
      (q) =>
        q.close != null &&
        q.open != null &&
        q.high != null &&
        q.low != null &&
        q.volume != null,
    )
    .map((q) => ({
      date: q.date,
      open: q.open!,
      high: q.high!,
      low: q.low!,
      close: q.close!,
      volume: q.volume!,
    }));

  bars = trimToCompletedBars(bars, interval);
  const limit = Math.max(minBars, MAX_BARS[interval]);
  if (bars.length > limit) {
    bars = bars.slice(-limit);
  }
  return bars;
}

/** 지표 분석용 일봉 (전일까지 완성 봉) */
export async function fetchDailyOhlcv(
  symbol: string,
  minBars = 120,
): Promise<OhlcvBar[]> {
  return fetchOhlcv(symbol, "1d", minBars);
}

export async function fetchAllChartIntervals(symbol: string) {
  const [daily, weekly, monthly] = await Promise.all([
    fetchOhlcv(symbol, "1d", 60),
    fetchOhlcv(symbol, "1wk", 52),
    fetchOhlcv(symbol, "1mo", 36),
  ]);
  return { daily, weekly, monthly };
}
