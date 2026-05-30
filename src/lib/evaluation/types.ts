export type StatusTier = "ok" | "caution" | "unsuitable";

export type StatusQualifier =
  | "overbought"
  | "oversold"
  | "weak_bullish"
  | "weak_bearish"
  | "bearish"
  | "upper_band"
  | "lower_band"
  | "band_break_up"
  | "band_break_down";

export type IndicatorId =
  | "rsi"
  | "mfi"
  | "stochastic"
  | "macd"
  | "bollinger";

export interface IndicatorParams {
  period?: number;
  fast?: number;
  slow?: number;
  signal?: number;
  stdDev?: number;
  kPeriod?: number;
  dPeriod?: number;
}

export interface EvaluationResult {
  indicatorId: IndicatorId;
  name: string;
  tier: StatusTier;
  qualifier: StatusQualifier | null;
  label: string;
  value: number | null;
  valueDisplay: string;
  summary: string;
  reasonKey: string;
  trendNote?: string;
}

export interface OhlcvBar {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
