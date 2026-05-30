import {
  Badge,
  Button,
  List,
  ListRow,
  Paragraph,
  SearchField,
  Top,
} from "@toss/tds-mobile";
import { useCallback, useEffect, useState } from "react";
import {
  analyzeStock,
  fetchChartData,
  fetchInsights,
  searchStocks,
  type ChartPayload,
  type EvaluationResult,
  type StockInsights,
  type StockItem,
} from "./api";
import { MiniTradingChart } from "./MiniTradingChart";
import "./App.css";

function openLink(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export function ChartCheckNative() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<StockItem[]>([]);
  const [selected, setSelected] = useState<StockItem | null>(null);
  const [results, setResults] = useState<EvaluationResult[]>([]);
  const [chartData, setChartData] = useState<ChartPayload | null>(null);
  const [insights, setInsights] = useState<StockInsights | null>(null);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim().length < 1) {
      setItems([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      setError(null);
      try {
        setItems(await searchStocks(query));
      } catch (e) {
        setError(e instanceof Error ? e.message : "검색 오류");
        setItems([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!selected || results.length === 0) {
      setInsights(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setInsightsLoading(true);
      try {
        const data = await fetchInsights(selected);
        if (!cancelled) setInsights(data);
      } catch {
        if (!cancelled) setInsights(null);
      } finally {
        if (!cancelled) setInsightsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selected, results.length]);

  const runAnalyze = useCallback(async () => {
    if (!selected) {
      setError("종목을 선택해 주세요.");
      return;
    }
    setLoading(true);
    setChartLoading(true);
    setError(null);
    setResults([]);
    setChartData(null);
    setInsights(null);

    try {
      const [analyzeResults, chart] = await Promise.all([
        analyzeStock(selected),
        fetchChartData(selected).catch(() => null),
      ]);
      setResults(analyzeResults);
      setChartData(chart);
    } catch (e) {
      setError(e instanceof Error ? e.message : "분석 오류");
    } finally {
      setLoading(false);
      setChartLoading(false);
    }
  }, [selected]);

  return (
    <div className="app-root">
      <Top
        title={<Top.TitleParagraph size={22}>차트체크</Top.TitleParagraph>}
        subtitleBottom={
          <Top.SubtitleParagraph size={15}>
            차트·뉴스·공시·6종 지표
          </Top.SubtitleParagraph>
        }
      />

      <div className="app-body">
        <SearchField
          placeholder="삼성전자, 005930, ㅎㅇㄴㅅ"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
          }}
        />

        {searching && (
          <Paragraph typography="t7" color="grey600">
            검색 중…
          </Paragraph>
        )}

        {items.length > 0 && !selected && (
          <List>
            {items.slice(0, 8).map((item) => (
              <ListRow
                key={item.code}
                contents={
                  <ListRow.Texts
                    type="2RowTypeA"
                    top={item.name}
                    bottom={`${item.code} · ${item.market}`}
                  />
                }
                onClick={() => {
                  setSelected(item);
                  setQuery(item.name);
                  setItems([]);
                }}
              />
            ))}
          </List>
        )}

        {selected && (
          <div className="selected-chip">
            <Paragraph typography="t6" fontWeight="semibold">
              {selected.name}
            </Paragraph>
            <Paragraph typography="t7" color="grey600">
              {selected.yahooSymbol}
            </Paragraph>
          </div>
        )}

        <Button
          display="block"
          onClick={runAnalyze}
          disabled={loading || !selected}
        >
          {loading ? "분석 중…" : "6종 지표 분석"}
        </Button>

        {error && (
          <Paragraph typography="t6" color="red500">
            {error}
          </Paragraph>
        )}

        {(chartLoading || chartData) && (
          <>
            <Paragraph typography="t5" fontWeight="bold" style={{ marginTop: 8 }}>
              차트
            </Paragraph>
            <MiniTradingChart data={chartData} loading={chartLoading} />
          </>
        )}

        {results.length > 0 && (
          <>
            <Paragraph typography="t5" fontWeight="bold" style={{ marginTop: 8 }}>
              분석 결과
            </Paragraph>
            <Paragraph typography="t7" color="grey600">
              참고용이며 매매를 권유하지 않습니다.
            </Paragraph>
            <List>
              {results.map((r) => (
                <ListRow
                  key={r.indicatorId}
                  contents={
                    <ListRow.Texts
                      type="3RowTypeA"
                      top={r.name}
                      middle={`현재값 ${r.valueDisplay}`}
                      bottom={r.summary}
                    />
                  }
                  right={
                    <Badge size="small" variant="weak" color="blue">
                      {r.label}
                    </Badge>
                  }
                />
              ))}
            </List>
          </>
        )}

        {(insightsLoading || insights) && (
          <>
            <Paragraph typography="t5" fontWeight="bold" style={{ marginTop: 12 }}>
              뉴스·공시·리서치
            </Paragraph>
            {insightsLoading && (
              <Paragraph typography="t7" color="grey600">
                불러오는 중…
              </Paragraph>
            )}
            {insights && (
              <>
                {insights.news.length > 0 && (
                  <>
                    <Paragraph typography="t6" fontWeight="semibold">
                      뉴스
                    </Paragraph>
                    <List>
                      {insights.news.slice(0, 5).map((n, i) => (
                        <ListRow
                          key={`${n.link}-${i}`}
                          contents={
                            <ListRow.Texts
                              type="2RowTypeA"
                              top={n.title}
                              bottom={`${n.source} · ${n.pubDate}`}
                            />
                          }
                          onClick={() => openLink(n.link)}
                        />
                      ))}
                    </List>
                  </>
                )}
                {insights.disclosures.length > 0 && (
                  <>
                    <Paragraph typography="t6" fontWeight="semibold">
                      공시
                    </Paragraph>
                    <List>
                      {insights.disclosures.slice(0, 5).map((d, i) => (
                        <ListRow
                          key={`${d.link}-${i}`}
                          contents={
                            <ListRow.Texts
                              type="2RowTypeA"
                              top={d.title || d.reportNm}
                              bottom={d.rceptDt}
                            />
                          }
                          onClick={() => openLink(d.link)}
                        />
                      ))}
                    </List>
                  </>
                )}
                {insights.research.available && (
                  <>
                    <Paragraph typography="t6" fontWeight="semibold">
                      리서치
                    </Paragraph>
                    {insights.research.consensusLabel && (
                      <Paragraph typography="t7" color="grey700">
                        컨센서스: {insights.research.consensusLabel}
                        {insights.research.targetPrice != null &&
                          ` · 목표가 ${insights.research.targetPrice.toLocaleString()}원`}
                      </Paragraph>
                    )}
                    <List>
                      {insights.research.recentReports.slice(0, 3).map((r, i) => (
                        <ListRow
                          key={`${r.link}-${i}`}
                          contents={
                            <ListRow.Texts
                              type="2RowTypeA"
                              top={r.title}
                              bottom={`${r.broker} · ${r.date}`}
                            />
                          }
                          onClick={() => openLink(r.link)}
                        />
                      ))}
                    </List>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
