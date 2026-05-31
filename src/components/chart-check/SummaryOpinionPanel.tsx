"use client";

import { useEffect, useState, type ReactNode } from "react";
import { buildSummaryOpinion } from "@/lib/evaluation/summary-opinion";
import type { EvaluationResult } from "@/lib/evaluation/types";
import type { StockInsights } from "@/lib/insights/types";
import {
  ExternalContentModal,
  PopupLink,
  type ExternalContentTarget,
} from "./ExternalContentModal";

function ChevronDown() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-zinc-500 transition-transform group-open:rotate-180"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function BiasBadge({
  dominant,
}: {
  dominant: "buy" | "sell" | "mixed" | "neutral";
}) {
  const styles = {
    buy: "bg-emerald-100 text-emerald-900 border-emerald-200",
    sell: "bg-rose-100 text-rose-900 border-rose-200",
    mixed: "bg-amber-100 text-amber-900 border-amber-200",
    neutral: "bg-zinc-100 text-zinc-800 border-zinc-200",
  };
  const labels = {
    buy: "기술 신호: 매수 쪽 다소 우세",
    sell: "기술 신호: 매도 쪽 다소 우세",
    mixed: "기술 신호: 혼조",
    neutral: "기술 신호: 중립",
  };
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[dominant]}`}
    >
      {labels[dominant]}
    </span>
  );
}

export function SummaryOpinionPanel({
  results,
  stockCode,
  stockName,
}: {
  results: EvaluationResult[];
  stockCode: string | null;
  stockName: string | null;
}) {
  const opinion = buildSummaryOpinion(results);
  const [externalView, setExternalView] = useState<ExternalContentTarget | null>(
    null,
  );
  const showInsights = Boolean(stockCode && stockName && results.length > 0);

  const bias = opinion.technicalBias;

  return (
    <>
    <ExternalContentModal
      target={externalView}
      onClose={() => setExternalView(null)}
    />
    <div className="mt-6 space-y-4 border-t border-slate-200/80 pt-4">
      <details className="group" open>
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 py-2 hover:bg-zinc-50 active:bg-zinc-100/80 [&::-webkit-details-marker]:hidden">
          <div>
            <span className="text-sm font-semibold text-zinc-800">종합의견</span>
            <p className="mt-0.5 text-xs text-zinc-500">
              기술 지표 요약 (매매 권유 아님) · 접어서 숨길 수 있습니다
            </p>
          </div>
          <ChevronDown />
        </summary>

        <div className="mt-3 rounded-xl border border-amber-100/80 bg-amber-50/70 px-4 py-4 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-zinc-900">{opinion.headline}</p>
            <BiasBadge dominant={bias.dominant} />
          </div>

          <div className="mt-3 rounded-md border border-zinc-200/80 bg-white/70 px-3 py-2 text-xs text-zinc-700">
            <p className="font-medium text-zinc-800">선택 지표 기술 방향 (참고)</p>
            <p className="mt-1">
              매수 쪽 해석 {bias.buyLeaning} · 매도 쪽 해석 {bias.sellLeaning} · 중립{" "}
              {bias.neutral}
            </p>
            <p className="mt-1 text-zinc-600">{bias.explanation}</p>
            <p className="mt-2 text-[11px] text-rose-700/90">
              최종 매수·매도 여부는 투자자 본인이 결정합니다. 본 서비스는 매매·투자를
              권유하지 않습니다.
            </p>
          </div>

          <ul className="mt-3 space-y-2">
            {opinion.lines.map((line) => (
              <li key={line} className="text-sm leading-relaxed text-zinc-700">
                {line}
              </li>
            ))}
          </ul>

          {opinion.breakdown.length > 0 && (
            <div className="mt-4 border-t border-amber-200/60 pt-3">
              <p className="mb-2 text-xs font-medium text-zinc-600">
                지표별 상태 요약
              </p>
              <ul className="space-y-1.5">
                {opinion.breakdown.map((row) => (
                  <li
                    key={row.name}
                    className="flex justify-between gap-2 text-xs text-zinc-700"
                  >
                    <span>{row.name}</span>
                    <span className="shrink-0 font-medium text-zinc-900">
                      {row.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </details>

      <section className="space-y-3" aria-label="뉴스·공시·리서치">
        <h3 className="text-sm font-semibold text-zinc-800">뉴스 · 공시 · 리서치</h3>

        {!showInsights && (
          <p className="text-xs text-zinc-500">
            분석 후 자동으로 조회됩니다.
          </p>
        )}

        {showInsights && stockCode && stockName && (
          <StockInsightsFeed
            key={`${stockCode}-${stockName}`}
            stockCode={stockCode}
            stockName={stockName}
            onOpenExternal={setExternalView}
          />
        )}
      </section>
    </div>
    </>
  );
}

function StockInsightsFeed({
  stockCode,
  stockName,
  onOpenExternal,
}: {
  stockCode: string;
  stockName: string;
  onOpenExternal: (target: ExternalContentTarget) => void;
}) {
  const [insights, setInsights] = useState<StockInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: stockCode, name: stockName }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && !data.error) setInsights(data as StockInsights);
      })
      .catch(() => {
        if (!cancelled) setInsights(null);
      })
      .finally(() => {
        if (!cancelled) setInsightsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [stockCode, stockName]);

  if (insightsLoading) {
    return (
      <div className="space-y-2" aria-busy="true" aria-label="뉴스 불러오는 중">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-lg border border-zinc-200/80 bg-zinc-100/80"
          />
        ))}
      </div>
    );
  }

  if (!insights) {
    return (
      <p className="text-xs text-zinc-500">
        뉴스·공시를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <InsightSection title="한국경제·매일경제 최근 언급">
        {insights.news.length === 0 ? (
          <p className="text-xs text-zinc-600">
            {insights.meta.newsNote ?? "관련 기사 없음"}
          </p>
        ) : (
          <ul className="space-y-2">
            {insights.news.map((n) => (
              <li key={n.link} className="border-b border-zinc-100 pb-2 last:border-0 last:pb-0">
                <span className="mr-1.5 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600">
                  {n.source}
                </span>
                <PopupLink
                  href={n.link}
                  title={n.title}
                  onOpen={onOpenExternal}
                  className="text-sm text-blue-700 sm:text-xs"
                >
                  {n.title}
                </PopupLink>
                      {n.pubDate && (
                        <span className="mt-0.5 block text-[10px] text-zinc-400">
                          {n.pubDate}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </InsightSection>

            <InsightSection title="최근 공시 (DART, 90일)">
              {insights.disclosures.length === 0 ? (
                <p className="text-xs text-zinc-600">
                  {insights.meta.dartNote ?? "공시 없음"}
                </p>
              ) : (
                <ul className="space-y-2">
                  {insights.disclosures.map((d) => (
                    <li key={d.link} className="border-b border-zinc-100 pb-2 last:border-0 last:pb-0">
                      <PopupLink
                        href={d.link}
                        title={d.reportNm}
                        onOpen={onOpenExternal}
                        className="text-sm font-medium text-blue-700 sm:text-xs"
                      >
                        {d.reportNm}
                      </PopupLink>
                      <span className="ml-1 text-zinc-500">({d.rceptDt})</span>
                    </li>
                  ))}
                </ul>
              )}
            </InsightSection>

            <InsightSection title="증권 리포트·컨센서스 (네이버 금융)">
              {insights.research.available ? (
                <div className="space-y-2 text-xs text-zinc-700">
                  {insights.research.consensusLabel && (
                    <p>
                      <span className="font-medium">컨센서스 투자의견: </span>
                      {insights.research.consensusScore != null && (
                        <span>{insights.research.consensusScore} · </span>
                      )}
                      <span className="font-semibold text-zinc-900">
                        {insights.research.consensusLabel}
                      </span>
                      {insights.research.targetPrice != null && (
                        <span className="text-zinc-600">
                          {" "}
                          · 목표주가 약{" "}
                          {insights.research.targetPrice.toLocaleString("ko-KR")}
                          원
                        </span>
                      )}
                    </p>
                  )}
                  {insights.research.recentReports.length > 0 && (
                    <div>
                      <p className="mb-1 font-medium text-zinc-800">최근 리포트</p>
                      <ul className="space-y-1.5">
                        {insights.research.recentReports.map((r) => (
                          <li key={r.link + r.date} className="border-b border-zinc-100 pb-2 last:border-0 last:pb-0">
                            <PopupLink
                              href={r.link}
                              title={r.title}
                              onOpen={onOpenExternal}
                              className="text-sm text-blue-700 sm:text-xs"
                            >
                              {r.title}
                            </PopupLink>
                            <span className="text-zinc-500">
                              {" "}
                              · {r.broker} · {r.date}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {insights.meta.researchNote && (
                    <p className="text-[10px] text-zinc-500">
                      {insights.meta.researchNote}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-zinc-600">
                  {insights.meta.researchNote ?? "리서치 정보 없음"}
                </p>
              )}
      </InsightSection>
    </div>
  );
}

function InsightSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 px-4 py-3.5">
      <h4 className="text-xs font-semibold text-zinc-800">{title}</h4>
      <div className="mt-2">{children}</div>
    </div>
  );
}
