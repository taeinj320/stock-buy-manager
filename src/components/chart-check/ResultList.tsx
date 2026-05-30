import type { EvaluationResult } from "@/lib/evaluation/types";
import { StatusBadge } from "./StatusBadge";

export function ResultList({ results }: { results: EvaluationResult[] }) {
  return (
    <ul className="space-y-4">
      {results.map((r) => (
        <li
          key={r.indicatorId}
          className="border-b border-zinc-100 pb-4 last:border-0 last:pb-0"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-base font-semibold text-zinc-900">
              {r.name}
            </span>
            <StatusBadge label={r.label} tier={r.tier} />
          </div>
          <p className="mt-1 text-sm text-zinc-700">
            현재값:{" "}
            <span className="font-mono font-medium">{r.valueDisplay}</span>
          </p>
          <p className="mt-1 text-sm text-zinc-600">{r.summary}</p>
          {r.trendNote && (
            <p className="mt-2 text-xs text-zinc-500">{r.trendNote}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
