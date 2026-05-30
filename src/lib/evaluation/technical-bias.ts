import type { EvaluationResult } from "./types";

export type TechnicalBiasSide = "buy" | "sell" | "neutral";

export interface TechnicalBiasSummary {
  buyLeaning: number;
  sellLeaning: number;
  neutral: number;
  dominant: "buy" | "sell" | "mixed" | "neutral";
  dominantLabel: string;
  explanation: string;
}

/** 지표 1개의 기술적 방향 (매매 권유 아님) */
export function biasForResult(r: EvaluationResult): TechnicalBiasSide {
  const q = r.qualifier;

  if (
    q === "oversold" ||
    q === "weak_bullish" ||
    q === "lower_band" ||
    q === "band_break_down"
  ) {
    return "buy";
  }

  if (
    q === "overbought" ||
    q === "bearish" ||
    q === "weak_bearish" ||
    q === "upper_band" ||
    q === "band_break_up"
  ) {
    return "sell";
  }

  return "neutral";
}

export function buildTechnicalBias(
  results: EvaluationResult[],
): TechnicalBiasSummary {
  let buyLeaning = 0;
  let sellLeaning = 0;
  let neutral = 0;

  for (const r of results) {
    const b = biasForResult(r);
    if (b === "buy") buyLeaning++;
    else if (b === "sell") sellLeaning++;
    else neutral++;
  }

  const total = results.length;
  let dominant: TechnicalBiasSummary["dominant"] = "mixed";
  let dominantLabel = "혼조";
  let explanation =
    "선택 지표 간 기술적 방향이 엇갈려, 단일 방향으로 우위를 두기 어렵습니다.";

  if (total === 0) {
    return {
      buyLeaning: 0,
      sellLeaning: 0,
      neutral: 0,
      dominant: "neutral",
      dominantLabel: "—",
      explanation: "분석 지표가 없습니다.",
    };
  }

  if (buyLeaning > sellLeaning && buyLeaning > neutral) {
    dominant = "buy";
    dominantLabel = "매수 쪽 기술 신호 다소 우세";
    explanation = `선택 ${total}개 지표 중 ${buyLeaning}개가 과매도·상승 모멘텀 등 매수 쪽 기술 해석에 가깝습니다.`;
  } else if (sellLeaning > buyLeaning && sellLeaning > neutral) {
    dominant = "sell";
    dominantLabel = "매도 쪽 기술 신호 다소 우세";
    explanation = `선택 ${total}개 지표 중 ${sellLeaning}개가 과매수·하락 모멘텀 등 매도(차익·리스크) 쪽 기술 해석에 가깝습니다.`;
  } else if (neutral === total) {
    dominant = "neutral";
    dominantLabel = "중립";
    explanation = "선택 지표가 대체로 중립 구간으로, 뚜렷한 방향 우위가 없습니다.";
  } else {
    explanation = `매수 쪽 해석 ${buyLeaning} · 매도 쪽 해석 ${sellLeaning} · 중립 ${neutral}으로 방향이 섞여 있습니다.`;
  }

  return {
    buyLeaning,
    sellLeaning,
    neutral,
    dominant,
    dominantLabel,
    explanation,
  };
}
