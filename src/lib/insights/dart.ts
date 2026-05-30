import { getCorpCodeByStockCode } from "@/lib/dart/corp-code";
import type { DisclosureItem } from "./types";

function formatDateYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

export async function fetchRecentDisclosures(
  stockCode: string,
): Promise<{ items: DisclosureItem[]; note?: string }> {
  const key = process.env.DART_API_KEY;
  if (!key) {
    return {
      items: [],
      note: "DART_API_KEY가 없습니다. opendart.fss.or.kr에서 발급 후 .env.local에 설정하고 npm run sync:dart-corp를 실행하세요.",
    };
  }

  const corpCode = getCorpCodeByStockCode(stockCode);
  if (!corpCode) {
    return {
      items: [],
      note: "corp_code 매핑이 없습니다. npm run sync:dart-corp로 data/dart-corp-map.json을 생성하세요.",
    };
  }

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 90);

  const params = new URLSearchParams({
    crtfc_key: key,
    corp_code: corpCode,
    bgn_de: formatDateYmd(start),
    end_de: formatDateYmd(end),
    page_no: "1",
    page_count: "10",
  });

  const res = await fetch(
    `https://opendart.fss.or.kr/api/list.json?${params}`,
    { next: { revalidate: 300 } },
  );
  if (!res.ok) {
    return { items: [], note: `공시 API 요청 실패 (${res.status})` };
  }

  const data = (await res.json()) as {
    status?: string;
    message?: string;
    list?: {
      report_nm: string;
      rcept_no: string;
      rcept_dt: string;
      corp_name?: string;
    }[];
  };

  if (data.status !== "000") {
    return {
      items: [],
      note: data.message ?? "공시 조회에 실패했습니다.",
    };
  }

  const items: DisclosureItem[] = (data.list ?? []).map((row) => ({
    title: row.corp_name ? `[${row.corp_name}] ${row.report_nm}` : row.report_nm,
    reportNm: row.report_nm,
    rceptDt: row.rcept_dt,
    link: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${row.rcept_no}`,
  }));

  return { items };
}
