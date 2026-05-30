# 웹앱 + 네이티브 앱 전략

## 결론: 같은 코드베이스로 가능

ChartCheck는 **Next.js 웹앱**을 유지한 채, 아래 방식으로 스토어 앱을 낼 수 있습니다. **별도 에이전트가 필수는 아닙니다.** 다만 스토어 빌드·서명·심사는 단계가 나뉩니다.

| 방식 | 설명 | 적합도 |
|------|------|--------|
| **Capacitor** | 현재 웹을 WebView로 감싸 iOS/Android 패키징 | ★★★ (추천) |
| **TWA** (Android) | PWA URL을 풀스크린 앱처럼 등록 | ★★☆ |
| **React Native 재작성** | UI 전면 이식 | ★☆☆ (비용 큼) |

## 앱인토스 (토스 미니앱)

Play Store용 Capacitor와 **별개**입니다. `.ait` 번들은 `create-ait-app` + `npm run build`로 만듭니다.  
→ [`docs/APP_IN_TOSS.md`](./APP_IN_TOSS.md)

## 권장 로드맵

1. **웹** — Vercel 배포 유지 ✅
2. **PWA** — `manifest.webmanifest`, `public/icons/` ✅
3. **앱인토스** — `create-ait-app` + API는 Vercel 호출
4. **Capacitor** — Play/App Store용 → `docs/CAPACITOR_SETUP.md`
5. **스토어** — 로고·썸네일 + **실제 스크린샷**(캡처)

스크린샷은 목업 PNG가 아니라 **실기/에뮬레이터에서 분석 실행 후 캡처**해야 합니다.

## 스토어 에셋

- **지금**: `npm run store-assets` → 로고·썸네일만 (웹 마켓용 카피)
- **나중**: Playwright 등으로 `stock-buy-manager.vercel.app` 자동 캡처 스크립트 추가 가능
