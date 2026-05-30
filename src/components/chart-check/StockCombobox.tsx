"use client";

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

  useEffect(() => {
    if (value) setQuery(value.name);
  }, [value]);

  return (
    <div className="relative">
      <label className="mb-1.5 block text-sm font-medium text-zinc-700">
        종목
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(null);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="삼성전자, SK하이닉스, 005930, ㅎㅇㄴㅅ"
        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none ring-blue-500 focus:ring-2"
      />
      <p className="mt-1 text-xs text-zinc-500">
        한글·영문·종목코드·초성(예: ㅎㅇㄴㅅ)으로 검색
      </p>

      {open && (items.length > 0 || loading) && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
          {loading && (
            <li className="px-3 py-2 text-sm text-zinc-500">검색 중…</li>
          )}
          {!loading &&
            items.map((item) => (
              <li key={item.code}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-50"
                  onClick={() => {
                    onChange(item);
                    setQuery(item.name);
                    setOpen(false);
                  }}
                >
                  <span className="font-medium">{item.name}</span>
                  <span className="ml-2 text-zinc-500">
                    {item.code} · {item.market}
                  </span>
                </button>
              </li>
            ))}
          {!loading && items.length === 0 && query.trim().length > 0 && (
            <li className="px-3 py-2 text-sm text-zinc-500">
              검색 결과가 없습니다. npm run sync:krx 실행 여부를 확인하세요.
            </li>
          )}
        </ul>
      )}

      {value && (
        <p className="mt-2 text-sm text-zinc-600">
          선택됨: <strong>{value.name}</strong> ({value.yahooSymbol})
        </p>
      )}
    </div>
  );
}
