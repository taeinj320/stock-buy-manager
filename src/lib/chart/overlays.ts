import type { OhlcvBar } from "@/lib/evaluation/types";
import type { ChartOverlays, LinePoint } from "@/lib/market-data/ohlcv-utils";
import { computeIchimoku } from "@/lib/indicators/ichimoku";
import { bollinger, ema, sma } from "@/lib/indicators/math";
import type { IndicatorId, IndicatorParams } from "@/lib/evaluation/types";

function formatTime(d: Date): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(d);
}

function lineFromSeries(
  bars: OhlcvBar[],
  values: (number | null)[],
): LinePoint[] {
  const out: LinePoint[] = [];
  for (let i = 0; i < bars.length; i++) {
    const v = values[i];
    if (v == null || Number.isNaN(v)) continue;
    out.push({ time: formatTime(bars[i].date), value: v });
  }
  return out;
}

/** 선행스팬: 계산 시점 값을 displacement만큼 미래 봉에 표시 */
function lineFromSeriesDisplaced(
  bars: OhlcvBar[],
  values: (number | null)[],
  displacement: number,
): LinePoint[] {
  const out: LinePoint[] = [];
  for (let i = 0; i < bars.length; i++) {
    const future = i + displacement;
    const v = values[i];
    if (v == null || Number.isNaN(v) || future >= bars.length) continue;
    out.push({ time: formatTime(bars[future].date), value: v });
  }
  return out;
}

function rsiSeries(closes: number[], period: number): (number | null)[] {
  const out: (number | null)[] = new Array(closes.length).fill(null);
  if (closes.length < period + 1) return out;

  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) avgGain += diff;
    else avgLoss -= diff;
  }
  avgGain /= period;
  avgLoss /= period;

  const rs0 = avgLoss === 0 ? 100 : avgGain / avgLoss;
  out[period] = 100 - 100 / (1 + rs0);

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    out[i] = 100 - 100 / (1 + rs);
  }
  return out;
}

function mfiSeries(bars: OhlcvBar[], period: number): (number | null)[] {
  const out: (number | null)[] = new Array(bars.length).fill(null);
  for (let i = period; i < bars.length; i++) {
    const slice = bars.slice(i - period, i + 1);
    let pos = 0;
    let neg = 0;
    for (let j = 1; j < slice.length; j++) {
      const tp =
        (slice[j].high + slice[j].low + slice[j].close) / 3;
      const prev =
        (slice[j - 1].high + slice[j - 1].low + slice[j - 1].close) / 3;
      const raw = tp * slice[j].volume;
      if (tp > prev) pos += raw;
      else if (tp < prev) neg += raw;
    }
    if (neg === 0) out[i] = 100;
    else {
      const ratio = pos / neg;
      out[i] = 100 - 100 / (1 + ratio);
    }
  }
  return out;
}

function stochasticSeries(bars: OhlcvBar[], kPeriod: number): (number | null)[] {
  const out: (number | null)[] = new Array(bars.length).fill(null);
  for (let i = kPeriod - 1; i < bars.length; i++) {
    const slice = bars.slice(i - kPeriod + 1, i + 1);
    const low = Math.min(...slice.map((b) => b.low));
    const high = Math.max(...slice.map((b) => b.high));
    const close = slice[slice.length - 1].close;
    out[i] = high === low ? 50 : ((close - low) / (high - low)) * 100;
  }
  return out;
}

function macdSeries(
  closes: number[],
  fast: number,
  slow: number,
  signalPeriod: number,
) {
  const fastEma = ema(closes, fast);
  const slowEma = ema(closes, slow);
  const macdLine = fastEma.map((f, i) => f - slowEma[i]);
  const signalLine = ema(macdLine, signalPeriod);
  const histogram = macdLine.map((m, i) => m - signalLine[i]);
  return { macdLine, signalLine, histogram };
}

export function buildChartOverlays(
  bars: OhlcvBar[],
  indicatorIds: IndicatorId[],
  paramsMap: Partial<Record<IndicatorId, IndicatorParams>>,
): ChartOverlays {
  const closes = bars.map((b) => b.close);
  const overlays: ChartOverlays = {};

  if (indicatorIds.includes("bollinger")) {
    const period = paramsMap.bollinger?.period ?? 20;
    const stdDev = paramsMap.bollinger?.stdDev ?? 2;
    const upper: (number | null)[] = [];
    const middle: (number | null)[] = [];
    const lower: (number | null)[] = [];
    for (let i = 0; i < closes.length; i++) {
      const slice = closes.slice(0, i + 1);
      const bb = bollinger(slice, period, stdDev);
      if (!bb) {
        upper.push(null);
        middle.push(null);
        lower.push(null);
      } else {
        upper.push(bb.upper);
        middle.push(bb.middle);
        lower.push(bb.lower);
      }
    }
    overlays.bollinger = {
      upper: lineFromSeries(bars, upper),
      middle: lineFromSeries(bars, middle),
      lower: lineFromSeries(bars, lower),
    };
  }

  if (indicatorIds.includes("rsi")) {
    const period = paramsMap.rsi?.period ?? 14;
    overlays.rsi = lineFromSeries(bars, rsiSeries(closes, period));
  }

  if (indicatorIds.includes("mfi")) {
    const period = paramsMap.mfi?.period ?? 14;
    overlays.mfi = lineFromSeries(bars, mfiSeries(bars, period));
  }

  if (indicatorIds.includes("stochastic")) {
    const kPeriod = paramsMap.stochastic?.kPeriod ?? 14;
    overlays.stochastic = lineFromSeries(
      bars,
      stochasticSeries(bars, kPeriod),
    );
  }

  if (indicatorIds.includes("macd")) {
    const fast = paramsMap.macd?.fast ?? 12;
    const slow = paramsMap.macd?.slow ?? 26;
    const signal = paramsMap.macd?.signal ?? 9;
    const { macdLine, signalLine, histogram } = macdSeries(
      closes,
      fast,
      slow,
      signal,
    );
    overlays.macd = {
      macd: lineFromSeries(bars, macdLine),
      signal: lineFromSeries(bars, signalLine),
      histogram: lineFromSeries(bars, histogram),
    };
  }

  if (indicatorIds.includes("ichimoku")) {
    const displacement = paramsMap.ichimoku?.displacement ?? 26;
    const series = computeIchimoku(bars, {
      tenkanPeriod: paramsMap.ichimoku?.tenkanPeriod,
      kijunPeriod: paramsMap.ichimoku?.kijunPeriod,
      senkouBPeriod: paramsMap.ichimoku?.senkouBPeriod,
      displacement,
    });
    overlays.ichimoku = {
      tenkan: lineFromSeries(bars, series.tenkan),
      kijun: lineFromSeries(bars, series.kijun),
      spanA: lineFromSeriesDisplaced(bars, series.spanA, displacement),
      spanB: lineFromSeriesDisplaced(bars, series.spanB, displacement),
    };
  }

  return overlays;
}

/** 20일 이동평균 (차트 참고용) */
export function ma20Line(bars: OhlcvBar[]): LinePoint[] {
  const closes = bars.map((b) => b.close);
  return lineFromSeries(bars, sma(closes, 20));
}
