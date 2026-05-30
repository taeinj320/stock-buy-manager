"use client";

import { Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export interface StockOption {
  code: string;
  name: string;
  market: string;
  yahooSymbol: string;
}

interface Props {
  value: StockOption | null;
  onChange: (stock: StockOption | null) => void;
}

export function StockCombobox({ value, onChange }: Props) {
  return (
    <StockComboboxInner
      key={value?.code ?? "__none__"}
      value={value}
      onChange={onChange}
    />
  );
}

function StockComboboxInner({ value, onChange }: Props) {
  const [query, setQuery] = useState(value?.name ?? "");
  const [items, setItems] = useState<StockOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 1) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  return (
    <div className="relative">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        종목 검색
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 150);
          }}
          placeholder="삼성전자, SK하이닉스, 005930, ㅎㅇㄴㅅ"
          className="min-h-11 w-full rounded-xl border border-slate-200/80 bg-white/90 py-2.5 pl-10 pr-3 text-base text-slate-900 shadow-sm outline-none ring-sky-500/30 placeholder:text-slate-400 focus:ring-2 sm:text-sm"
        />
      </div>
      <p className="mt-1.5 text-xs text-slate-500">
        한글·영문·종목코드·초성(예: ㅎㅇㄴㅅ)으로 검색
      </p>

      {open && (items.length > 0 || loading) && (
        <ul className="absolute z-20 mt-2 max-h-[min(16rem,40dvh)] w-full overflow-auto rounded-xl border border-slate-200/80 bg-white/95 py-1 shadow-xl backdrop-blur-xl">
          {loading && (
            <li className="px-3 py-3 text-sm text-slate-500">검색 중…</li>
          )}
          {!loading &&
            items.map((item) => (
              <li key={item.code}>
                <button
                  type="button"
                  className="flex min-h-11 w-full flex-col px-3 py-2.5 text-left text-sm transition hover:bg-sky-50/80 active:bg-sky-100/80 sm:flex-row sm:items-center"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(item);
                    setQuery(item.name);
                    setOpen(false);
                  }}
                >
                  <span className="font-medium text-slate-900">{item.name}</span>
                  <span className="text-slate-500 sm:ml-2">
                    {item.code} · {item.market}
                  </span>
                </button>
              </li>
            ))}
          {!loading && items.length === 0 && query.trim().length > 0 && (
            <li className="px-3 py-3 text-sm text-slate-500">
              검색 결과가 없습니다.
            </li>
          )}
        </ul>
      )}

      {value && (
        <p className="mt-3 rounded-lg border border-sky-100 bg-sky-50/60 px-3 py-2 text-sm text-sky-900">
          선택됨: <strong>{value.name}</strong>{" "}
          <span className="text-sky-700/80">({value.yahooSymbol})</span>
        </p>
      )}
    </div>
  );
}
