import type { AutoscaleInfo, AutoscaleInfoProvider } from "lightweight-charts";

/** RSI·MFI·스토캐스틱 등 0~100 오실레이터 */
export const OSCILLATOR_0_100_AUTOSCALE: AutoscaleInfoProvider = () => ({
  priceRange: { minValue: 0, maxValue: 100 },
  margins: { above: 8, below: 8 },
});

/** 거래량: 보이는 구간 데이터 최대값 기준 (0부터) */
export const volumeAutoscaleProvider: AutoscaleInfoProvider = (original) => {
  const res = original();
  if (res === null || res.priceRange === null) {
    return { priceRange: { minValue: 0, maxValue: 1 } };
  }
  const maxV = Math.max(0, res.priceRange.maxValue);
  const padded = maxV > 0 ? maxV * 1.15 : 1;
  return {
    priceRange: { minValue: 0, maxValue: padded },
    margins: { above: 12, below: 2 },
  } satisfies AutoscaleInfo;
};

/** MACD 등 가변 범위 보조지표 */
export const macdAutoscaleProvider: AutoscaleInfoProvider = (original) => {
  const res = original();
  if (res === null || res.priceRange === null) return null;
  const { minValue, maxValue } = res.priceRange;
  const span = maxValue - minValue || 1;
  return {
    priceRange: {
      minValue: minValue - span * 0.1,
      maxValue: maxValue + span * 0.1,
    },
    margins: { above: 10, below: 10 },
  };
};
