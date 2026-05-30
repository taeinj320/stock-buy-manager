export interface NewsItem {
  source: "한국경제" | "매일경제";
  title: string;
  link: string;
  pubDate: string;
}

export interface DisclosureItem {
  title: string;
  reportNm: string;
  rceptDt: string;
  link: string;
}

export interface ResearchSummary {
  available: boolean;
  consensusScore: number | null;
  consensusLabel: string | null;
  targetPrice: number | null;
  recentReports: {
    title: string;
    broker: string;
    date: string;
    link: string;
  }[];
  note?: string;
}

export interface StockInsights {
  news: NewsItem[];
  disclosures: DisclosureItem[];
  research: ResearchSummary;
  meta: {
    newsNote?: string;
    dartNote?: string;
    researchNote?: string;
  };
}
