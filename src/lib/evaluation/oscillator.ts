import { formatStatusLabel, OSCILLATOR_TREND_NOTE } from "./labels";
import { getMessage } from "./messages.ko";
import type {
  EvaluationResult,
  IndicatorId,
  StatusQualifier,
  StatusTier,
} from "./types";

export function evaluateOscillator(
  indicatorId: IndicatorId,
  name: string,
  value: number,
): EvaluationResult {
  let tier: StatusTier = "ok";
  let qualifier: StatusQualifier | null = null;
  let reasonKey = `${indicatorId}.ok`;

  if (value > 30 && value < 70) {
    tier = "ok";
  } else if (value >= 70 && value < 80) {
    tier = "caution";
    qualifier = "overbought";
    reasonKey = `${indicatorId}.caution.overbought`;
  } else if (value >= 80) {
    tier = "unsuitable";
    qualifier = "overbought";
    reasonKey = `${indicatorId}.unsuitable.overbought`;
  } else if (value <= 30 && value > 20) {
    tier = "caution";
    qualifier = "oversold";
    reasonKey = `${indicatorId}.caution.oversold`;
  } else if (value <= 20) {
    tier = "unsuitable";
    qualifier = "oversold";
    reasonKey = `${indicatorId}.unsuitable.oversold`;
  }

  const needsTrendNote = qualifier === "overbought" || qualifier === "oversold";

  return {
    indicatorId,
    name,
    tier,
    qualifier,
    label: formatStatusLabel(tier, qualifier),
    value,
    valueDisplay: value.toFixed(1),
    summary: getMessage(reasonKey),
    reasonKey,
    trendNote: needsTrendNote ? OSCILLATOR_TREND_NOTE : undefined,
  };
}

/** MFI / Stochastic: 20/80 symbolic, 10/90 extreme */
export function evaluateOscillator2080(
  indicatorId: IndicatorId,
  name: string,
  value: number,
): EvaluationResult {
  let tier: StatusTier = "ok";
  let qualifier: StatusQualifier | null = null;
  let reasonKey = `${indicatorId}.ok`;

  if (value > 20 && value < 80) {
    tier = "ok";
  } else if (value >= 80 && value < 90) {
    tier = "caution";
    qualifier = "overbought";
    reasonKey = `${indicatorId}.caution.overbought`;
  } else if (value >= 90) {
    tier = "unsuitable";
    qualifier = "overbought";
    reasonKey = `${indicatorId}.unsuitable.overbought`;
  } else if (value <= 20 && value > 10) {
    tier = "caution";
    qualifier = "oversold";
    reasonKey = `${indicatorId}.caution.oversold`;
  } else if (value <= 10) {
    tier = "unsuitable";
    qualifier = "oversold";
    reasonKey = `${indicatorId}.unsuitable.oversold`;
  }

  const needsTrendNote = qualifier === "overbought" || qualifier === "oversold";

  return {
    indicatorId,
    name,
    tier,
    qualifier,
    label: formatStatusLabel(tier, qualifier),
    value,
    valueDisplay: value.toFixed(1),
    summary: getMessage(reasonKey),
    reasonKey,
    trendNote: needsTrendNote ? OSCILLATOR_TREND_NOTE : undefined,
  };
}
