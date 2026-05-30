"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

export interface ExternalContentTarget {
  url: string;
  title: string;
}

interface Props {
  target: ExternalContentTarget | null;
  onClose: () => void;
}

function embedSrc(url: string): string {
  return `/api/embed?url=${encodeURIComponent(url)}`;
}

export function ExternalContentModal({ target, onClose }: Props) {
  const [loadFailed, setLoadFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoadFailed(false);
    setLoading(true);
  }, [target?.url]);

  useEffect(() => {
    if (!target) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [target, onClose]);

  const openPopupWindow = useCallback(() => {
    if (!target) return;
    const w = Math.min(960, window.screen.width - 80);
    const h = Math.min(720, window.screen.height - 80);
    const left = Math.round((window.screen.width - w) / 2);
    const top = Math.round((window.screen.height - h) / 2);
    window.open(
      target.url,
      "chartcheck-external",
      `popup=yes,width=${w},height=${h},left=${left},top=${top},noopener,noreferrer`,
    );
  }, [target]);

  if (!target) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="external-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/55 backdrop-blur-[2px]"
        aria-label="닫기"
        onClick={onClose}
      />

      <div className="relative flex max-h-[min(90vh,820px)] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl">
        <header className="flex shrink-0 items-start gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p
              id="external-modal-title"
              className="truncate text-sm font-semibold text-zinc-900"
            >
              {target.title}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-zinc-500">{target.url}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={openPopupWindow}
              className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100"
            >
              별도 창
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-zinc-900 px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-zinc-800"
            >
              닫기
            </button>
          </div>
        </header>

        <div className="relative min-h-[min(70vh,560px)] flex-1 bg-white">
          {loading && !loadFailed && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">
              불러오는 중…
            </div>
          )}

          {loadFailed ? (
            <div className="flex h-full min-h-[min(70vh,560px)] flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-sm text-zinc-700">
                이 페이지는 앱 안 미리보기를 지원하지 않습니다.
              </p>
              <button
                type="button"
                onClick={openPopupWindow}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                작은 창으로 열기
              </button>
              <p className="text-[11px] text-zinc-500">
                ChartCheck 화면은 그대로 유지됩니다.
              </p>
            </div>
          ) : (
            <iframe
              key={target.url}
              title={target.title}
              src={embedSrc(target.url)}
              className="h-full min-h-[min(70vh,560px)] w-full border-0"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setLoadFailed(true);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function PopupLink({
  href,
  title,
  className,
  children,
  onOpen,
}: {
  href: string;
  title: string;
  className?: string;
  children: ReactNode;
  onOpen: (target: ExternalContentTarget) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen({ url: href, title })}
      className={`cursor-pointer text-left hover:underline ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
