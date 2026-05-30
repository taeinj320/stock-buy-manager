import {
  isEmbeddableHost,
  isGoogleNewsHost,
  parseAllowedHttpUrl,
} from "./allowed-hosts";

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml",
};

export interface ResolvedUrl {
  url: string;
  embeddable: boolean;
  resolved: boolean;
}

/** Google 뉴스 RSS 링크 등 → 언론사·공시 원문 URL */
export async function resolveExternalUrl(raw: string): Promise<ResolvedUrl> {
  const parsed = parseAllowedHttpUrl(raw);
  if (!parsed) {
    return { url: raw, embeddable: false, resolved: false };
  }

  let finalUrl = parsed.toString();

  if (isGoogleNewsHost(parsed.hostname) || raw.includes("news.google.")) {
    try {
      const res = await fetch(raw, {
        headers: FETCH_HEADERS,
        redirect: "follow",
        next: { revalidate: 600 },
      });
      const after = parseAllowedHttpUrl(res.url);
      if (after && !isGoogleNewsHost(after.hostname)) {
        finalUrl = after.toString();
      }
    } catch {
      /* 원본 URL 유지 */
    }
  }

  const finalParsed = parseAllowedHttpUrl(finalUrl);
  const embeddable =
    finalParsed !== null &&
    isEmbeddableHost(finalParsed.hostname) &&
    !isGoogleNewsHost(finalParsed.hostname);

  return {
    url: finalUrl,
    embeddable,
    resolved: finalUrl !== raw,
  };
}

export async function resolveNewsLinks<T extends { link: string }>(
  items: T[],
): Promise<T[]> {
  const out: T[] = [];
  for (const item of items) {
    const { url } = await resolveExternalUrl(item.link);
    out.push({ ...item, link: url });
  }
  return out;
}
