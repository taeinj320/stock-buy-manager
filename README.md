# ChartCheck

국내 주식 종목의 기술적 지표를 **지표별로 독립** 평가하는 웹 앱입니다. 매수/매도 추천을 제공하지 않습니다.

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # DATA_GO_KR_SERVICE_KEY 입력
npm run sync:krx             # 종목 마스터 (KRX API → 실패 시 KIND)
npm run dev
```

http://localhost:3000

> `localhost`는 **이 PC에서만** 접속됩니다. 다른 기기·외부에서는 Vercel 배포 URL을 사용하세요.

## 배포 (Vercel)

1. GitHub 저장소 연결 후 [Vercel](https://vercel.com)에서 Import
2. Framework: **Next.js** (자동 감지)
3. Environment Variables에 아래 키 등록 (Production·Preview·Development 모두 권장)
4. Deploy

| 변수 | 필수 |
|------|------|
| `DATA_GO_KR_SERVICE_KEY` | 종목 검색·sync 시 |
| `DART_API_KEY` | 공시 조회 |

`data/krx-universe.json`, `data/dart-corp-map.json`은 저장소에 포함되어 배포 직후 검색·공시가 동작합니다. 주기적으로 `npm run sync:krx` / `sync:dart-corp` 후 커밋하면 데이터를 갱신할 수 있습니다.

**라이브:** https://stock-buy-manager.vercel.app  
**GitHub:** https://github.com/taeinj320/stock-buy-manager

로드맵·의사결정 항목: [docs/ROADMAP.md](docs/ROADMAP.md)

### 주간 데이터 자동 갱신 (선택)

GitHub 저장소 Settings → Secrets에 `DATA_GO_KR_SERVICE_KEY`, `DART_API_KEY` 등록 후  
`.github/workflows/sync-universe.yml` 이 매주 월요일 `data/*.json` 을 갱신·커밋합니다.

## 환경 변수

| 변수 | 설명 |
|------|------|
| `DATA_GO_KR_SERVICE_KEY` | [공공데이터포털 KRX 상장종목정보](https://www.data.go.kr/data/15094775/openapi.do) 인증키 |
| `DART_API_KEY` | [OpenDART](https://opendart.fss.or.kr/) 인증키 (최근 공시·corp_code 매핑) |

공시를 쓰려면 키 발급 후:

```bash
# .env.local 에 DART_API_KEY=... 추가
npm run sync:dart-corp   # data/dart-corp-map.json 생성
```

## 종합의견 · 외부 정보

분석 후 **종합의견**(접기 가능)과 **뉴스·공시·리서치**(항상 표시)를 조회합니다 (모두 참고용, 매매 권유 아님).

- **기술 방향**: 선택 지표 기준 매수/매도 쪽 해석 개수·우세 요약
- **뉴스**: 매일경제 증권 RSS + 한국경제(Google 뉴스 `site:hankyung.com`, 7일)
- **공시**: OpenDART 최근 90일
- **리포트**: 네이버 금융 컨센서스(평균 투자의견·목표주가) + 최근 리포트 제목

증권사별 매수/매도 의견 집계는 공식 무료 API가 없어, 컨센서스 평균과 리포트 목록만 표시합니다.

## 주요 스크립트

- `npm run sync:krx` — `data/krx-universe.json` 갱신 (검색·티커 매핑)
- `npm run sync:dart-corp` — `data/dart-corp-map.json` 갱신 (공시용 corp_code)
- `npm run build` — 프로덕션 빌드

## MVP 지표

RSI, MFI, 스토캐스틱, MACD, 볼린저밴드, 일목균형표(전환·기준·선행스팬)

상태 표기: `적정`, `주의(과매수)`, `부적합(과매도)` 등

## 시세

Yahoo Finance (`종목코드.KS` / `.KQ`). 추후 Finnhub 연동 예정.
