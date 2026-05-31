import type { EvaluationResult, StatusTier } from "@/lib/evaluation/types";
import { cn } from "@/lib/cn";
import { IndicatorGuide } from "./IndicatorGuide";
import { sortResultsByPriority } from "./ResultsOverview";
import { StatusBadge } from "./StatusBadge";

const TIER_BORDER: Record<StatusTier, string> = {
  ok: "border-l-emerald-500",
  caution: "border-l-amber-500",
  unsuitable: "border-l-rose-500",
};

export function ResultList({ results }: { results: EvaluationResult[] }) {
  const sorted = sortResultsByPriority(results);

  return (
    <ul className="space-y-3">
      {sorted.map((r) => (
        <li
          key={r.indicatorId}
          className={cn(
            "rounded-xl border border-slate-100/80 border-l-4 bg-slate-50/40 p-4",
            TIER_BORDER[r.tier],
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <span className="text-base font-semibold leading-snug text-slate-900">
              {r.name}
            </span>
            <StatusBadge label={r.label} tier={r.tier} />
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            <span className="font-medium text-slate-800">현재값</span>{" "}
            <span className="font-mono tabular-nums">{r.valueDisplay}</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {r.summary}
          </p>
          {r.trendNote && (
            <p className="mt-2 rounded-md bg-white/60 px-2 py-1.5 text-xs leading-relaxed text-slate-500">
              {r.trendNote}
            </p>
          )}
          <IndicatorGuide indicatorId={r.indicatorId} />
        </li>
      ))}
    </ul>
  );
}
