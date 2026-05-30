import { ColorType, createChart, type IChartApi } from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import type { ChartPayload, TimeframeChartData } from "./api";

type Tab = "daily" | "weekly" | "monthly";

const TABS: { id: Tab; label: string }[] = [
  { id: "daily", label: "일봉" },
  { id: "weekly", label: "주봉" },
  { id: "monthly", label: "월봉" },
];

function frameOf(data: ChartPayload, tab: Tab): TimeframeChartData {
  return data[tab];
}

export function MiniTradingChart({
  data,
  loading,
}: {
  data: ChartPayload | null;
  loading: boolean;
}) {
  const [tab, setTab] = useState<Tab>("daily");
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current || !data) return;

    const frame = frameOf(data, tab);
    const candles = frame.candles ?? [];
    if (candles.length === 0) return;

    chartRef.current?.remove();
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 260,
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#334155",
      },
      grid: {
        vertLines: { color: "#f1f5f9" },
        horzLines: { color: "#f1f5f9" },
      },
      rightPriceScale: { borderColor: "#e2e8f0" },
      timeScale: { borderColor: "#e2e8f0" },
    });
    chartRef.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#ef4444",
      downColor: "#3b82f6",
      borderVisible: false,
      wickUpColor: "#ef4444",
      wickDownColor: "#3b82f6",
    });
    candleSeries.setData(
      candles.map((c) => ({
        time: c.time as `${number}-${number}-${number}`,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    );

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });
    volumeSeries.setData(
      candles.map((c) => ({
        time: c.time as `${number}-${number}-${number}`,
        value: c.volume,
        color: c.close >= c.open ? "#fecaca" : "#bfdbfe",
      })),
    );

    chart.timeScale().fitContent();

    const onResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [data, tab]);

  if (loading) {
    return (
      <p className="chart-hint">차트 불러오는 중…</p>
    );
  }
  if (!data) return null;

  return (
    <div className="mini-chart">
      <div className="chart-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? "chart-tab active" : "chart-tab"}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div ref={containerRef} className="chart-canvas" />
      <p className="chart-hint">전일(완성 봉) 기준 · 참고용</p>
    </div>
  );
}
