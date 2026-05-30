import type { OhlcvBar } from "@/lib/evaluation/types";

export type ChartInterval = "1d" | "1wk" | "1mo";

export interface ChartCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface LinePoint {
  time: string;
  value: number;
}

export interface ChartOverlays {
  bollinger?: {
    upper: LinePoint[];
    middle: LinePoint[];
    lower: LinePoint[];
  };
  rsi?: LinePoint[];
  mfi?: LinePoint[];
  stochastic?: LinePoint[];
  macd?: {
    macd: LinePoint[];
    signal: LinePoint[];
    histogram: LinePoint[];
  };
}

function toKstParts(d: Date) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [y, m, day] = fmt.format(d).split("-").map(Number);
  return { y, m, day };
}

function weekKey(y: number, m: number, day: number) {
  const d = new Date(Date.UTC(y, m - 1, day));
  const jan1 = new Date(Date.UTC(y, 0, 1));
  const week = Math.ceil(
    ((d.getTime() - jan1.getTime()) / 86400000 + jan1.getUTCDay() + 1) / 7,
  );
  return `${y}-W${week}`;
}

export function isIncompleteLatestBar(
  barDate: Date,
  interval: ChartInterval,
): boolean {
  const now = toKstParts(new Date());
  const bar = toKstParts(barDate);

  if (interval === "1d") {
    return bar.y === now.y && bar.m === now.m && bar.day === now.day;
  }
  if (interval === "1wk") {
    return weekKey(bar.y, bar.m, bar.day) === weekKey(now.y, now.m, now.day);
  }
  return bar.y === now.y && bar.m === now.m;
}

export function trimToCompletedBars(
  bars: OhlcvBar[],
  interval: ChartInterval,
): OhlcvBar[] {
  if (bars.length === 0) return bars;
  const last = bars[bars.length - 1];
  if (isIncompleteLatestBar(last.date, interval)) {
    return bars.slice(0, -1);
  }
  return bars;
}

export function toChartCandles(bars: OhlcvBar[]): ChartCandle[] {
  return bars.map((b) => ({
    time: formatChartTime(b.date),
    open: b.open,
    high: b.high,
    low: b.low,
    close: b.close,
    volume: b.volume,
  }));
}

function formatChartTime(d: Date): string {
  const p = toKstParts(d);
  return `${p.y}-${String(p.m).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}
