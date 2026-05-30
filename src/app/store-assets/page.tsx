import type { Metadata } from "next";
import Link from "next/link";
import { readFileSync, existsSync } from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "스토어 에셋 다운로드 · ChartCheck",
  robots: { index: false },
};

const ASSETS = [
  {
    file: "app-logo.png",
    label: "앱 로고",
    size: "600 × 600",
    required: true,
  },
  {
    file: "app-logo-dark.png",
    label: "다크 모드 앱 로고",
    size: "600 × 600",
    required: false,
  },
  {
    file: "thumbnail.png",
    label: "썸네일",
    size: "1932 × 828",
    required: true,
  },
  {
    file: "screenshot-portrait-1.png",
    label: "스크린샷 (세로) 1 — 종목 검색",
    size: "636 × 1048",
    required: true,
  },
  {
    file: "screenshot-portrait-2.png",
    label: "스크린샷 (세로) 2 — 분석 결과",
    size: "636 × 1048",
    required: true,
  },
  {
    file: "screenshot-portrait-3.png",
    label: "스크린샷 (세로) 3 — 차트",
    size: "636 × 1048",
    required: true,
  },
  {
    file: "screenshot-landscape-1.png",
    label: "스크린샷 (가로) 1 — 전체 기능",
    size: "1504 × 741",
    required: true,
  },
] as const;

function getManifest() {
  const p = path.join(process.cwd(), "public", "store-assets", "manifest.json");
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as {
      generatedAt: string;
      assets: { file: string; bytes: number }[];
    };
  } catch {
    return null;
  }
}

export default function StoreAssetsPage() {
  const manifest = getManifest();
  const bytesByFile = new Map(
    manifest?.assets.map((a) => [a.file, a.bytes]) ?? [],
  );

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-sky-50/50 to-indigo-50/40 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="text-sm font-medium text-sky-700 hover:text-sky-800"
        >
          ← ChartCheck 홈
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          스토어 제출용 이미지
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          앱 마켓 등록 폼에 바로 올릴 수 있는 규격입니다. 각 항목에서
          다운로드하거나, 터미널에서{" "}
          <code className="rounded bg-white/80 px-1.5 py-0.5 text-xs">
            npm run store-assets
          </code>
          로 재생성할 수 있습니다.
        </p>
        {manifest?.generatedAt && (
          <p className="mt-1 text-xs text-slate-500">
            생성 시각: {new Date(manifest.generatedAt).toLocaleString("ko-KR")}
          </p>
        )}

        <a
          href="/chartcheck-store-assets.zip"
          download="chartcheck-store-assets.zip"
          className="mt-6 inline-flex min-h-11 items-center rounded-xl border border-sky-200 bg-white/90 px-5 py-2.5 text-sm font-semibold text-sky-800 shadow-sm hover:bg-sky-50"
        >
          전체 ZIP 한 번에 다운로드
        </a>

        <ul className="mt-8 space-y-4">
          {ASSETS.map((item) => (
            <li
              key={item.file}
              className="overflow-hidden rounded-2xl border border-white/70 bg-white/85 shadow-sm backdrop-blur-xl"
            >
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="flex shrink-0 items-center justify-center rounded-xl bg-slate-100/80 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/store-assets/${item.file}`}
                    alt={item.label}
                    className="max-h-28 max-w-[140px] object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-900">
                      {item.label}
                    </h2>
                    {item.required ? (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
                        필수
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        선택
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">{item.size}px</p>
                  {bytesByFile.has(item.file) && (
                    <p className="text-xs text-slate-400">
                      {Math.round((bytesByFile.get(item.file)! / 1024) * 10) / 10}{" "}
                      KB
                    </p>
                  )}
                  <a
                    href={`/store-assets/${item.file}`}
                    download={item.file}
                    className="mt-3 inline-flex min-h-10 items-center rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-sky-500 hover:to-indigo-500"
                  >
                    PNG 다운로드
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-xs leading-relaxed text-slate-500">
          실제 앱 화면 캡처로 교체하려면 프로덕션에서 분석 실행 후 스크린샷을
          동일 규격으로 리사이즈해 업로드하는 것을 권장합니다. 위 이미지는
          브랜드 톤에 맞춘 제출용 목업입니다.
        </p>
      </div>
    </div>
  );
}
