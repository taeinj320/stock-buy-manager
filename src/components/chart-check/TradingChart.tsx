"use client";

import {
  CHART_LOCALIZATION,
  formatKrOscillator,
  formatKrPrice,
  formatKrVolume,
} from "@/lib/chart/format";
import { IchimokuCloudPrimitive } from "@/lib/chart/ichimoku-cloud-primitive";
import {
  OSCILLATOR_0_100_AUTOSCALE,
  macdAutoscaleProvider,
  volumeAutoscaleProvider,
} from "@/lib/chart/scale";
import type { IndicatorId } from "@/lib/evaluation/types";
import type { ChartCandle, ChartOverlays } from "@/lib/market-data/ohlcv-utils";
import {
  CandlestickSeries,
  ColorType,
  HistogramSeries,
  LineSeries,
  LineStyle,
  createChart,
  type IChartApi,
} from "lightweight-charts";
import { useChartHeight } from "@/hooks/use-chart-height";
import { cn } from "@/lib/cn";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChartOverlayPicker } from "./ChartOverlayPicker";
import { GlassCard } from "@/components/ui/glass-card";

type Timeframe = "daily" | "weekly" | "monthly";

const TABS: { id: Timeframe; label: string }[] = [
  { id: "daily", label: "일봉" },
  { id: "weekly", label: "주봉" },
  { id: "monthly", label: "월봉" },
];

export interface TimeframeChartData {
  candles: ChartCandle[];
  overlays: ChartOverlays;
}

interface ChartData {
  daily: TimeframeChartData;
  weekly: TimeframeChartData;
  monthly: TimeframeChartData;
}

interface Props {
  data: ChartData | null;
  loading: boolean;
  stockName?: string;
  visibleOverlays: Set<IndicatorId>;
  onVisibleOverlaysChange: (next: Set<IndicatorId>) => void;
}

export function TradingChart({
  data,
  loading,
  stockName,
  visibleOverlays,
  onVisibleOverlaysChange,
}: Props) {
  const chartHeight = useChartHeight();
  const [tab, setTab] = useState<Timeframe>("daily");
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const frame = data?.[tab];
  const candles = frame?.candles;
  const overlays = frame?.overlays;

  const show = useMemo(
    () => ({
      bollinger: visibleOverlays.has("bollinger"),
      rsi: visibleOverlays.has("rsi"),
      mfi: visibleOverlays.has("mfi"),
      stochastic: visibleOverlays.has("stochastic"),
      macd: visibleOverlays.has("macd"),
      ichimoku: visibleOverlays.has("ichimoku"),
    }),
    [visibleOverlays],
  );

  useEffect(() => {
    if (!containerRef.current || !candles?.length) return;

    containerRef.current.replaceChildren();
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#64748b",
      },
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.15)" },
        horzLines: { color: "rgba(148, 163, 184, 0.15)" },
      },
      width: containerRef.current.clientWidth,
      height: chartHeight,
      timeScale: { borderColor: "rgba(148, 163, 184, 0.25)", timeVisible: true },
      rightPriceScale: { borderColor: "rgba(148, 163, 184, 0.25)" },
      localization: CHART_LOCALIZATION,
    });

    chartRef.current = chart;
    let paneIndex = 0;

    chart.panes()[paneIndex].setStretchFactor(4);

    const candleSeries = chart.addSeries(
      CandlestickSeries,
      {
        upColor: "#ef4444",
        downColor: "#3b82f6",
        borderUpColor: "#ef4444",
        borderDownColor: "#3b82f6",
        wickUpColor: "#ef4444",
        wickDownColor: "#3b82f6",
        priceFormat: {
          type: "custom",
          formatter: formatKrPrice,
        },
      },
      paneIndex,
    );
    candleSeries.setData(
      candles.map((c) => ({
        time: c.time as "YYYY-MM-DD",
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    );

    if (show.ichimoku && overlays?.ichimoku?.cloud.length) {
      candleSeries.attachPrimitive(
        new IchimokuCloudPrimitive(overlays.ichimoku.cloud),
      );
    }

    if (show.bollinger && overlays?.bollinger) {
      const bbOpts = {
        lineWidth: 1 as const,
        priceLineVisible: false,
        priceFormat: {
          type: "custom" as const,
          formatter: formatKrPrice,
        },
      };
      const upper = chart.addSeries(
        LineSeries,
        { ...bbOpts, color: "#a855f7", title: "BB상" },
        paneIndex,
      );
      const middle = chart.addSeries(
        LineSeries,
        { ...bbOpts, color: "#71717a", title: "BB중" },
        paneIndex,
      );
      const lower = chart.addSeries(
        LineSeries,
        { ...bbOpts, color: "#a855f7", title: "BB하" },
        paneIndex,
      );
      const toLine = (pts: { time: string; value: number }[]) =>
        pts.map((p) => ({
          time: p.time as "YYYY-MM-DD",
          value: p.value,
        }));
      upper.setData(toLine(overlays.bollinger.upper));
      middle.setData(toLine(overlays.bollinger.middle));
      lower.setData(toLine(overlays.bollinger.lower));
    }

    if (show.ichimoku && overlays?.ichimoku) {
      const ichiOpts = {
        lineWidth: 1 as const,
        priceLineVisible: false,
        priceFormat: {
          type: "custom" as const,
          formatter: formatKrPrice,
        },
      };
      const toLine = (pts: { time: string; value: number }[]) =>
        pts.map((p) => ({
          time: p.time as "YYYY-MM-DD",
          value: p.value,
        }));
      const tenkan = chart.addSeries(
        LineSeries,
        { ...ichiOpts, color: "#2563eb", title: "전환" },
        paneIndex,
      );
      const kijun = chart.addSeries(
        LineSeries,
        { ...ichiOpts, color: "#dc2626", title: "기준" },
        paneIndex,
      );
      const spanA = chart.addSeries(
        LineSeries,
        {
          ...ichiOpts,
          color: "rgba(21, 128, 61, 0.9)",
          lineStyle: LineStyle.Dashed,
          lineWidth: 1,
          title: "선행A",
        },
        paneIndex,
      );
      const spanB = chart.addSeries(
        LineSeries,
        {
          ...ichiOpts,
          color: "rgba(194, 65, 12, 0.9)",
          lineStyle: LineStyle.Dashed,
          lineWidth: 1,
          title: "선행B",
        },
        paneIndex,
      );
      tenkan.setData(toLine(overlays.ichimoku.tenkan));
      kijun.setData(toLine(overlays.ichimoku.kijun));
      spanA.setData(toLine(overlays.ichimoku.spanA));
      spanB.setData(toLine(overlays.ichimoku.spanB));
      if (overlays.ichimoku.chikou.length > 0) {
        const chikou = chart.addSeries(
          LineSeries,
          {
            ...ichiOpts,
            color: "#7c3aed",
            lineStyle: LineStyle.Dotted,
            lineWidth: 1,
            title: "후행",
          },
          paneIndex,
        );
        chikou.setData(toLine(overlays.ichimoku.chikou));
      }
    }

    chart.addPane();
    paneIndex += 1;
    const volPaneIndex = paneIndex;
    chart.panes()[volPaneIndex].setStretchFactor(1.2);
    const volSeries = chart.addSeries(
      HistogramSeries,
      {
        priceFormat: {
          type: "custom",
          formatter: formatKrVolume,
        },
        autoscaleInfoProvider: volumeAutoscaleProvider,
      },
      volPaneIndex,
    );
    chart.priceScale("right", volPaneIndex).applyOptions({
      autoScale: true,
      scaleMargins: { top: 0.08, bottom: 0.02 },
    });
    volSeries.setData(
      candles.map((c) => ({
        time: c.time as "YYYY-MM-DD",
        value: c.volume,
        color:
          c.close >= c.open
            ? "rgba(239, 68, 68, 0.45)"
            : "rgba(59, 130, 246, 0.45)",
      })),
    );

    const addOscillatorPane = (
      title: string,
      color: string,
      points: { time: string; value: number }[],
      refLines?: number[],
    ) => {
      if (!points.length) return;
      chart.addPane();
      paneIndex += 1;
      chart.panes()[paneIndex].setStretchFactor(1.3);
      chart.priceScale("right", paneIndex).applyOptions({
        autoScale: true,
        scaleMargins: { top: 0.08, bottom: 0.08 },
      });
      const series = chart.addSeries(
        LineSeries,
        {
          color,
          lineWidth: 2,
          title,
          priceFormat: {
            type: "custom",
            formatter: formatKrOscillator,
          },
          autoscaleInfoProvider: OSCILLATOR_0_100_AUTOSCALE,
        },
        paneIndex,
      );
      series.setData(
        points.map((p) => ({
          time: p.time as "YYYY-MM-DD",
          value: p.value,
        })),
      );
      for (const level of refLines ?? []) {
        series.createPriceLine({
          price: level,
          color: "#d4d4d8",
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: formatKrOscillator(level),
        });
      }
    };

    if (show.rsi && overlays?.rsi?.length) {
      addOscillatorPane("RSI", "#7c3aed", overlays.rsi, [30, 70]);
    }
    if (show.mfi && overlays?.mfi?.length) {
      addOscillatorPane("MFI", "#0891b2", overlays.mfi, [20, 80]);
    }
    if (show.stochastic && overlays?.stochastic?.length) {
      addOscillatorPane("Stoch", "#ca8a04", overlays.stochastic, [20, 80]);
    }

    if (show.macd && overlays?.macd) {
      chart.addPane();
      paneIndex += 1;
      chart.panes()[paneIndex].setStretchFactor(1.5);
      chart.priceScale("right", paneIndex).applyOptions({
        autoScale: true,
        scaleMargins: { top: 0.12, bottom: 0.12 },
      });
      const macdFmt = {
        type: "custom" as const,
        formatter: formatKrOscillator,
      };
      const hist = chart.addSeries(
        HistogramSeries,
        {
          title: "MACD Hist",
          priceFormat: macdFmt,
          autoscaleInfoProvider: macdAutoscaleProvider,
        },
        paneIndex,
      );
      hist.setData(
        overlays.macd.histogram.map((p) => ({
          time: p.time as "YYYY-MM-DD",
          value: p.value,
          color:
            p.value >= 0
              ? "rgba(239, 68, 68, 0.5)"
              : "rgba(59, 130, 246, 0.5)",
        })),
      );
      const macdLine = chart.addSeries(
        LineSeries,
        {
          color: "#2563eb",
          lineWidth: 2,
          title: "MACD",
          priceFormat: macdFmt,
          autoscaleInfoProvider: macdAutoscaleProvider,
        },
        paneIndex,
      );
      const signalLine = chart.addSeries(
        LineSeries,
        {
          color: "#f97316",
          lineWidth: 2,
          title: "Signal",
          priceFormat: macdFmt,
          autoscaleInfoProvider: macdAutoscaleProvider,
        },
        paneIndex,
      );
      const toLine = (pts: { time: string; value: number }[]) =>
        pts.map((p) => ({
          time: p.time as "YYYY-MM-DD",
          value: p.value,
        }));
      macdLine.setData(toLine(overlays.macd.macd));
      signalLine.setData(toLine(overlays.macd.signal));
    }

    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [candles, overlays, tab, show, chartHeight]);

  return (
    <GlassCard className="overflow-hidden">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">가격 차트</h2>
          {stockName && (
            <p className="text-xs text-slate-500">
              {stockName} · 전일(완성 봉) · 거래량 항상 표시
            </p>
          )}
        </div>
        <div className="flex w-full rounded-xl border border-slate-200/80 bg-slate-50/80 p-1 sm:w-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "min-h-11 flex-1 rounded-lg px-3 py-2 text-sm font-medium transition sm:min-h-9 sm:flex-none sm:py-1.5 sm:text-xs",
                tab === t.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {data && (candles?.length ?? 0) > 0 && (
        <ChartOverlayPicker
          visible={visibleOverlays}
          onChange={onVisibleOverlaysChange}
        />
      )}

      <div
        className="overflow-hidden rounded-xl border border-slate-200/60 bg-white/60"
        style={{ minHeight: chartHeight }}
      >
        {loading && (
          <div
            className="flex flex-col gap-3 p-4"
            style={{ height: chartHeight }}
            aria-busy="true"
            aria-label="차트 로딩 중"
          >
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
            <div className="flex-1 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-16 animate-pulse rounded-lg bg-slate-50" />
          </div>
        )}

        {!loading && (!data || !candles?.length) && (
          <div
            className="flex items-center justify-center text-sm text-slate-500"
            style={{ height: chartHeight }}
          >
            분석 실행 시 차트가 표시됩니다.
          </div>
        )}

        <div
          ref={containerRef}
          className={cn("w-full", loading || !candles?.length ? "hidden" : "")}
          style={{ height: chartHeight }}
        />
      </div>
    </GlassCard>
  );
}
