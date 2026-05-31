"use client";

import { Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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

type MenuRect = { top: number; left: number; width: number };

function measureMenu(el: HTMLDivElement | null): MenuRect | null {
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    top: rect.bottom + 6,
    left: rect.left,
    width: rect.width,
  };
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
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(value?.name ?? "");
  const [items, setItems] = useState<StockOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [, setLayoutTick] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bumpLayout = useCallback(() => {
    setLayoutTick((n) => n + 1);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 1) {
      setItems([]);
      setSearchError(null);
      return;
    }
    setLoading(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) {
        setItems([]);
        setSearchError(data.error ?? "검색에 실패했습니다.");
        return;
      }
      setItems(data.items ?? []);
    } catch {
      setItems([]);
      setSearchError("검색에 실패했습니다. 잠시 후 다시 시도해 주세요.");
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
    if (!open) return;
    bumpLayout();
    window.addEventListener("resize", bumpLayout);
    window.addEventListener("scroll", bumpLayout, true);
    return () => {
      window.removeEventListener("resize", bumpLayout);
      window.removeEventListener("scroll", bumpLayout, true);
    };
  }, [open, bumpLayout, items.length, loading, searchError]);

  const showDropdown = open && query.trim().length > 0;
  const menuRect = showDropdown ? measureMenu(inputWrapRef.current) : null;

  const dropdown =
    typeof document !== "undefined" &&
    menuRect &&
    createPortal(
      <ul
        className="fixed z-[300] max-h-[min(16rem,40dvh)] overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-2xl ring-1 ring-slate-900/10"
        style={{
          top: menuRect.top,
          left: menuRect.left,
          width: menuRect.width,
        }}
        role="listbox"
        onMouseDown={(e) => e.preventDefault()}
      >
        {loading && (
          <li className="px-3 py-3 text-sm text-slate-500">검색 중…</li>
        )}
        {searchError && !loading && (
          <li className="px-3 py-3 text-sm text-rose-600" role="alert">
            {searchError}
          </li>
        )}
        {!loading &&
          !searchError &&
          items.map((item) => (
            <li key={item.code}>
              <button
                type="button"
                className="flex min-h-11 w-full flex-col px-3 py-2.5 text-left text-sm transition hover:bg-sky-50 active:bg-sky-100 sm:flex-row sm:items-center"
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
        {!loading && !searchError && items.length === 0 && (
          <li className="px-3 py-3 text-sm text-slate-500">
            검색 결과가 없습니다.
          </li>
        )}
      </ul>,
      document.body,
    );

  return (
    <div className="relative">
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        종목 검색
      </label>
      <div className="relative" ref={inputWrapRef}>
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
            window.setTimeout(() => setOpen(false), 200);
          }}
          placeholder="삼성전자, SK하이닉스, 005930, ㅎㅇㄴㅅ"
          className="min-h-11 w-full rounded-xl border border-slate-200/80 bg-white py-2.5 pl-10 pr-3 text-base text-slate-900 shadow-sm outline-none ring-sky-500/30 placeholder:text-slate-400 focus:ring-2 sm:text-sm"
        />
      </div>
      <p className="mt-1.5 text-xs text-slate-500">
        한글·영문·종목코드·초성(예: ㅎㅇㄴㅅ)으로 검색
      </p>

      {dropdown}

      {value && (
        <p className="mt-3 rounded-lg border border-sky-100 bg-sky-50/60 px-3 py-2 text-sm text-sky-900">
          선택됨: <strong>{value.name}</strong>{" "}
          <span className="text-sky-700/80">({value.yahooSymbol})</span>
        </p>
      )}
    </div>
  );
}
