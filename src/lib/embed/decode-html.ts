import iconv from "iconv-lite";

function charsetFromMeta(headLatin1: string): string | null {
  const m = headLatin1.match(/charset\s*=\s*["']?([^"'\s>;]+)/i);
  return m?.[1]?.trim().toLowerCase() ?? null;
}

function decodeWithCharset(buf: Buffer, charset: string): string {
  const c = charset.toLowerCase().replace(/_/g, "-");
  if (
    c.includes("euc-kr") ||
    c === "ks-c-5601-1987" ||
    c.includes("949") ||
    c === "cp949" ||
    c === "windows-949"
  ) {
    return iconv.decode(buf, "cp949");
  }
  if (c.includes("utf-8") || c === "utf8") {
    return buf.toString("utf-8");
  }
  try {
    return iconv.decode(buf, charset);
  } catch {
    return buf.toString("utf-8");
  }
}

/** HTML 바이트 → UTF-8 문자열 (네이버 금융 EUC-KR 등) */
export function decodeHtmlBytes(
  buf: Buffer,
  contentType: string | null,
  hostname?: string,
): string {
  const fromHeader = contentType?.match(/charset=([^;\s]+)/i)?.[1]?.trim();
  const head = buf.slice(0, 8192).toString("latin1");
  const fromMeta = charsetFromMeta(head);

  let charset = fromHeader ?? fromMeta ?? "utf-8";

  if (
    hostname &&
    (hostname === "finance.naver.com" || hostname.endsWith(".naver.com"))
  ) {
    if (!charset.includes("utf")) {
      charset = "euc-kr";
    }
  }

  let html = decodeWithCharset(buf, charset);

  if (
    hostname?.includes("naver.com") &&
    html.includes("\uFFFD") &&
    charset !== "euc-kr"
  ) {
    html = iconv.decode(buf, "cp949");
  }

  return html;
}
