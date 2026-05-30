"use client";

import { useState } from "react";
import { INDICATOR_CATALOG } from "@/lib/evaluation/registry";
import type { IndicatorId, IndicatorParams } from "@/lib/evaluation/types";
import type { EvaluationResult } from "@/lib/evaluation/types";
import type { TimeframeChartData } from "./TradingChart";
import { TradingChart } from "./TradingChart";
import { GearIcon } from "./GearIcon";
import { IndicatorSettingsModal } from "./IndicatorSettingsModal";
import { ResultList } from "./ResultList";
import { SummaryOpinionPanel } from "./SummaryOpinionPanel";
import { StockCombobox, type StockOption } from "./StockCombobox";

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
  ) {
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
      }
    } catch {
      /* 차트 실패는 분석 결과와 분리 */
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
      setResults(data.results ?? []);
      if (data.errors?.length) {
        setError(
          data.errors.map((e: { message: string }) => e.message).join(" "),
        );
      }
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      await chartPromise;
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <header className="space-y-1 border-b border-zinc-200 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          ChartCheck
        </h1>
        <p className="text-sm text-zinc-600">
          지표별 독립 분석 · 매수/매도 추천 없음 · 투자 판단은 사용자 책임
        </p>
      </header>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <StockCombobox value={stock} onChange={setStock} />
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-zinc-800">분석 지표</h2>
        <ul className="space-y-2">
          {INDICATOR_CATALOG.map((meta) => {
            const isSelected = selected.has(meta.id);
            return (
              <li
                key={meta.id}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 ${
                  meta.enabled
                    ? "border-zinc-200 bg-white"
                    : "border-zinc-100 bg-zinc-50"
                }`}
              >
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    disabled={!meta.enabled}
                    checked={isSelected}
                    onChange={() => meta.enabled && toggle(meta.id)}
                    className="rounded border-zinc-300"
                  />
                  <span
                    className={`text-sm font-medium ${
                      meta.enabled ? "text-zinc-900" : "text-zinc-400"
                    }`}
                  >
                    {meta.name}
                  </span>
                  {!meta.enabled && (
                    <span className="text-xs text-zinc-400">준비 중</span>
                  )}
                </label>

                {meta.enabled && isSelected && (
                  <button
                    type="button"
                    onClick={() => setSettingsFor(meta.id)}
                    className="shrink-0 rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
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
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={analyze}
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "분석 중…" : "분석 실행"}
        </button>
      </section>

      {(chartData || chartLoading) && (
        <TradingChart
          data={chartData}
          loading={chartLoading}
          stockName={stock?.name}
          visibleOverlays={chartVisible}
          onVisibleOverlaysChange={setChartVisible}
        />
      )}

      {results.length > 0 && (
        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-zinc-800">분석 결과</h2>
          <ResultList results={results} />
          <SummaryOpinionPanel
            results={results}
            stockCode={stock?.code ?? null}
            stockName={stock?.name ?? null}
          />
        </section>
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
