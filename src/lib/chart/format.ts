/** 한국 주식 차트용 가격 축 (천 단위 콤마, 소수점 없음) */
export function formatKrPrice(value: number): string {
  if (!Number.isFinite(value)) return "";
  return Math.round(value).toLocaleString("ko-KR");
}

/** 거래량 축 */
export function formatKrVolume(value: number): string {
  if (!Number.isFinite(value)) return "";
  const v = Math.abs(value);
  if (v >= 1_000_000) {
    const m = Math.round(v / 1_000_000);
    return `${m.toLocaleString("ko-KR")}백만`;
  }
  if (v >= 10_000) {
    const man = Math.round(v / 10_000);
    return `${man.toLocaleString("ko-KR")}만`;
  }
  return Math.round(v).toLocaleString("ko-KR");
}

/** RSI·MFI 등 0~100 보조지표 축 */
export function formatKrOscillator(value: number): string {
  if (!Number.isFinite(value)) return "";
  return Math.round(value).toLocaleString("ko-KR");
}

export const CHART_LOCALIZATION = {
  locale: "ko-KR",
  priceFormatter: formatKrPrice,
} as const;
