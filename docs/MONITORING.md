# 서버 살아 있는지 확인하기 (UptimeRobot)

## 이게 뭔가요?

**UptimeRobot**은 무료로 쓸 수 있는 “사이트 감시” 서비스입니다.  
몇 분마다 지정한 **주소(URL)**에 접속해 보고, **안 열리면 이메일로 알려** 줍니다.

ChartCheck가 밤에 죽었는지, Vercel·Yahoo 시세 문제인지 **미리 알고 싶을 때** 씁니다.  
필수는 아니지만, 운영할 때 편합니다.

## 무엇을 등록하나요?

[UptimeRobot](https://uptimerobot.com) 가입 후 **모니터 추가** → 타입 **HTTP(s)**.

| 항목 | 넣을 값 |
|------|---------|
| **URL (Friendly Name 아래)** | `https://stock-buy-manager.vercel.app/api/health` |
| **이름** | ChartCheck health (아무 이름) |
| **간격** | 5분 (무료 플랜 기본) |

### 왜 `/api/health` 인가요?

- 홈(`/`)만 보면: 페이지는 떠도 **종목 DB·시세 API**가 깨진 건 모릅니다.
- `/api/health`는 **KRX 데이터, DART 맵, Yahoo 시세 샘플**까지 한 번에 점검합니다.
- 정상이면 JSON에 `"ok": true`, `"status": "healthy"` 가 보입니다.

브라우저에서 한 번 열어 보세요:  
https://stock-buy-manager.vercel.app/api/health

### 홈만 감시하고 싶다면

URL을 `https://stock-buy-manager.vercel.app/` 로 넣어도 됩니다.  
다만 **기능 장애는 health가 더 잘 잡습니다.**

## 알림

UptimeRobot 대시보드에서 **Alert Contacts**에 이메일을 연결하면 됩니다.  
Slack 연동은 로드맵 “관측 고도화” 단계에서 추가할 수 있습니다.
