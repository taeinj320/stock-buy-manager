import type { OhlcvBar } from "@/lib/evaluation/types";

export interface IchimokuParams {
  tenkanPeriod: number;
  kijunPeriod: number;
  senkouBPeriod: number;
  displacement: number;
}

export const DEFAULT_ICHIMOKU: IchimokuParams = {
  tenkanPeriod: 9,
  kijunPeriod: 26,
  senkouBPeriod: 52,
  displacement: 26,
};

export interface IchimokuSeries {
  tenkan: (number | null)[];
  kijun: (number | null)[];
  spanA: (number | null)[];
  spanB: (number | null)[];
}

function midPrice(bars: OhlcvBar[], end: number, period: number): number | null {
  if (end < period - 1) return null;
  let high = -Infinity;
  let low = Infinity;
  for (let i = end - period + 1; i <= end; i++) {
    high = Math.max(high, bars[i].high);
    low = Math.min(low, bars[i].low);
  }
  return (high + low) / 2;
}

function resolveParams(params: Partial<IchimokuParams>): IchimokuParams {
  return {
    tenkanPeriod: params.tenkanPeriod ?? DEFAULT_ICHIMOKU.tenkanPeriod,
    kijunPeriod: params.kijunPeriod ?? DEFAULT_ICHIMOKU.kijunPeriod,
    senkouBPeriod: params.senkouBPeriod ?? DEFAULT_ICHIMOKU.senkouBPeriod,
    displacement: params.displacement ?? DEFAULT_ICHIMOKU.displacement,
  };
}

export function computeIchimoku(
  bars: OhlcvBar[],
  params: Partial<IchimokuParams> = {},
): IchimokuSeries {
  const p = resolveParams(params);
  const n = bars.length;
  const tenkan: (number | null)[] = new Array(n).fill(null);
  const kijun: (number | null)[] = new Array(n).fill(null);
  const spanA: (number | null)[] = new Array(n).fill(null);
  const spanB: (number | null)[] = new Array(n).fill(null);

  for (let i = 0; i < n; i++) {
    const t = midPrice(bars, i, p.tenkanPeriod);
    const k = midPrice(bars, i, p.kijunPeriod);
    const b = midPrice(bars, i, p.senkouBPeriod);
    tenkan[i] = t;
    kijun[i] = k;
    if (t !== null && k !== null) spanA[i] = (t + k) / 2;
    spanB[i] = b;
  }

  return { tenkan, kijun, spanA, spanB };
}

/** 현재 봉 기준 구름대·전환·기준선 스냅샷 */
export function ichimokuAtBar(
  bars: OhlcvBar[],
  index: number,
  params: Partial<IchimokuParams> = {},
): {
  close: number;
  tenkan: number;
  kijun: number;
  cloudTop: number;
  cloudBottom: number;
  spanA: number;
  spanB: number;
} | null {
  const p = resolveParams(params);
  const series = computeIchimoku(bars, p);
  const close = bars[index]?.close;
  const tenkan = series.tenkan[index];
  const kijun = series.kijun[index];

  const cloudIdx = index - p.displacement;
  if (
    close == null ||
    tenkan == null ||
    kijun == null ||
    cloudIdx < 0 ||
    series.spanA[cloudIdx] == null ||
    series.spanB[cloudIdx] == null
  ) {
    return null;
  }

  const spanA = series.spanA[cloudIdx]!;
  const spanB = series.spanB[cloudIdx]!;
  return {
    close,
    tenkan,
    kijun,
    spanA,
    spanB,
    cloudTop: Math.max(spanA, spanB),
    cloudBottom: Math.min(spanA, spanB),
  };
}
