import type { OhlcvBar } from "@/lib/evaluation/types";

export function closes(bars: OhlcvBar[]): number[] {
  return bars.map((b) => b.close);
}

export function sma(values: number[], period: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      out.push(NaN);
      continue;
    }
    const slice = values.slice(i - period + 1, i + 1);
    out.push(slice.reduce((a, b) => a + b, 0) / period);
  }
  return out;
}

export function ema(values: number[], period: number): number[] {
  const out: number[] = [];
  const k = 2 / (period + 1);
  for (let i = 0; i < values.length; i++) {
    if (i === 0) {
      out.push(values[0]);
      continue;
    }
    const prev = out[i - 1];
    out.push(values[i] * k + prev * (1 - k));
  }
  return out;
}

export function rsi(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null;
  let gains = 0;
  let losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export function mfi(bars: OhlcvBar[], period = 14): number | null {
  if (bars.length < period + 1) return null;
  const slice = bars.slice(-(period + 1));
  let posFlow = 0;
  let negFlow = 0;
  for (let i = 1; i < slice.length; i++) {
    const tp =
      (slice[i].high + slice[i].low + slice[i].close) / 3;
    const prevTp =
      (slice[i - 1].high + slice[i - 1].low + slice[i - 1].close) / 3;
    const raw = tp * slice[i].volume;
    if (tp > prevTp) posFlow += raw;
    else if (tp < prevTp) negFlow += raw;
  }
  if (negFlow === 0) return 100;
  const ratio = posFlow / negFlow;
  return 100 - 100 / (1 + ratio);
}

export function stochasticK(
  bars: OhlcvBar[],
  kPeriod = 14,
): number | null {
  if (bars.length < kPeriod) return null;
  const slice = bars.slice(-kPeriod);
  const low = Math.min(...slice.map((b) => b.low));
  const high = Math.max(...slice.map((b) => b.high));
  const close = slice[slice.length - 1].close;
  if (high === low) return 50;
  return ((close - low) / (high - low)) * 100;
}

export function macd(
  closes: number[],
  fast = 12,
  slow = 26,
  signalPeriod = 9,
): { macd: number; signal: number; histogram: number } | null {
  if (closes.length < slow + signalPeriod) return null;
  const fastEma = ema(closes, fast);
  const slowEma = ema(closes, slow);
  const macdLine = fastEma.map((f, i) => f - slowEma[i]);
  const signalLine = ema(macdLine, signalPeriod);
  const i = closes.length - 1;
  const macdVal = macdLine[i];
  const signalVal = signalLine[i];
  if (!Number.isFinite(macdVal) || !Number.isFinite(signalVal)) return null;
  return {
    macd: macdVal,
    signal: signalVal,
    histogram: macdVal - signalVal,
  };
}

export function bollinger(
  closes: number[],
  period = 20,
  stdDevMult = 2,
): {
  upper: number;
  middle: number;
  lower: number;
  percentB: number;
} | null {
  if (closes.length < period) return null;
  const slice = closes.slice(-period);
  const middle = slice.reduce((a, b) => a + b, 0) / period;
  const variance =
    slice.reduce((a, b) => a + (b - middle) ** 2, 0) / period;
  const sd = Math.sqrt(variance);
  const upper = middle + stdDevMult * sd;
  const lower = middle - stdDevMult * sd;
  const close = closes[closes.length - 1];
  const percentB =
    upper === lower ? 0.5 : (close - lower) / (upper - lower);
  return { upper, middle, lower, percentB };
}
