import { NextResponse } from "next/server";

const ALLOWED_HOSTS = new Set([
  "www.mk.co.kr",
  "mk.co.kr",
  "www.hankyung.com",
  "hankyung.com",
  "dart.fss.or.kr",
  "finance.naver.com",
  "news.google.com",
  "www.google.com",
]);

function isAllowedUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    if (!ALLOWED_HOSTS.has(u.hostname)) return null;
    return u;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ error: "url 필요" }, { status: 400 });
  }

  const target = isAllowedUrl(raw);
  if (!target) {
    return new NextResponse(
      `<!DOCTYPE html><html><body><p>허용되지 않은 링크입니다.</p></body></html>`,
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  try {
    const res = await fetch(target.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ChartCheck/1.0; +https://stock-buy-manager.vercel.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return new NextResponse(
        `<!DOCTYPE html><html><body><p>페이지를 불러오지 못했습니다 (${res.status})</p></body></html>`,
        {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        },
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return NextResponse.redirect(target.toString());
    }

    let html = await res.text();
    const baseTag = `<base href="${target.origin}/">`;
    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head([^>]*)>/i, `<head$1>${baseTag}`);
    } else {
      html = `<!DOCTYPE html><html><head>${baseTag}</head><body>${html}</body></html>`;
    }

    /* 앱 내 iframe 표시용 — 원문 사이트 X-Frame-Options 우회하지 않고 우리 응답만 제공 */
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Frame-Options": "SAMEORIGIN",
        "Content-Security-Policy": "frame-ancestors 'self'",
      },
    });
  } catch {
    return new NextResponse(
      `<!DOCTYPE html><html><body><p>네트워크 오류로 페이지를 불러오지 못했습니다.</p></body></html>`,
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }
}
