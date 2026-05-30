import type { EvaluationResult } from "./types";
import { buildTechnicalBias } from "./technical-bias";

export interface SummaryOpinion {
  headline: string;
  lines: string[];
  breakdown: { name: string; label: string }[];
  technicalBias: ReturnType<typeof buildTechnicalBias>;
}

/** 매수·매도 없이 지표 상태만 집계한 참고용 종합의견 */
export function buildSummaryOpinion(
  results: EvaluationResult[],
): SummaryOpinion {
  if (results.length === 0) {
    return {
      headline: "분석된 지표가 없습니다.",
      lines: [],
      breakdown: [],
      technicalBias: buildTechnicalBias([]),
    };
  }

  const technicalBias = buildTechnicalBias(results);

  const ok = results.filter((r) => r.tier === "ok").length;
  const caution = results.filter((r) => r.tier === "caution").length;
  const unsuitable = results.filter((r) => r.tier === "unsuitable").length;
  const total = results.length;

  const overbought = results.filter((r) => r.qualifier === "overbought").length;
  const oversold = results.filter((r) => r.qualifier === "oversold").length;
  const bearishMom = results.filter(
    (r) => r.qualifier === "bearish" || r.qualifier === "weak_bearish",
  ).length;

  let headline: string;
  if (unsuitable === 0 && caution === 0) {
    headline = "선택한 지표가 모두 일반적 범위로 요약됩니다.";
  } else if (unsuitable >= 2) {
    headline =
      "선택 지표 여러 곳에서 주의·부적합(과열·침체 등) 신호가 함께 관찰됩니다.";
  } else if (caution >= Math.ceil(total / 2)) {
    headline = "선택 지표의 절반 이상에서 주의 구간이 관찰됩니다.";
  } else if (ok >= Math.ceil((total * 2) / 3)) {
    headline =
      "대부분의 지표는 적정이나, 일부에서 주의 신호가 함께 관찰됩니다.";
  } else {
    headline = "지표별로 적정·주의·부적합 신호가 혼재되어 있습니다.";
  }

  const lines: string[] = [
    `집계: 총 ${total}개 · 적정 ${ok} · 주의 ${caution} · 부적합 ${unsuitable}`,
  ];

  if (overbought > 0) {
    lines.push(`과매수·상단 관련 표시: ${overbought}개 지표`);
  }
  if (oversold > 0) {
    lines.push(`과매도·하단 관련 표시: ${oversold}개 지표`);
  }
  if (bearishMom > 0) {
    lines.push(`하락·둔화 모멘텀 관련: ${bearishMom}개 지표`);
  }

  lines.push(
    `기술 신호 방향: 매수 쪽 ${technicalBias.buyLeaning} · 매도 쪽 ${technicalBias.sellLeaning} · 중립 ${technicalBias.neutral}`,
    `종합: ${technicalBias.dominantLabel} — ${technicalBias.explanation}`,
    "※ 위 ‘매수/매도 쪽’은 지표 해석상 방향일 뿐, 매매·투자 권유가 아닙니다. 최종 매수 여부는 투자자 본인이 결정합니다.",
  );

  return {
    headline,
    lines,
    breakdown: results.map((r) => ({ name: r.name, label: r.label })),
    technicalBias,
  };
}
