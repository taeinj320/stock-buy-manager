import { fetchStockInsights } from "@/lib/insights/fetch-insights";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { code?: string; name?: string };
    if (!body.code || !body.name) {
      return NextResponse.json(
        { error: "code와 name이 필요합니다." },
        { status: 400 },
      );
    }

    const insights = await fetchStockInsights(body.code, body.name);
    return NextResponse.json(insights);
  } catch (e) {
    const message = e instanceof Error ? e.message : "insights 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
