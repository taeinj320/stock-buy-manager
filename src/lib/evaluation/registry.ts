import { formatStatusLabel } from "./labels";
import { getMessage } from "./messages.ko";
import { evaluateOscillator, evaluateOscillator2080 } from "./oscillator";
import type {
  EvaluationResult,
  IndicatorId,
  IndicatorParams,
  OhlcvBar,
} from "./types";
import {
  bollinger,
  closes,
  macd,
  mfi,
  rsi,
  stochasticK,
} from "@/lib/indicators/math";

export interface IndicatorMeta {
  id: IndicatorId;
  name: string;
  enabled: boolean;
  defaultParams: IndicatorParams;
}

export const INDICATOR_CATALOG: IndicatorMeta[] = [
  {
    id: "rsi",
    name: "RSI",
    enabled: true,
    defaultParams: { period: 14 },
  },
  {
    id: "mfi",
    name: "MFI",
    enabled: true,
    defaultParams: { period: 14 },
  },
  {
    id: "stochastic",
    name: "스토캐스틱",
    enabled: true,
    defaultParams: { kPeriod: 14, dPeriod: 3 },
  },
  {
    id: "macd",
    name: "MACD",
    enabled: true,
    defaultParams: { fast: 12, slow: 26, signal: 9 },
  },
  {
    id: "bollinger",
    name: "볼린저밴드",
    enabled: true,
    defaultParams: { period: 20, stdDev: 2 },
  },
];

export function evaluateIndicator(
  id: IndicatorId,
  bars: OhlcvBar[],
  params: IndicatorParams = {},
): EvaluationResult | null {
  const meta = INDICATOR_CATALOG.find((m) => m.id === id);
  if (!meta) return null;

  const c = closes(bars);

  switch (id) {
    case "rsi": {
      const period = params.period ?? 14;
      const value = rsi(c, period);
      if (value === null) return insufficient(id, meta.name);
      return evaluateOscillator(id, meta.name, value);
    }
    case "mfi": {
      const period = params.period ?? 14;
      const value = mfi(bars, period);
      if (value === null) return insufficient(id, meta.name);
      return evaluateOscillator2080(id, meta.name, value);
    }
    case "stochastic": {
      const kPeriod = params.kPeriod ?? 14;
      const value = stochasticK(bars, kPeriod);
      if (value === null) return insufficient(id, meta.name);
      return evaluateOscillator2080(id, meta.name, value);
    }
    case "macd": {
      const fast = params.fast ?? 12;
      const slow = params.slow ?? 26;
      const signalPeriod = params.signal ?? 9;
      const m = macd(c, fast, slow, signalPeriod);
      if (!m) return insufficient(id, meta.name);
      return evaluateMacd(meta.name, m);
    }
    case "bollinger": {
      const period = params.period ?? 20;
      const stdDev = params.stdDev ?? 2;
      const bb = bollinger(c, period, stdDev);
      if (!bb) return insufficient(id, meta.name);
      return evaluateBollinger(meta.name, bb, c[c.length - 1]);
    }
    default:
      return null;
  }
}

function insufficient(id: IndicatorId, name: string): EvaluationResult {
  return {
    indicatorId: id,
    name,
    tier: "caution",
    qualifier: null,
    label: "주의",
    value: null,
    valueDisplay: "—",
    summary: "데이터가 부족하여 지표를 계산할 수 없습니다.",
    reasonKey: `${id}.insufficient`,
  };
}

function evaluateMacd(
  name: string,
  m: { macd: number; signal: number; histogram: number },
): EvaluationResult {
  const { macd: macdVal, signal, histogram } = m;

  if (macdVal > signal && macdVal > 0 && histogram >= 0) {
    return {
      indicatorId: "macd",
      name,
      tier: "ok",
      qualifier: null,
      label: formatStatusLabel("ok", null),
      value: macdVal,
      valueDisplay: macdVal.toFixed(2),
      summary: getMessage("macd.ok"),
      reasonKey: "macd.ok",
    };
  }

  if (macdVal > signal && macdVal <= 0) {
    return {
      indicatorId: "macd",
      name,
      tier: "caution",
      qualifier: "weak_bullish",
      label: formatStatusLabel("caution", "weak_bullish"),
      value: macdVal,
      valueDisplay: macdVal.toFixed(2),
      summary: getMessage("macd.caution.weak_bullish"),
      reasonKey: "macd.caution.weak_bullish",
    };
  }

  if (macdVal < signal && macdVal > 0) {
    return {
      indicatorId: "macd",
      name,
      tier: "caution",
      qualifier: "weak_bearish",
      label: formatStatusLabel("caution", "weak_bearish"),
      value: macdVal,
      valueDisplay: macdVal.toFixed(2),
      summary: getMessage("macd.caution.weak_bearish"),
      reasonKey: "macd.caution.weak_bearish",
    };
  }

  return {
    indicatorId: "macd",
    name,
    tier: "unsuitable",
    qualifier: "bearish",
    label: formatStatusLabel("unsuitable", "bearish"),
    value: macdVal,
    valueDisplay: macdVal.toFixed(2),
    summary: getMessage("macd.unsuitable.bearish"),
    reasonKey: "macd.unsuitable.bearish",
  };
}

function evaluateBollinger(
  name: string,
  bb: { upper: number; middle: number; lower: number; percentB: number },
  close: number,
): EvaluationResult {
  const { upper, lower, percentB } = bb;

  if (close > upper) {
    return {
      indicatorId: "bollinger",
      name,
      tier: "unsuitable",
      qualifier: "band_break_up",
      label: formatStatusLabel("unsuitable", "band_break_up"),
      value: percentB,
      valueDisplay: `%B ${percentB.toFixed(2)}`,
      summary: getMessage("bollinger.unsuitable.band_break_up"),
      reasonKey: "bollinger.unsuitable.band_break_up",
    };
  }

  if (close < lower) {
    return {
      indicatorId: "bollinger",
      name,
      tier: "unsuitable",
      qualifier: "band_break_down",
      label: formatStatusLabel("unsuitable", "band_break_down"),
      value: percentB,
      valueDisplay: `%B ${percentB.toFixed(2)}`,
      summary: getMessage("bollinger.unsuitable.band_break_down"),
      reasonKey: "bollinger.unsuitable.band_break_down",
    };
  }

  if (percentB >= 0.85 || close >= upper * 0.998) {
    return {
      indicatorId: "bollinger",
      name,
      tier: "caution",
      qualifier: "upper_band",
      label: formatStatusLabel("caution", "upper_band"),
      value: percentB,
      valueDisplay: `%B ${percentB.toFixed(2)}`,
      summary: getMessage("bollinger.caution.upper_band"),
      reasonKey: "bollinger.caution.upper_band",
    };
  }

  if (percentB <= 0.15 || close <= lower * 1.002) {
    return {
      indicatorId: "bollinger",
      name,
      tier: "caution",
      qualifier: "lower_band",
      label: formatStatusLabel("caution", "lower_band"),
      value: percentB,
      valueDisplay: `%B ${percentB.toFixed(2)}`,
      summary: getMessage("bollinger.caution.lower_band"),
      reasonKey: "bollinger.caution.lower_band",
    };
  }

  return {
    indicatorId: "bollinger",
    name,
    tier: "ok",
    qualifier: null,
    label: formatStatusLabel("ok", null),
    value: percentB,
    valueDisplay: `%B ${percentB.toFixed(2)}`,
    summary: getMessage("bollinger.ok"),
    reasonKey: "bollinger.ok",
  };
}
