import { resolveExternalUrl } from "@/lib/insights/resolve-url";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ error: "url 필요" }, { status: 400 });
  }

  const result = await resolveExternalUrl(raw);
  return NextResponse.json(result);
}
