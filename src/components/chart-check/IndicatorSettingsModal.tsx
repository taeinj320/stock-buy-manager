"use client";

import type { IndicatorMeta } from "@/lib/evaluation/registry";
import type { IndicatorParams } from "@/lib/evaluation/types";

interface Props {
  meta: IndicatorMeta;
  params: IndicatorParams;
  open: boolean;
  onClose: () => void;
  onChange: (p: IndicatorParams) => void;
}

export function IndicatorSettingsModal({
  meta,
  params,
  open,
  onClose,
  onChange,
}: Props) {
  if (!open) return null;

  const num = (key: keyof IndicatorParams, label: string, def: number) => (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-zinc-600">{label}</span>
      <input
        type="number"
        value={params[key] ?? def}
        onChange={(e) =>
          onChange({ ...params, [key]: Number(e.target.value) })
        }
        className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-sky-500"
      />
    </label>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="safe-bottom w-full max-w-sm rounded-t-2xl border border-white/60 bg-white/95 p-5 shadow-2xl backdrop-blur-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="settings-title"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 id="settings-title" className="text-lg font-semibold text-zinc-900">
            {meta.name} 설정
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-10 min-w-10 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-4">
          {meta.id === "rsi" && num("period", "기간", 14)}
          {meta.id === "mfi" && num("period", "기간", 14)}
          {meta.id === "stochastic" && (
            <>
              {num("kPeriod", "K 기간", 14)}
              {num("dPeriod", "D 기간", 3)}
            </>
          )}
          {meta.id === "macd" && (
            <>
              {num("fast", "Fast", 12)}
              {num("slow", "Slow", 26)}
              {num("signal", "Signal", 9)}
            </>
          )}
          {meta.id === "bollinger" && (
            <>
              {num("period", "기간", 20)}
              {num("stdDev", "표준편차", 2)}
            </>
          )}
          {meta.id === "ichimoku" && (
            <>
              {num("tenkanPeriod", "전환선 기간", 9)}
              {num("kijunPeriod", "기준선 기간", 26)}
              {num("senkouBPeriod", "선행스팬 B 기간", 52)}
              {num("displacement", "선행스팬 이동(봉)", 26)}
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 min-h-11 w-full rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md hover:from-sky-500 hover:to-indigo-500"
        >
          확인
        </button>
      </div>
    </div>
  );
}
