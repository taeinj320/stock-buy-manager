const PUBLISHER_HOSTS = new Set([
  "www.mk.co.kr",
  "mk.co.kr",
  "www.hankyung.com",
  "hankyung.com",
  "dart.fss.or.kr",
  "finance.naver.com",
]);

const GOOGLE_HOSTS = new Set([
  "news.google.com",
  "www.google.com",
  "google.com",
  "www.google.co.kr",
  "google.co.kr",
]);

export function isGoogleNewsHost(hostname: string): boolean {
  return GOOGLE_HOSTS.has(hostname) || hostname.endsWith(".google.com");
}

export function isEmbeddableHost(hostname: string): boolean {
  return PUBLISHER_HOSTS.has(hostname);
}

export function parseAllowedHttpUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u;
  } catch {
    return null;
  }
}

export function isAllowedPublisherUrl(raw: string): boolean {
  const u = parseAllowedHttpUrl(raw);
  if (!u) return false;
  return isEmbeddableHost(u.hostname);
}
