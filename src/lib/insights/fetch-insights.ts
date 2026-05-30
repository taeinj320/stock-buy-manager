import { fetchRecentDisclosures } from "./dart";
import { fetchNaverResearch } from "./naver-research";
import { fetchStockNews } from "./rss";
import type { StockInsights } from "./types";

export async function fetchStockInsights(
  stockCode: string,
  stockName: string,
): Promise<StockInsights> {
  const [newsResult, dartResult, research] = await Promise.all([
    fetchStockNews(stockName),
    fetchRecentDisclosures(stockCode),
    fetchNaverResearch(stockCode),
  ]);

  return {
    news: newsResult.items,
    disclosures: dartResult.items,
    research,
    meta: {
      newsNote: newsResult.note,
      dartNote: dartResult.note,
      researchNote: research.note,
    },
  };
}
