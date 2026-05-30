# ChartCheck 로드맵

## 완료

- [x] MVP 지표 6종 (RSI, MFI, 스토캐스틱, MACD, 볼린저, 일목)
- [x] 일목 구름대(Kumo) 채색
- [x] Vercel 배포 · GitHub 연동
- [x] 뉴스·공시·리서치 · 앱 내 팝업
- [x] 네이버 금융 EUC-KR 인코딩
- [x] GitHub Secrets (`DATA_GO_KR_SERVICE_KEY`, `DART_API_KEY`)
- [x] 주간 KRX·DART 데이터 sync 워크플로 (Actions)
- [x] 일목 후행스팬(Chikou) 차트 표시
- [x] UI 리프레시 (글래스·그라데이션·Lucide) · 모바일 UX 1차

## 진행 예정 (우선순위)

| # | 항목 | 비고 |
|---|------|------|
| 1 | **Finnhub 시세** | Yahoo 유지 중 — 필요 시 전환 검토 |
| 2 | **모바일 UX** | PWA·제스처 등 추가 개선 |
| 3 | **관측/알림** | API 실패율, DART 한도 대시 |
| 4 | **커스텀 도메인** | 보류 (Vercel DNS) |
| 5 | **수익화** | 로그인, 유료 데이터 — 요구사항 확정 후 |

## 의사결정 필요

1. **Finnhub 도입 여부** — 무료 한도 vs Yahoo 불안정성
2. **주간 데이터 sync 자동 PR** — main 직접 push vs PR 리뷰
3. **커스텀 도메인** — 예: `chartcheck.kr` 보유 여부
