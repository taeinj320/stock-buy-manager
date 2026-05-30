import { NextRequest, NextResponse } from "next/server";
import {
  evaluateIndicator,
  INDICATOR_CATALOG,
} from "@/lib/evaluation/registry";
import type { IndicatorId, IndicatorParams } from "@/lib/evaluation/types";
import { fetchDailyOhlcv } from "@/lib/market-data/yahoo";
import { findByCode } from "@/lib/stocks/universe";

interface AnalyzeBody {
  code?: string;
  yahooSymbol?: string;
  indicators?: { id: IndicatorId; params?: IndicatorParams }[];
}

export async function POST(request: NextRequest) {
  let body: AnalyzeBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const indicators = body.indicators ?? [];
  if (indicators.length === 0) {
    return NextResponse.json(
      { error: "분석할 지표를 하나 이상 선택해 주세요." },
      { status: 400 },
    );
  }

  let yahooSymbol = body.yahooSymbol;
  let stockName: string | undefined;

  if (body.code) {
    const entry = findByCode(body.code);
    if (entry) {
      yahooSymbol = entry.yahooSymbol;
      stockName = entry.name;
    } else if (
      body.yahooSymbol &&
      /^\d{6}\.(KS|KQ|KN)$/.test(body.yahooSymbol)
    ) {
      yahooSymbol = body.yahooSymbol;
    } else {
      return NextResponse.json(
        { error: "종목을 찾을 수 없습니다. 목록에서 선택해 주세요." },
        { status: 400 },
      );
    }
  }

  if (!yahooSymbol) {
    return NextResponse.json(
      { error: "종목을 선택해 주세요." },
      { status: 400 },
    );
  }

  let bars;
  try {
    bars = await fetchDailyOhlcv(yahooSymbol);
  } catch (e) {
    console.error("[analyze] yahoo", e);
    return NextResponse.json(
      { error: "시세 데이터를 가져오지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 503 },
    );
  }

  if (bars.length < 30) {
    return NextResponse.json(
      { error: "시세 데이터가 부족합니다." },
      { status: 503 },
    );
  }

  const results = [];
  const errors: { id: string; message: string }[] = [];

  for (const { id, params } of indicators) {
    const meta = INDICATOR_CATALOG.find((m) => m.id === id);
    if (!meta?.enabled) {
      errors.push({ id, message: "아직 지원하지 않는 지표입니다." });
      continue;
    }
    try {
      const result = evaluateIndicator(id, bars, params ?? meta.defaultParams);
      if (result) results.push(result);
    } catch (e) {
      console.error(`[analyze] ${id}`, e);
      errors.push({ id, message: "지표 계산 중 오류가 발생했습니다." });
    }
  }

  return NextResponse.json({
    stock: { code: body.code, name: stockName, yahooSymbol },
    results,
    errors: errors.length ? errors : undefined,
  });
}
