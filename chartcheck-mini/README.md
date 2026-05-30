# ChartCheck · 앱인토스 미니앱

콘솔 `appName`: **chartcheck**  
API: [stock-buy-manager.vercel.app](https://stock-buy-manager.vercel.app)

## 개발

```bash
cd chartcheck-mini
npm install
npm run dev
```

토스 **샌드박스 앱** → `intoss://chartcheck`

실기기: `granite.config.ts`의 `web.host`를 PC IP로, `dev: "vite --host"`로 변경.

## `.ait` 빌드 (콘솔 업로드)

```bash
npm run build
```

프로젝트 루트에 **`chartcheck.ait`** 생성 → 앱인토스 콘솔 **버전 등록** → 앱 번들 업로드.

## 배포 (CLI)

```bash
npm run deploy
# 또는 npx ait deploy --api-key {API키}
```

## CORS

미니앱에서 Vercel API를 호출하려면 메인 프로젝트 `src/middleware.ts`가 배포되어 있어야 합니다.
