import { decodeHtmlBytes } from "@/lib/embed/decode-html";
import {
  isEmbeddableHost,
  isGoogleNewsHost,
  parseAllowedHttpUrl,
} from "@/lib/insights/allowed-hosts";
import { resolveExternalUrl } from "@/lib/insights/resolve-url";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ error: "url 필요" }, { status: 400 });
  }

  const resolved = await resolveExternalUrl(raw);
  const target = parseAllowedHttpUrl(resolved.url);

  if (
    !target ||
    isGoogleNewsHost(target.hostname) ||
    !isEmbeddableHost(target.hostname)
  ) {
    return new NextResponse(
      `<!DOCTYPE html><html lang="ko"><body style="font-family:sans-serif;padding:1.5rem">
        <p>이 링크는 앱 안 미리보기를 지원하지 않습니다.</p>
        <p><a href="${encodeURI(resolved.url)}" target="_blank" rel="noopener">원문 열기</a></p>
      </body></html>`,
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  try {
    const res = await fetch(target.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
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

    const buf = Buffer.from(await res.arrayBuffer());
    let html = decodeHtmlBytes(
      buf,
      res.headers.get("content-type"),
      target.hostname,
    );
    const headInject = `<meta charset="utf-8"><base href="${target.origin}/">`;
    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head([^>]*)>/i, `<head$1>${headInject}`);
    } else {
      html = `<!DOCTYPE html><html><head>${headInject}</head><body>${html}</body></html>`;
    }

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
