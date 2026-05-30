import { NextRequest, NextResponse } from "next/server";
import { searchStocks } from "@/lib/stocks/search";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  if (q.trim().length < 1) {
    return NextResponse.json({ items: [] });
  }

  const items = searchStocks(q, 20).map((s) => ({
    code: s.code,
    name: s.name,
    market: s.market,
    yahooSymbol: s.yahooSymbol,
  }));

  return NextResponse.json({ items });
}
