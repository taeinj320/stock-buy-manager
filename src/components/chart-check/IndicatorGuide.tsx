import { getIndicatorGuide } from "@/lib/evaluation/indicator-guides.ko";
import type { IndicatorId } from "@/lib/evaluation/types";

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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

export function IndicatorGuide({ indicatorId }: { indicatorId: IndicatorId }) {
  const lines = getIndicatorGuide(indicatorId);

  return (
    <details className="group mt-3">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-700 [&::-webkit-details-marker]:hidden">
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
        <span>이 지표가 의미하는 것</span>
      </summary>
      <div className="relative mt-2 pl-5">
        <span
          className="absolute left-1.5 top-0 text-zinc-300"
          aria-hidden
        >
          ↓
        </span>
        <ul className="space-y-1.5 border-l-2 border-zinc-200 pl-3 text-xs leading-relaxed text-zinc-600">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </details>
  );
}
