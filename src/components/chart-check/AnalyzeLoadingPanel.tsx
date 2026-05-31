import { GlassCard } from "@/components/ui/glass-card";
import { Loader2 } from "lucide-react";

export function AnalyzeLoadingPanel({
  chartPending,
}: {
  chartPending: boolean;
}) {
  return (
    <GlassCard aria-busy="true" aria-label="분석 진행 중">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
        <Loader2 className="h-4 w-4 animate-spin text-sky-600" aria-hidden />
        분석을 진행하고 있습니다
      </div>
      <ol className="mt-3 space-y-2 text-sm text-slate-600">
        <li className="flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full bg-sky-500"
            aria-hidden
          />
          선택한 지표 계산 중…
        </li>
        <li
          className={`flex items-center gap-2 ${chartPending ? "text-slate-800" : "text-slate-400"}`}
        >
          <span
            className={cnDot(chartPending)}
            aria-hidden
          />
          {chartPending ? "차트 데이터 불러오는 중…" : "차트는 분석 직후 표시됩니다"}
        </li>
      </ol>

      <div className="mt-4 space-y-3" aria-hidden>
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-slate-100 bg-slate-50/80 p-4"
          >
            <div className="flex justify-between gap-2">
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="h-6 w-16 rounded-full bg-slate-200" />
            </div>
            <div className="mt-3 h-3 w-full rounded bg-slate-100" />
            <div className="mt-2 h-3 w-4/5 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function cnDot(active: boolean) {
  return `h-2 w-2 shrink-0 rounded-full ${active ? "bg-sky-500" : "bg-slate-300"}`;
}
