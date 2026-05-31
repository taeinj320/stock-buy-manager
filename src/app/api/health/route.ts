import { NextResponse } from "next/server";
import { readFileSync, existsSync, statSync } from "fs";
import path from "path";
import { findByCode } from "@/lib/stocks/universe";

export const dynamic = "force-dynamic";

type CheckStatus = "ok" | "warn" | "fail";

function checkJsonFile(relPath: string, minBytes = 1000) {
  const full = path.join(process.cwd(), relPath);
  if (!existsSync(full)) {
    return { status: "fail" as CheckStatus, message: "파일 없음" };
  }
  const size = statSync(full).size;
  if (size < minBytes) {
    return {
      status: "warn" as CheckStatus,
      message: `용량 작음 (${size} bytes)`,
    };
  }
  try {
    const data = JSON.parse(readFileSync(full, "utf8")) as
      | unknown[]
      | { count?: number; items?: unknown[] };
    const count = Array.isArray(data)
      ? data.length
      : (data.count ?? data.items?.length ?? 0);
    return { status: "ok" as CheckStatus, message: `${count} entries` };
  } catch {
    return { status: "fail" as CheckStatus, message: "JSON 파싱 실패" };
  }
}

async function checkYahoo() {
  try {
    const entry = findByCode("005930");
    if (!entry) {
      return { status: "warn" as CheckStatus, message: "종목 마스터 없음" };
    }
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(entry.yahooSymbol)}?interval=1d&range=5d`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "ChartCheck/1.0" },
    });
    if (!res.ok) {
      return {
        status: "warn" as CheckStatus,
        message: `Yahoo HTTP ${res.status} (일시적일 수 있음)`,
      };
    }
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result?.timestamp?.length) {
      return { status: "warn" as CheckStatus, message: "시세 빈 응답" };
    }
    return { status: "ok" as CheckStatus, message: "Yahoo 시세 응답 정상" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return { status: "warn" as CheckStatus, message: msg };
  }
}

export async function GET() {
  const started = Date.now();
  const [krx, dart, yahoo] = await Promise.all([
    Promise.resolve(checkJsonFile("data/krx-universe.json", 50_000)),
    Promise.resolve(checkJsonFile("data/dart-corp-map.json", 10_000)),
    checkYahoo(),
  ]);

  const checks = {
    krxUniverse: krx,
    dartCorpMap: dart,
    yahooQuote: yahoo,
  };

  const statuses = Object.values(checks).map((c) => c.status);
  const ok = !statuses.includes("fail");
  const degraded = statuses.includes("warn");

  return NextResponse.json(
    {
      ok,
      status: ok ? (degraded ? "degraded" : "healthy") : "unhealthy",
      service: "chartcheck",
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
      latencyMs: Date.now() - started,
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 },
  );
}
