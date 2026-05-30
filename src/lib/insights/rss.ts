import type { NewsItem } from "./types";

const MK_STOCK_RSS = "https://www.mk.co.kr/rss/50200011/";

interface RssItem {
  title: string;
  link: string;
  pubDate: string;
}

function decodeCdata(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function parseRssItems(xml: string, limit = 80): RssItem[] {
  const items: RssItem[] = [];
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];
  for (const block of blocks.slice(0, limit)) {
    const titleM = block.match(/<title>([\s\S]*?)<\/title>/i);
    const linkM = block.match(/<link>([\s\S]*?)<\/link>/i);
    const dateM = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    if (!titleM || !linkM) continue;
    items.push({
      title: decodeCdata(titleM[1]),
      link: decodeCdata(linkM[1]),
      pubDate: dateM ? decodeCdata(dateM[1]) : "",
    });
  }
  return items;
}

function buildKeywords(stockName: string): string[] {
  const cleaned = stockName
    .replace(/\(주\)|㈜|주식회사/g, "")
    .replace(/\s+/g, "")
    .trim();
  const keys = new Set<string>();
  if (cleaned) keys.add(cleaned);
  if (cleaned.length > 6) keys.add(cleaned.slice(0, 4));
  if (cleaned.endsWith("지주") && cleaned.length > 4) {
    keys.add(cleaned.replace(/지주$/, ""));
  }
  return [...keys].filter((k) => k.length >= 2);
}

function matchesStock(title: string, keywords: string[]): boolean {
  const t = title.replace(/\s+/g, "");
  return keywords.some((k) => t.includes(k));
}

async function fetchGoogleNewsRss(
  query: string,
  sourceLabel: NewsItem["source"],
): Promise<NewsItem[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
  const res = await fetch(url, {
    headers: { "User-Agent": "ChartCheck/1.0 (+local dev)" },
    next: { revalidate: 600 },
  });
  if (!res.ok) return [];
  const xml = await res.text();
  return parseRssItems(xml, 30)
    .slice(0, 8)
    .map((item) => ({
      source: sourceLabel,
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
    }));
}

export async function fetchStockNews(
  stockName: string,
): Promise<{ items: NewsItem[]; note?: string }> {
  const keywords = buildKeywords(stockName);
  const items: NewsItem[] = [];

  try {
    const mkRes = await fetch(MK_STOCK_RSS, {
      headers: { "User-Agent": "ChartCheck/1.0" },
      next: { revalidate: 600 },
    });
    if (mkRes.ok) {
      const mkXml = await mkRes.text();
      for (const row of parseRssItems(mkXml, 100)) {
        if (matchesStock(row.title, keywords)) {
          items.push({
            source: "매일경제",
            title: row.title,
            link: row.link,
            pubDate: row.pubDate,
          });
        }
      }
    }
  } catch {
    /* ignore */
  }

  const hkQuery = `${keywords[0] ?? stockName} site:hankyung.com when:7d`;
  const hkFromGoogle = await fetchGoogleNewsRss(hkQuery, "한국경제");
  for (const row of hkFromGoogle) {
    if (!items.some((x) => x.title === row.title)) items.push(row);
  }

  items.sort((a, b) => (a.pubDate < b.pubDate ? 1 : -1));

  const note =
    items.length === 0
      ? "최근 7일 내 한경·매경에서 종목명이 제목에 포함된 기사를 찾지 못했습니다. (매경 증권 RSS + 한경 Google 뉴스 검색)"
      : undefined;

  return { items: items.slice(0, 10), note };
}
