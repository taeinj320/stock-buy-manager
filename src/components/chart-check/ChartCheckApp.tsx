"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { PrimaryButton } from "@/components/ui/primary-button";
import { cn } from "@/lib/cn";
import { INDICATOR_CATALOG } from "@/lib/evaluation/registry";
import type { IndicatorId, IndicatorParams } from "@/lib/evaluation/types";
import type { EvaluationResult } from "@/lib/evaluation/types";
import { BarChart3, LineChart, Shield } from "lucide-react";
import { useRef, useState } from "react";
import type { TimeframeChartData } from "./TradingChart";
import { TradingChart } from "./TradingChart";
import { GearIcon } from "./GearIcon";
import { IndicatorSettingsModal } from "./IndicatorSettingsModal";
import { ResultList } from "./ResultList";
import { SummaryOpinionPanel } from "./SummaryOpinionPanel";
import { StockCombobox, type StockOption } from "./StockCombobox";
import { AlertBanner } from "./AlertBanner";
import { AnalyzeLoadingPanel } from "./AnalyzeLoadingPanel";
import { ResultsOverview } from "./ResultsOverview";

type ParamsState = Record<IndicatorId, IndicatorParams>;

interface ChartPayload {
  daily: TimeframeChartData;
  weekly: TimeframeChartData;
  monthly: TimeframeChartData;
}

const DEFAULT_PARAMS: ParamsState = Object.fromEntries(
  INDICATOR_CATALOG.map((m) => [m.id, { ...m.defaultParams }]),
) as ParamsState;

export function ChartCheckApp() {
  const [stock, setStock] = useState<StockOption | null>(null);
  const [selected, setSelected] = useState<Set<IndicatorId>>(
    () => new Set(INDICATOR_CATALOG.filter((m) => m.enabled).map((m) => m.id)),
  );
  const [params, setParams] = useState<ParamsState>(DEFAULT_PARAMS);
  const [settingsFor, setSettingsFor] = useState<IndicatorId | null>(null);
  const [results, setResults] = useState<EvaluationResult[]>([]);
  const [chartData, setChartData] = useState<ChartPayload | null>(null);
  const [chartVisible, setChartVisible] = useState<Set<IndicatorId>>(
    () => new Set(),
  );
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [chartFailed, setChartFailed] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const settingsMeta = INDICATOR_CATALOG.find((m) => m.id === settingsFor);

  function toggle(id: IndicatorId) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function fetchCharts(
    code: string,
    yahooSymbol: string,
    indicatorPayload: { id: IndicatorId; params: IndicatorParams }[],
  ): Promise<boolean> {
    setChartLoading(true);
    try {
      const res = await fetch("/api/chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          yahooSymbol,
          indicators: indicatorPayload,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setChartData({
          daily: data.daily,
          weekly: data.weekly,
          monthly: data.monthly,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setChartLoading(false);
    }
  }

  async function analyze() {
    if (!stock) {
      setError("종목을 검색하여 선택해 주세요.");
      return;
    }
    if (selected.size === 0) {
      setError("지표를 하나 이상 선택해 주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setWarnings([]);
    setChartFailed(false);
    setResults([]);
    setChartData(null);

    const chartIndicatorPayload = INDICATOR_CATALOG.filter(
      (m) => m.enabled,
    ).map((m) => ({ id: m.id, params: params[m.id] }));
    const chartPromise = fetchCharts(
      stock.code,
      stock.yahooSymbol,
      chartIndicatorPayload,
    );

    let gotResults = false;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: stock.code,
          yahooSymbol: stock.yahooSymbol,
          indicators: [...selected].map((id) => ({
            id,
            params: params[id],
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "분석에 실패했습니다.");
        return;
      }
      const nextResults = data.results ?? [];
      setResults(nextResults);
      gotResults = nextResults.length > 0;
      if (data.errors?.length) {
        setWarnings(
          data.errors.map((e: { message: string }) => e.message),
        );
      }
    } catch {
      setError("네트워크 오류가 발생했습니다. 연결을 확인한 뒤 다시 시도해 주세요.");
    } finally {
      setLoading(false);
      const chartOk = await chartPromise;
      if (!chartOk) setChartFailed(true);
      if (gotResults) {
        requestAnimationFrame(() => {
          resultsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      }
    }
  }

  const showChart = chartData || chartLoading || chartFailed;

  return (
    <div className="safe-top safe-bottom mx-auto max-w-3xl space-y-5 px-4 py-6 sm:space-y-6 sm:px-5 sm:py-10">
      <header className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25">
            <LineChart className="h-5 w-5" strokeWidth={2.25} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              ChartCheck
            </h1>
            <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
              차트·뉴스·공시, 한곳에서
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-xl border border-sky-100/80 bg-sky-50/60 px-3 py-2.5 text-xs leading-relaxed text-sky-900/90 backdrop-blur-sm">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" aria-hidden />
          <span>투자 판단은 사용자 책임입니다. 본 서비스는 매매를 권유하지 않습니다.</span>
        </div>
      </header>

      <GlassCard className="relative z-40 overflow-visible">
        <StockCombobox value={stock} onChange={setStock} />
      </GlassCard>

      {!stock && results.length === 0 && !loading && (
        <GlassCard className="border-dashed border-sky-200/60 bg-sky-50/30">
          <p className="text-sm font-medium text-slate-800">시작하기</p>
          <ol className="mt-2 space-y-1.5 text-sm leading-relaxed text-slate-600">
            <li>1. 위에서 종목을 검색해 선택하세요.</li>
            <li>2. 분석할 지표를 고른 뒤 「분석 실행」을 누르세요.</li>
            <li>3. 차트·뉴스·공시를 함께 확인할 수 있습니다.</li>
          </ol>
        </GlassCard>
      )}

      <GlassCard>
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-indigo-600" aria-hidden />
          <h2 className="text-sm font-semibold text-slate-800">분석 지표</h2>
        </div>
        <ul className="space-y-2">
          {INDICATOR_CATALOG.map((meta) => {
            const isSelected = selected.has(meta.id);
            return (
              <li
                key={meta.id}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors",
                  meta.enabled
                    ? isSelected
                      ? "border-sky-200/80 bg-sky-50/50"
                      : "border-slate-200/80 bg-white/50 hover:border-slate-300"
                    : "border-slate-100 bg-slate-50/80",
                )}
              >
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    disabled={!meta.enabled}
                    checked={isSelected}
                    onChange={() => meta.enabled && toggle(meta.id)}
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      meta.enabled ? "text-slate-900" : "text-slate-400",
                    )}
                  >
                    {meta.name}
                  </span>
                  {!meta.enabled && (
                    <span className="text-xs text-slate-400">준비 중</span>
                  )}
                </label>

                {meta.enabled && isSelected && (
                  <button
                    type="button"
                    onClick={() => setSettingsFor(meta.id)}
                    className="flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-white/80 hover:text-slate-800"
                    aria-label={`${meta.name} 설정`}
                  >
                    <GearIcon />
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {error && (
          <AlertBanner
            variant="error"
            title="분석을 완료하지 못했습니다"
            className="mt-4"
            action={
              stock && selected.size > 0 ? (
                <button
                  type="button"
                  onClick={analyze}
                  disabled={loading}
                  className="rounded-lg border border-rose-300/80 bg-white px-3 py-1.5 text-sm font-medium text-rose-900 hover:bg-rose-50"
                >
                  다시 시도
                </button>
              ) : undefined
            }
          >
            {error}
          </AlertBanner>
        )}

        <div className="mt-5">
          <PrimaryButton onClick={analyze} disabled={loading} aria-busy={loading}>
            {loading ? "분석 중…" : "분석 실행"}
          </PrimaryButton>
        </div>
      </GlassCard>

      {loading && (
        <AnalyzeLoadingPanel chartPending={chartLoading} />
      )}

      {showChart && (
        <>
          {chartFailed && !chartLoading && !chartData && (
            <AlertBanner variant="warning" title="차트만 표시되지 않았습니다">
              지표 분석 결과는 아래에서 확인할 수 있습니다. 잠시 후 다시 「분석
              실행」을 눌러 주세요.
            </AlertBanner>
          )}
          {(chartData || chartLoading) && (
            <TradingChart
              data={chartData}
              loading={chartLoading}
              stockName={stock?.name}
              visibleOverlays={chartVisible}
              onVisibleOverlaysChange={setChartVisible}
            />
          )}
        </>
      )}

      {results.length > 0 && (
        <div ref={resultsRef} className="scroll-mt-6">
        <GlassCard>
          <h2 className="text-sm font-semibold text-slate-800">분석 결과</h2>
          <div className="mt-3">
            <ResultsOverview results={results} />
          </div>
          {warnings.length > 0 && (
            <AlertBanner variant="warning" title="일부 지표 참고" className="mb-4">
              <ul className="list-inside list-disc space-y-1">
                {warnings.map((msg) => (
                  <li key={msg}>{msg}</li>
                ))}
              </ul>
            </AlertBanner>
          )}
          <ResultList results={results} />
          <SummaryOpinionPanel
            results={results}
            stockCode={stock?.code ?? null}
            stockName={stock?.name ?? null}
          />
        </GlassCard>
        </div>
      )}

      {settingsMeta && settingsFor && (
        <IndicatorSettingsModal
          meta={settingsMeta}
          params={params[settingsFor]}
          open={!!settingsFor}
          onClose={() => setSettingsFor(null)}
          onChange={(p) =>
            setParams((prev) => ({ ...prev, [settingsFor]: p }))
          }
        />
      )}
    </div>
  );
}
