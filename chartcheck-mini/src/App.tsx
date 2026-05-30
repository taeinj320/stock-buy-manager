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
  searchStocks,
  type AnalyzeResult,
  type StockItem,
} from "./api";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<StockItem[]>([]);
  const [selected, setSelected] = useState<StockItem | null>(null);
  const [results, setResults] = useState<AnalyzeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const runAnalyze = useCallback(async () => {
    if (!selected) {
      setError("종목을 선택해 주세요.");
      return;
    }
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      setResults(await analyzeStock(selected));
    } catch (e) {
      setError(e instanceof Error ? e.message : "분석 오류");
    } finally {
      setLoading(false);
    }
  }, [selected]);

  return (
    <div className="app-root">
      <Top
        title={<Top.TitleParagraph size={22}>차트체크</Top.TitleParagraph>}
        subtitleBottom={
          <Top.SubtitleParagraph size={15}>
            차트·뉴스·공시, 한곳에서
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

        <Button display="block" onClick={runAnalyze} disabled={loading || !selected}>
          {loading ? "분석 중…" : "6종 지표 분석"}
        </Button>

        {error && (
          <Paragraph typography="t6" color="red500">
            {error}
          </Paragraph>
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
            <Paragraph typography="t7" color="grey500" style={{ marginTop: 12 }}>
              차트·뉴스·공시는 웹에서 더 자세히 볼 수 있어요.
            </Paragraph>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
