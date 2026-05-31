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

## 앱인토스 (토스 미니앱)

| 단계 | 상태 | 할 일 |
|------|------|------|
| 콘솔 앱 등록·정보 | **심사 대기 중** | 토스 쪽 1차 심사 결과 대기 |
| `.ait` 정식 심사 | **대기** | 1차 통과 후 `chartcheck-mini` → `npm run build` → `chartcheck.ait` 업로드 → **정식 심사** |
| 웹 연동 | 배포됨 | 미니앱은 Vercel 웹 리다이렉트 + API (`docs/APP_IN_TOSS.md`) |

## 진행 예정

| # | 항목 | 담당 | 비고 |
|---|------|------|------|
| 1 | **스토어 스크린샷** | 사용자 | 캡처 후 636×1048 가공 요청 |
| 2 | **UX 3단계** | 에이전트 | 로딩·에러·분석 결과 가독성 |
| 3 | **`cap add` + 스토어** | 나중 | Play/App Store (`docs/CAPACITOR_SETUP.md`) |
| 4 | **관측 고도화** | 선택 | Slack 알림 |
| 5 | **커스텀 도메인** | 보류 | |
| 6 | **Speed Insights** | 선택 | `docs/VERCEL_PRODUCTION.md` |
| 7 | **수익화** | 보류 | 트래픽·정쵅 후 (`docs/MONETIZATION.md`) |

## 완료 (최근)

- [x] 종목 검색 드롭다운 body 포털
- [x] health API Yahoo → degraded(200)
- [x] UptimeRobot · Vercel Analytics
- [x] `docs/VERCEL_PRODUCTION.md`

## 의사결정

- Finnhub: Yahoo 유지 중
- 수익화: 트래픽·정책 확인 후
- Preview Deployment: PR 미리보기로 Vercel 체크리스트 충족
