"use client";

import { cn } from "@/lib/cn";
import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export interface ExternalContentTarget {
  url: string;
  title: string;
}

interface Props {
  target: ExternalContentTarget | null;
  onClose: () => void;
}

function subscribeNoop() {
  return () => {};
}

function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

function embedSrc(url: string): string {
  return `/api/embed?url=${encodeURIComponent(url)}`;
}

function openExternalWindow(url: string) {
  const w = Math.min(960, window.screen.width - 80);
  const h = Math.min(720, window.screen.height - 80);
  const left = Math.round((window.screen.width - w) / 2);
  const top = Math.round((window.screen.height - h) / 2);
  const features = `width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes`;
  const win = window.open(url, "_blank", features);
  if (!win) {
    window.open(url, "_blank");
  }
}

export function ExternalContentModal({ target, onClose }: Props) {
  const isClient = useIsClient();
  if (!target || !isClient) return null;

  return createPortal(
    <ExternalContentModalBody
      key={target.url}
      target={target}
      onClose={onClose}
    />,
    document.body,
  );
}

function ExternalContentModalBody({
  target,
  onClose,
}: {
  target: ExternalContentTarget;
  onClose: () => void;
}) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [embeddable, setEmbeddable] = useState(true);
  const [resolving, setResolving] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/resolve-url?url=${encodeURIComponent(target.url)}`)
      .then((r) => r.json())
      .then((data: { url?: string; embeddable?: boolean }) => {
        if (cancelled) return;
        setResolvedUrl(data.url ?? target.url);
        setEmbeddable(data.embeddable !== false);
        if (data.embeddable === false) setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setResolvedUrl(target.url);
          setEmbeddable(false);
          setLoading(false);
        }
      })
      .finally(() => {
        if (!cancelled) setResolving(false);
      });

    return () => {
      cancelled = true;
    };
  }, [target]);

  useEffect(() => {
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
  }, [onClose]);

  const displayUrl = resolvedUrl ?? target.url;

  const openPopupWindow = useCallback(() => {
    if (!displayUrl) return;
    openExternalWindow(displayUrl);
  }, [displayUrl]);

  const showIframe = embeddable && !resolving && displayUrl;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="external-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]"
        aria-label="닫기"
        onClick={onClose}
      />

      <div
        className={cn(
          "safe-bottom relative flex w-full max-w-4xl flex-col overflow-hidden",
          "h-[min(88dvh,820px)] max-h-[88dvh]",
          "rounded-t-2xl border border-white/60 bg-white shadow-2xl",
          "sm:h-auto sm:max-h-[min(85vh,820px)] sm:rounded-2xl",
        )}
      >
        <div
          className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-slate-300 sm:hidden"
          aria-hidden
        />
        <header className="flex shrink-0 items-start gap-3 border-b border-slate-200/80 bg-slate-50 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p
              id="external-modal-title"
              className="truncate text-sm font-semibold text-zinc-900"
            >
              {target.title}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-zinc-500">
              {displayUrl || target.url}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={openPopupWindow}
              disabled={resolving || !displayUrl}
              className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              새 창
            </button>
            <button
              type="button"
              onClick={onClose}
              className="min-h-10 rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
            >
              닫기
            </button>
          </div>
        </header>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
          {resolving && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">
              원문 주소 확인 중…
            </div>
          )}

          {!resolving && !embeddable && (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <p className="text-sm text-zinc-700">
                Google 뉴스 중간 페이지는 앱 안에서 열 수 없습니다.
                <br />
                원문 사이트에서 기사를 봐 주세요.
              </p>
              <button
                type="button"
                onClick={openPopupWindow}
                className="min-h-11 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:from-sky-500 hover:to-indigo-500"
              >
                기사 열기 (새 창)
              </button>
              <p className="text-[11px] text-zinc-500">
                ChartCheck 화면은 그대로 유지됩니다.
              </p>
            </div>
          )}

          {showIframe && (
            <>
              {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white text-sm text-zinc-500">
                  불러오는 중…
                </div>
              )}
              <iframe
                key={displayUrl}
                title={target.title}
                src={embedSrc(displayUrl)}
                className="h-full w-full border-0"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"
                onLoad={() => setLoading(false)}
              />
            </>
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
  compact = false,
}: {
  href: string;
  title: string;
  className?: string;
  children: ReactNode;
  onOpen: (target: ExternalContentTarget) => void;
  /** 목록 한 줄 링크용 (기본: 터치 영역 넓은 블록) */
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen({ url: href, title })}
      className={
        compact
          ? `min-w-0 flex-1 cursor-pointer truncate py-0 text-left text-xs text-blue-700 hover:underline active:text-blue-900 ${className ?? ""}`
          : `inline-flex min-h-10 w-full cursor-pointer items-center py-1.5 text-left hover:underline active:text-blue-900 ${className ?? ""}`
      }
    >
      {children}
    </button>
  );
}
