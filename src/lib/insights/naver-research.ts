import iconv from "iconv-lite";
import type { ResearchSummary } from "./types";

function normalizeCode(code: string): string {
  return code.replace(/\D/g, "").slice(-6).padStart(6, "0");
}

function parseConsensus(html: string): {
  score: number | null;
  label: string | null;
  targetPrice: number | null;
} {
  const block = html.match(
    /투자의견[\s\S]*?<\/tr>/,
  )?.[0];
  if (!block) return { score: null, label: null, targetPrice: null };

  const scoreLabel = block.match(
    /<em>([\d.]+)<\/em>\s*(매수|중립|매도|비중확대|비중축소|강력매수|약세|중립유지)/,
  );
  const altLabel = block.match(
    /class="f_(?:up|dn|down)">[^<]*<em>([\d.]+)<\/em>(매수|중립|매도|비중확대|비중축소)/,
  );
  const priceM = block.match(/<em>([\d,]+)<\/em>\s*<\/td>\s*<\/tr>/);

  const score = scoreLabel
    ? parseFloat(scoreLabel[1])
    : altLabel
      ? parseFloat(altLabel[1])
      : null;
  const label = scoreLabel?.[2] ?? altLabel?.[2] ?? null;
  const targetPrice = priceM
    ? parseInt(priceM[1].replace(/,/g, ""), 10)
    : null;

  return { score, label, targetPrice };
}

function parseResearchList(html: string): ResearchSummary["recentReports"] {
  const reports: ResearchSummary["recentReports"] = [];
  const rowRe =
    /<td><a href="company_read\.naver\?[^"]+">([^<]+)<\/a><\/td>\s*<td>([^<]+)<\/td>[\s\S]*?<td class="date"[^>]*>([\d.]+)<\/td>/g;
  let m;
  while ((m = rowRe.exec(html)) !== null && reports.length < 6) {
    const nid = m[0].match(/nid=(\d+)/)?.[1];
    reports.push({
      title: m[1].trim(),
      broker: m[2].trim(),
      date: m[3].trim(),
      link: nid
        ? `https://finance.naver.com/research/company_read.naver?nid=${nid}`
        : "https://finance.naver.com/research/company_list.naver",
    });
  }
  return reports;
}

export async function fetchNaverResearch(
  stockCode: string,
): Promise<ResearchSummary> {
  const code = normalizeCode(stockCode);
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ChartCheck/1.0",
  };

  try {
    const [mainRes, listRes] = await Promise.all([
      fetch(`https://finance.naver.com/item/main.naver?code=${code}`, {
        headers,
        next: { revalidate: 3600 },
      }),
      fetch(
        `https://finance.naver.com/research/company_list.naver?searchType=itemCode&itemCode=${code}`,
        { headers, next: { revalidate: 3600 } },
      ),
    ]);

    let mainHtml = "";
    if (mainRes.ok) {
      const buf = Buffer.from(await mainRes.arrayBuffer());
      mainHtml = iconv.decode(buf, "euc-kr");
    }

    let listHtml = "";
    if (listRes.ok) {
      const buf = Buffer.from(await listRes.arrayBuffer());
      listHtml = iconv.decode(buf, "euc-kr");
    }

    const consensus = parseConsensus(mainHtml);
    const recentReports = parseResearchList(listHtml);

    const available =
      consensus.label !== null || recentReports.length > 0;

    return {
      available,
      consensusScore: consensus.score,
      consensusLabel: consensus.label,
      targetPrice: consensus.targetPrice,
      recentReports,
      note: available
        ? "네이버 금융 컨센서스·최근 리포트 제목입니다. 개별 증권사 의견 집계는 공식 API가 없어 컨센서스 평균만 표시합니다."
        : "리서치 정보를 가져오지 못했습니다.",
    };
  } catch {
    return {
      available: false,
      consensusScore: null,
      consensusLabel: null,
      targetPrice: null,
      recentReports: [],
      note: "네이버 금융 조회 중 오류가 발생했습니다.",
    };
  }
}
