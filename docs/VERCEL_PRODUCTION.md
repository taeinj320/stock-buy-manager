# Vercel Production Checklist 가이드

대시보드 **Production Checklist (2/5)** 에 나오는 항목 설명입니다.

## 이미 완료 (2/5)

| 항목 | 상태 |
|------|------|
| **Connect Git Repository** | GitHub `taeinj320/stock-buy-manager` 연결됨 |
| **Enable Web Analytics** | `@vercel/analytics` 연동됨 → Analytics 탭에서 방문자 확인 |

---

## 남은 항목 (3/5)

### 1. Add Custom Domain (선택 · 보류 중)

**무엇:** `stock-buy-manager.vercel.app` 대신 `chartcheck.kr` 같은 **본인 도메인**으로 접속.

**방법 (나중에 할 때):**

1. Vercel → 프로젝트 → **Settings** → **Domains**
2. 도메인 입력 → DNS에 Vercel이 안내하는 **A/CNAME** 레코드 추가
3. 인증 완료 후 HTTPS 자동 발급

**지금:** 로드맵에서 **보류**. Threads·앱인토스 링크는 `.vercel.app` 으로 충분합니다.

---

### 2. Preview Deployment (PR 미리보기)

**무엇:** `main` 이 아닌 **브랜치·PR**에 push하면 **미리보기 URL**이 생겨, 배포 전에 화면을 확인하는 기능.

**확인:**

1. GitHub에 브랜치 하나 만들고 push
2. Vercel → **Deployments** 에 Preview 배포가 생기는지 확인
3. PR을 열면 Vercel bot이 **Preview URL**을 PR에 달아 줌

**이미 연결돼 있으면** 별도 설정 없이 동작합니다. 체크리스트는 “한 번이라도 Preview 배포가 있었는지”를 권장하는 안내입니다.

---

### 3. Enable Speed Insights (선택)

**무엇:** 실제 사용자 환경에서 **LCP·FID 등 Core Web Vitals**를 Vercel 대시보드에 수집.

**방법:**

```bash
npm install @vercel/speed-insights
```

`src/app/layout.tsx` 에 추가:

```tsx
import { SpeedInsights } from "@vercel/speed-insights/next";
// <body> 안에 <SpeedInsights />
```

배포 후 Vercel → **Speed Insights** 탭에서 데이터 확인 (트래픽이 있어야 그래프가 채워짐).

**우선순위:** 필수는 아님. Analytics보다 **성능 튜닝**할 때 켜면 됩니다.

---

## Observability · Error Rate (0.4% 등)

**의미:** 최근 6시간 요청 중 **4xx/5xx 비율**. 0%가 아니어도 서비스가 죽었다는 뜻은 아닙니다.

**ChartCheck에서 흔한 원인:**

| 원인 | 설명 |
|------|------|
| `/api/health` **503** | Yahoo 시세 점검 실패 시 (UptimeRobot 5분마다 호출 → 에러율에 반영) |
| `/api/analyze`·`/api/chart` **503** | Yahoo 시세 일시 실패 (사용자 분석 시) |
| **400** | 잘못된 요청·종목 미선택 (정상 거절) |
| **배포 실패** | 과거 빌드 오류 (예: `useSearchParams` Suspense — `827bd4d`에서 수정) |

**로그 보는 곳:** Vercel → 프로젝트 → **Logs** (Runtime / Edge) → Status **5xx** 필터.

**앱 쪽 조치:** `docs/MONITORING.md` 참고 — health는 Yahoo 실패를 **degraded(200)** 로 바꿔 UptimeRobot 오탐을 줄입니다.
