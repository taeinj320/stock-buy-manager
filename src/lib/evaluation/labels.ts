import type { StatusQualifier, StatusTier } from "./types";

const TIER_LABEL: Record<StatusTier, string> = {
  ok: "적정",
  caution: "주의",
  unsuitable: "부적합",
};

const QUALIFIER_LABEL: Record<StatusQualifier, string> = {
  overbought: "과매수",
  oversold: "과매도",
  weak_bullish: "모멘텀 회복",
  weak_bearish: "모멘텀 둔화",
  bearish: "하락 모멘텀",
  upper_band: "상단 밴드",
  lower_band: "하단 밴드",
  band_break_up: "상단 이탈",
  band_break_down: "하단 이탈",
};

export function formatStatusLabel(
  tier: StatusTier,
  qualifier: StatusQualifier | null,
): string {
  const base = TIER_LABEL[tier];
  if (tier === "ok" || !qualifier) return base;
  return `${base}(${QUALIFIER_LABEL[qualifier]})`;
}

export const OSCILLATOR_TREND_NOTE =
  "강한 추세에서는 과매수·과매도 구간이 오래 지속될 수 있습니다. 매매 신호가 아닌 참고 정보입니다.";
