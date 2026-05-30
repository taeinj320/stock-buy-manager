"use client";

import { Download, X } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

function shouldShowHint() {
  if (localStorage.getItem("chartcheck-install-dismissed") === "1") return false;
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone);
  if (standalone) return false;
  return window.matchMedia("(max-width: 640px)").matches;
}

export function InstallHint() {
  const isClient = useIsClient();
  const [dismissed, setDismissed] = useState(false);

  if (!isClient || dismissed || !shouldShowHint()) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 safe-bottom sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/95 p-4 shadow-lg backdrop-blur-xl">
        <Download className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden />
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-semibold text-slate-900">홈 화면에 추가</p>
          <p className="mt-0.5 text-slate-600">
            iPhone: 공유 → 홈 화면에 추가 · Android: 메뉴 → 앱 설치
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            localStorage.setItem("chartcheck-install-dismissed", "1");
          }}
          className="flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="닫기"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
