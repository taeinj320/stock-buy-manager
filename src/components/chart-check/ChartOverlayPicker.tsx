"use client";

import { INDICATOR_CATALOG } from "@/lib/evaluation/registry";
import type { IndicatorId } from "@/lib/evaluation/types";

const CHARTABLE = INDICATOR_CATALOG.filter((m) => m.enabled);

interface Props {
  visible: Set<IndicatorId>;
  onChange: (next: Set<IndicatorId>) => void;
}

export function ChartOverlayPicker({ visible, onChange }: Props) {
  function toggle(id: IndicatorId) {
    const next = new Set(visible);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  }

  return (
    <div className="mb-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3">
      <p className="mb-2 text-xs font-medium text-zinc-700">
        차트 표시 지표{" "}
        <span className="font-normal text-zinc-500">
          (분석 결과와 별도 · 선택한 것만 차트에 표시)
        </span>
      </p>
      {visible.has("ichimoku") && (
        <p className="mb-2 text-[10px] text-zinc-500">
          일목: 구름 초록=상승·빨강=하락 · 선행스팬 26봉 앞 · 후행스팬(보라 점선) 종가 26봉 뒤
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {CHARTABLE.map((meta) => (
          <label
            key={meta.id}
            className="flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs"
          >
            <input
              type="checkbox"
              checked={visible.has(meta.id)}
              onChange={() => toggle(meta.id)}
              className="rounded border-zinc-300"
            />
            {meta.name}
          </label>
        ))}
      </div>
    </div>
  );
}
