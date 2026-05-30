import type { StatusTier } from "@/lib/evaluation/types";

const STYLES: Record<StatusTier, string> = {
  ok: "bg-emerald-100 text-emerald-800 border-emerald-200",
  caution: "bg-amber-100 text-amber-900 border-amber-200",
  unsuitable: "bg-red-100 text-red-800 border-red-200",
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
      className={`inline-flex shrink-0 items-center rounded-md border px-2.5 py-0.5 text-sm font-medium ${STYLES[tier]}`}
    >
      {label}
    </span>
  );
}
