# ChartCheck 로드맵

## MVP (초기 버전) — 완료로 봄

기능: 지표 6종, 차트, 뉴스·공시·리서치, Vercel 배포, UI·모바일 1차, health API, 스토어 로고·썸네일.

**아직 스토어 제출 전이면**: 실화면 스크린샷 캡처 + 마켓 등록만 남음.

## 완료

- [x] MVP 지표·차트·인사이트
- [x] Vercel · GitHub · 주간 data sync
- [x] UI 리프레시 · `/api/health`
- [x] 스토어 로고·썸네일
- [x] PWA manifest · ~~홈 화면 안내~~ (안내 배너 제거)
- [x] Capacitor 설정 (`capacitor.config.ts`, `docs/CAPACITOR_SETUP.md`)

## 완료 (최근 UX · 안정성)

- [x] 종목 검색 드롭다운 body 포털
- [x] health API Yahoo → degraded(200)
- [x] **UX 3단계** — 분석 로딩 패널, 오류/경고·재시도, 결과 요약·정렬

## 진행 예정

| # | 항목 | 비고 |
|---|------|------|
| 1 | **스토어 스크린샷** | 실기/웹 캡처 → 마켓 규격 |
| 2 | **`cap add` + 스토어 빌드** | Android Studio / Xcode |
| 3 | **UptimeRobot** (선택) | `docs/MONITORING.md` — **연결 완료** |
| — | **Vercel Production Checklist** | `docs/VERCEL_PRODUCTION.md` |
| 3b | **Vercel Web Analytics** | 대시보드 Analytics + `@vercel/analytics` |
| 4 | **관측 고도화** | Slack 알림 |
| 5 | **커스텀 도메인** | 보류 |
| 6 | **수익화** | 보류 — 정책·신뢰 우선 (`docs/MONETIZATION.md`) |

## 의사결정

- Finnhub: Yahoo 유지 중
- 수익화: 앱인토스·스토어 **정책** 확인 후 (트래픽은 광고 등 선택 사항)
