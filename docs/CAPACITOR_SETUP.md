# Capacitor로 앱 만들기

웹은 **그대로 Vercel**에 두고, 앱은 **같은 화면을 WebView로 감싸** 스토어에 올립니다.

## 사전 조건

- Node 20+
- **Android**: Android Studio  
- **iOS**: Mac + Xcode (Apple 개발자 계정은 스토어 출시 시)

## 1. 의존성 (이미 package.json에 있음)

```bash
npm install
```

## 2. 네이티브 프로젝트 생성 (최초 1회)

```bash
npx cap add android
npx cap add ios
```

## 3. 동기화·실행

```bash
npx cap sync
npx cap open android
# 또는
npx cap open ios
```

`capacitor.config.ts`의 `server.url`이 프로덕션을 가리키므로,  
에뮬레이터/실기에서 **배포된 ChartCheck**가 열립니다.

로컬 Next.js(`npm run dev`)를 앱에서 쓰려면 `server.url`을 잠시 주석 처리한 뒤:

```bash
npm run dev
# 다른 터미널
npx cap run android
```

## 4. 스토어 제출

- **아이콘**: `public/store-assets/app-logo.png` (1024 리사이즈는 스토어 콘솔에서)  
- **스크린샷**: 앱 실행 후 **실제 화면 캡처** (목업 PNG 사용 금지)  
- **개인정보·면책**: 웹과 동일 문구 유지

## 5. 앱 ID 변경

`com.chartcheck.app` 을 본인 도메인 역순으로 바꾸려면 `capacitor.config.ts`의 `appId` 수정 후 `npx cap sync`.
