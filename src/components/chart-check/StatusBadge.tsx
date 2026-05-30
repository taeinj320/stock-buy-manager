import type { StatusTier } from "@/lib/evaluation/types";

const STYLES: Record<StatusTier, string> = {
  ok: "bg-emerald-50/90 text-emerald-800 border-emerald-200/80 backdrop-blur-sm",
  caution: "bg-amber-50/90 text-amber-900 border-amber-200/80 backdrop-blur-sm",
  unsuitable: "bg-rose-50/90 text-rose-800 border-rose-200/80 backdrop-blur-sm",
};

export function StatusBadge({
  label,
  tier,
}: {
  label: string;
  tier: StatusTier;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold sm:text-sm ${STYLES[tier]}`}
    >
      {label}
    </span>
  );
}
