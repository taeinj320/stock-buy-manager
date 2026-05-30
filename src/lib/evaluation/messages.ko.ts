const MESSAGES: Record<string, string> = {
  "rsi.ok": "30~70 구간으로 일반적 중립",
  "rsi.caution.overbought": "일반적 과매수 구간(70 이상)",
  "rsi.unsuitable.overbought": "확장 과매수 구간(80 이상)",
  "rsi.caution.oversold": "일반적 과매도 구간(30 이하)",
  "rsi.unsuitable.oversold": "확장 과매도 구간(20 이하)",

  "mfi.ok": "20~80 구간으로 일반적 중립",
  "mfi.caution.overbought": "일반적 과매수 구간(80 이상)",
  "mfi.unsuitable.overbought": "극단 과매수 구간(90 이상)",
  "mfi.caution.oversold": "일반적 과매도 구간(20 이하)",
  "mfi.unsuitable.oversold": "극단 과매도 구간(10 이하)",

  "stochastic.ok": "20~80 구간으로 일반적 중립",
  "stochastic.caution.overbought": "일반적 과매수 구간(80 이상)",
  "stochastic.unsuitable.overbought": "극단 과매수 구간(90 이상)",
  "stochastic.caution.oversold": "일반적 과매도 구간(20 이하)",
  "stochastic.unsuitable.oversold": "극단 과매도 구간(10 이하)",

  "macd.ok": "상승 모멘텀 유지 (MACD > 시그널, 0선 위)",
  "macd.caution.weak_bullish": "0선 아래에서 골든크로스 — 추세 전환 관찰",
  "macd.caution.weak_bearish": "0선 위에서 데드크로스 — 모멘텀 둔화",
  "macd.unsuitable.bearish": "하락 모멘텀 (MACD < 시그널, 0선 아래)",

  "bollinger.ok": "밴드 내 일반적 가격 위치",
  "bollinger.caution.upper_band": "상단 밴드 접근·터치",
  "bollinger.caution.lower_band": "하단 밴드 접근·터치",
  "bollinger.unsuitable.band_break_up": "상단 밴드 상향 이탈 마감",
  "bollinger.unsuitable.band_break_down": "하단 밴드 하향 이탈 마감",

  "ichimoku.ok": "구름대 위·전환선이 기준선 위 (상승 추세 해석)",
  "ichimoku.caution.inside_cloud": "가격이 구름대 안 (방향 불명확)",
  "ichimoku.caution.weak_bullish": "구름대 위이나 전환선이 기준선 아래",
  "ichimoku.caution.weak_bearish": "구름대 아래이나 전환선이 기준선 위",
  "ichimoku.unsuitable.bearish": "구름대 아래·전환선이 기준선 아래 (하락 추세 해석)",
};

export function getMessage(reasonKey: string): string {
  return MESSAGES[reasonKey] ?? "지표 상태를 확인했습니다.";
}
