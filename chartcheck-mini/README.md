# ChartCheck · 앱인토스 미니앱

콘솔 `appName`: **chartcheck**

미니앱은 **웹(Vercel)과 동일한 화면**을 WebView로 불러옵니다.  
차트·뉴스·공시·종합의견까지 웹과 같습니다.

---

## 미니앱 열어보는 방법

### 1) 샌드박스 (개발·검토 전에 추천)

1. [샌드박스 앱 설치](https://developers-apps-in-toss.toss.im/development/test/sandbox.html) (iOS/Android)
2. PC에서:

```bash
cd chartcheck-mini
npm install
npm run dev
```

3. 샌드박스 앱에서 주소/딥링크: **`intoss://chartcheck`**
4. 토스 샌드박스가 PC의 dev 서버(`localhost:5173`)에 연결되도록 안내에 맞게 IP 설정 (실기기일 때)

**가장 쉬운 확인:** `.ait` 업로드 후 콘솔 **테스트하기 QR** (아래 2번)

### 2) 콘솔 QR (`.ait` 업로드 후)

```bash
npm run build
```

생성 파일: **`chartcheck-mini/chartcheck.ait`**

1. [앱인토스 콘솔](https://apps-in-toss.toss.im/) → **버전 등록** → `chartcheck.ait` 업로드  
2. **테스트하기** → QR 코드  
3. **토스 앱**에서 QR 스캔 → 미니앱 실행 (웹과 동일 UI)

### 3) 로컬 웹만 먼저 볼 때

브라우저에서 https://stock-buy-manager.vercel.app  
(미니앱과 같은 화면입니다.)

---

## 설정

| 변수 | 설명 |
|------|------|
| `VITE_WEB_URL` | 불러올 웹 URL (기본 프로덕션) |

로컬 Next.js를 미니앱에서 보려면:

```bash
# 터미널 1: 메인 프로젝트
cd ..
npm run dev

# chartcheck-mini/.env.local
VITE_WEB_URL=http://127.0.0.1:3000
```

---

## 심사 참고

앱인토스 정책상 “외부 URL만 iframe” 방식이 제한될 수 있습니다.  
심사 피드백이 오면 UI를 TDS로 이식하는 2단계를 진행할 수 있습니다.  
**기능 동일성**을 우선할 때는 현재 방식이 가장 빠릅니다.
