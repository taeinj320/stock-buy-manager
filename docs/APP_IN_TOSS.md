# 앱인토스(App in Toss) `.ait` 번들 가이드

## 한 줄 요약

`.ait` 파일은 **앱인토스 전용 미니앱 프로젝트**에서 `npm run build` 할 때 생기는 **패키지 파일**이에요.  
지금 ChartCheck **Next.js(Vercel) 빌드 결과를 zip해서 `.ait`로 바꿀 수는 없습니다.**

| 구분 | ChartCheck (지금) | 앱인토스 |
|------|-------------------|----------|
| 형식 | Next.js 웹 | Vite + `@apps-in-toss/web-framework` |
| 배포 | Vercel | `.ait` 업로드 → 토스 앱 안 미니앱 |
| Capacitor `.apk` | Play/App Store용 | **앱인토스와 무관** |

---

## Vercel 웹이랑 같이 쓸 수 있나?

**가능합니다.** 다만 이렇게 나뉩니다.

- **화면(프론트)** → 토스 정책상 `.ait` 안에 **번들로 포함**되어야 함 (Vercel URL을 iframe으로 통째로 넣는 방식은 **불가**)
- **API(분석·차트·뉴스)** → `https://stock-buy-manager.vercel.app/api/...` 로 **HTTPS 호출은 가능**

즉, 미니앱은 **얇은 Vite 앱**을 만들고, 로직은 지금 Vercel API를 쓰는 구조가 현실적입니다.  
(나중에 UI를 미니앱 안으로 옮기거나, Next를 정적 export + ait에 맞게 이식할 수 있음)

**다른 에이전트 필수 아님** — 이 저장소에 `mini-app/` 폴더를 두고 같이 개발하면 됩니다.

---

## 순서 (콘솔에 올릴 `.ait` 만들기)

### 0. 콘솔 확인

- 앱 등록 시 넣은 **`appName`**(영문 ID)을 메모 (예: `chartcheck`)
- 앱 로고 URL은 콘솔 → 앱 정보 → 이미지 **링크 복사** → `granite.config.ts`의 `icon`에 사용

### 1. 미니앱 프로젝트 (이 저장소에 포함)

```bash
cd chartcheck-mini
npm install
npm run dev    # 샌드박스: intoss://chartcheck
npm run build  # → chartcheck-mini/chartcheck.ait
```

프롬프트: TDS **Y** 권장, 예제는 필요 시 선택.

### 2. `granite.config.ts` 수정

콘솔 값과 **완전히 동일**하게:

```ts
import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "chartcheck", // 콘솔 appName
  brand: {
    displayName: "ChartCheck",
    primaryColor: "#0ea5e9",
    icon: "https://...", // 콘솔에 올린 로고 URL
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
```

### 3. 개발·테스트

```bash
npm run dev
```

- [샌드박스 앱](https://developers-apps-in-toss.toss.im/development/test/sandbox.html) 설치
- `intoss://chartcheck` 로 접속 (appName과 동일)

실기기: `web.host`를 PC IP로, `dev: "vite --host"` — [WebView 가이드](https://developers-apps-in-toss.toss.im/tutorials/webview.html) 참고.

### 4. `.ait` 생성 (콘솔 업로드용)

```bash
npm run build
```

- 프로젝트 **루트**에 `chartcheck.ait` (또는 서비스명.ait) 생성
- 콘솔 **버전 등록하기** → **앱 번들** → 이 `.ait` 파일 선택

### 5. CLI로 올리기 (선택)

```bash
npx ait deploy --api-key {콘솔 API 키}
```

---

## ChartCheck UI

현재 `chartcheck-mini`는:

1. **프로덕션:** WebView가 `https://stock-buy-manager.vercel.app` 로 **직접 이동** (웹과 동일 UI)
2. **폴백:** 이동 실패 시 TDS + Vercel API (차트·6지표·뉴스·공시)

iframe은 토스 WebView에서 빈 화면이 나와 **사용하지 않습니다**.

로컬 테스트: `chartcheck-mini/README.md` (`intoss://chartcheck`, 콘솔 QR, `VITE_BOOT_MODE=native`).

---

## 심사 단계 (권장 순서)

| 단계 | 설명 |
|------|------|
| **1. 지금** | 콘솔 **앱 정보·정보 등록** 심사 대기 (`.ait` 없이 가능한 구간) |
| **2. 1차 통과 후** | `npm run build` → `chartcheck.ait` 업로드 → **버전 등록** → QR **테스트** |
| **3. 정식 심사** | 테스트 확인 후 콘솔 **심사 제출** (웹과 동일 UI·API) |

`.ait` 파일명은 항상 **`chartcheck.ait`** (덮어쓰기 업로드).

---

## 자주 하는 오해

| 오해 | 실제 |
|------|------|
| Capacitor 빌드하면 `.ait` 나온다 | ❌ `.apk`/`.ipa`만 해당 |
| Vercel URL만 넣으면 된다 | ❌ iframe/외부 URL만 쓰는 방식 제한 |
| `.ait`를 Photoshop으로 만든다 | ❌ `npm run build` 산출물 |

---

## 공식 문서

- [WebView 시작하기](https://developers-apps-in-toss.toss.im/tutorials/webview.html)
- [토스앱 테스트 (.ait 업로드)](https://developers-apps-in-toss.toss.im/development/test/toss.html)
- [AI로 미니앱 만들기](https://developers-apps-in-toss.toss.im/tutorials/ai-vibe-coding.html)
