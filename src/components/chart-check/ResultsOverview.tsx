import type { EvaluationResult, StatusTier } from "@/lib/evaluation/types";

const TIER_META: Record<
  StatusTier,
  { label: string; chip: string; dot: string }
> = {
  ok: {
    label: "양호",
    chip: "border-emerald-200/80 bg-emerald-50/90 text-emerald-900",
    dot: "bg-emerald-500",
  },
  caution: {
    label: "주의",
    chip: "border-amber-200/80 bg-amber-50/90 text-amber-950",
    dot: "bg-amber-500",
  },
  unsuitable: {
    label: "부적합",
    chip: "border-rose-200/80 bg-rose-50/90 text-rose-900",
    dot: "bg-rose-500",
  },
};

const TIER_ORDER: StatusTier[] = ["unsuitable", "caution", "ok"];

export function ResultsOverview({ results }: { results: EvaluationResult[] }) {
  const counts = TIER_ORDER.map((tier) => ({
    tier,
    count: results.filter((r) => r.tier === tier).length,
  })).filter((row) => row.count > 0);

  if (counts.length === 0) return null;

  return (
    <div
      className="mb-4 flex flex-wrap gap-2"
      aria-label="지표 상태 요약"
    >
      {counts.map(({ tier, count }) => {
        const meta = TIER_META[tier];
        return (
          <span
            key={tier}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${meta.chip}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden />
            {meta.label} {count}
          </span>
        );
      })}
      <span className="self-center text-xs text-slate-500">
        총 {results.length}개 지표 · 주의·부적합 항목을 먼저 표시합니다
      </span>
    </div>
  );
}

export function sortResultsByPriority(
  results: EvaluationResult[],
): EvaluationResult[] {
  const rank: Record<StatusTier, number> = {
    unsuitable: 0,
    caution: 1,
    ok: 2,
  };
  return [...results].sort(
    (a, b) =>
      rank[a.tier] - rank[b.tier] ||
      a.name.localeCompare(b.name, "ko"),
  );
}
