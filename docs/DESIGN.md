# ChartCheck UI·디자인 가이드

## 적용 방향 (2026-05)

- **글래스모피즘**: `bg-white/80` + `backdrop-blur` + 부드러운 그림자
- **배경**: CSS 그라데이션 + `/public/decor/grid-pattern.svg` (자체 제작, 라이선스 제약 없음)
- **아이콘**: [Lucide](https://lucide.dev) (ISC) — 별도 이미지 에셋 없이 선명한 UI
- **모바일**: `dvh`·`safe-area-inset`·팝업 하단 시트·터치 영역 44px 이상

## 무료 리소스 후보 (추가 시)

| 출처 | 용도 | 라이선스 |
|------|------|----------|
| [Lucide Icons](https://lucide.dev) | 버튼·헤더 아이콘 | ISC |
| [unDraw](https://undraw.co) | 빈 상태·온보딩 일러스트 | MIT (출처 표기 권장) |
| [Heroicons](https://heroicons.com) | Lucide 대안 | MIT |
| [Google Fonts](https://fonts.google.com) | Noto Sans KR 등 | OFL |
| [SVG Backgrounds](https://www.svgbackgrounds.com) | 패턴·메시 | 이용약관 확인 |

**비추천**: 유료 스톡·라이선스 불명 PNG, 차트 영역 위에 큰 일러스트(가독성 저하).

## AI 이미지 생성

히어로 일러스트·마스코트가 필요할 때만 사용 권장. 현재는 **CSS·SVG·아이콘**으로 충분하며, 생성 이미지는 용량·일관성·라이선스 이슈가 있습니다.

## shadcn/ui 도입 (선택)

컴포넌트 수가 늘면 `npx shadcn@latest init -d --base radix` 후 Dialog·Sheet·Button을 점진 도입할 수 있습니다. 현재는 의존성 최소화를 위해 커스텀 `GlassCard`·`PrimaryButton` 사용.

## 컬러

| 토큰 | 용도 |
|------|------|
| sky/indigo 그라데이션 | CTA·브랜드 포인트 |
| zinc | 본문·보조 텍스트 |
| emerald/amber/rose | 지표 상태 배지 (기존 유지) |
| 캔들 상승/하락 | 한국 시장 관례 (빨강/파랑) |

## 모바일 체크리스트

- [x] 팝업: sm 이상 중앙 모달, sm 미만 하단 시트
- [x] 차트 높이: 뷰포트 비율 반영
- [x] `viewport-fit=cover` + safe-area 패딩
- [ ] PWA·홈 화면 추가 (미구현)
