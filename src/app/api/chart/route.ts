import { NextRequest, NextResponse } from "next/server";
import { buildChartOverlays } from "@/lib/chart/overlays";
import type { IndicatorId, IndicatorParams } from "@/lib/evaluation/types";
import { fetchOhlcv } from "@/lib/market-data/yahoo";
import {
  toChartCandles,
  type ChartInterval,
} from "@/lib/market-data/ohlcv-utils";
import { findByCode } from "@/lib/stocks/universe";

type IntervalKey = "daily" | "weekly" | "monthly";
const INTERVAL_MAP: Record<IntervalKey, ChartInterval> = {
  daily: "1d",
  weekly: "1wk",
  monthly: "1mo",
};

function resolveSymbol(code?: string | null, yahooSymbol?: string | null) {
  if (code) {
    const entry = findByCode(code);
    if (entry) {
      return { symbol: entry.yahooSymbol, name: entry.name, code: entry.code };
    }
    if (yahooSymbol && /^\d{6}\.(KS|KQ|KN)$/.test(yahooSymbol)) {
      return { symbol: yahooSymbol, name: undefined, code: code ?? undefined };
    }
    return null;
  }
  if (yahooSymbol && /^\d{6}\.(KS|KQ|KN)$/.test(yahooSymbol)) {
    return { symbol: yahooSymbol, name: undefined, code: undefined };
  }
  return null;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const yahooSymbol = request.nextUrl.searchParams.get("yahooSymbol");
  const resolved = resolveSymbol(code, yahooSymbol);
  if (!resolved) {
    return NextResponse.json(
      { error: "종목을 찾을 수 없습니다." },
      { status: 400 },
    );
  }

  const indicatorParam = request.nextUrl.searchParams.get("indicators");
  const indicatorIds = indicatorParam
    ? (indicatorParam.split(",").filter(Boolean) as IndicatorId[])
    : [];

  try {
    const { daily, weekly, monthly } = await fetchIntervals(
      resolved.symbol,
      indicatorIds,
      {},
    );
    return NextResponse.json({
      stock: {
        code: resolved.code ?? code,
        name: resolved.name,
        yahooSymbol: resolved.symbol,
      },
      daily,
      weekly,
      monthly,
      note: "전일(완성 봉)까지 · 선택 지표 오버레이",
    });
  } catch (e) {
    console.error("[chart]", e);
    return NextResponse.json(
      { error: "차트 데이터를 가져오지 못했습니다." },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  let body: {
    code?: string;
    yahooSymbol?: string;
    indicators?: { id: IndicatorId; params?: IndicatorParams }[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const resolved = resolveSymbol(body.code, body.yahooSymbol);
  if (!resolved) {
    return NextResponse.json(
      { error: "종목을 찾을 수 없습니다." },
      { status: 400 },
    );
  }

  const indicators = body.indicators ?? [];
  const ids = indicators.map((i) => i.id);
  const paramsMap = Object.fromEntries(
    indicators.map((i) => [i.id, i.params ?? {}]),
  ) as Partial<Record<IndicatorId, IndicatorParams>>;

  try {
    const { daily, weekly, monthly } = await fetchIntervals(
      resolved.symbol,
      ids,
      paramsMap,
    );
    return NextResponse.json({
      stock: {
        code: resolved.code ?? body.code,
        name: resolved.name,
        yahooSymbol: resolved.symbol,
      },
      daily,
      weekly,
      monthly,
      note: "전일(완성 봉)까지 · 선택 지표 오버레이",
    });
  } catch (e) {
    console.error("[chart]", e);
    return NextResponse.json(
      { error: "차트 데이터를 가져오지 못했습니다." },
      { status: 503 },
    );
  }
}

async function fetchIntervals(
  symbol: string,
  indicatorIds: IndicatorId[],
  paramsMap: Partial<Record<IndicatorId, IndicatorParams>>,
) {
  const [dailyBars, weeklyBars, monthlyBars] = await Promise.all([
    fetchOhlcv(symbol, "1d"),
    fetchOhlcv(symbol, "1wk"),
    fetchOhlcv(symbol, "1mo"),
  ]);

  return {
    daily: {
      candles: toChartCandles(dailyBars),
      overlays: buildChartOverlays(dailyBars, indicatorIds, paramsMap),
    },
    weekly: {
      candles: toChartCandles(weeklyBars),
      overlays: buildChartOverlays(weeklyBars, indicatorIds, paramsMap),
    },
    monthly: {
      candles: toChartCandles(monthlyBars),
      overlays: buildChartOverlays(monthlyBars, indicatorIds, paramsMap),
    },
  };
}
