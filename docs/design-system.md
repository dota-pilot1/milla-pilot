# Milla Pilot — 디자인 시스템 (시각 언어)

> 색·간격·타이포·상태색 등 **시각 언어** 기준 문서.
> "어떻게 만드는가"(핵심 원칙·FSD 배치·primitive 규약·인터랙션·화면 템플릿·AI 작업 규칙)는 → `docs/frontend-conventions.md`.
> HTML 시안(`docs-for-.../디자인 컨셉 및 공통 컴퍼넌트 설계/plan.html`)은 보기용, 이 문서가 실제 기준.

---

## 1. 디자인 톤

- shadcn/ui **new-york** 스타일 기준 (`components.json`에 이미 설정됨).
- 웹(`donation-platform-front`)은 시맨틱 토큰만 사용. **raw Tailwind 팔레트 금지** (`bg-emerald-500`, `text-slate-400` 등).
  - 텍스트: `text-foreground` / `text-muted-foreground`
  - 서피스: `bg-background` / `bg-card` / `bg-muted` / `bg-accent` / `bg-secondary`
  - 강조: `bg-primary` / `text-primary` / `text-primary-foreground`
  - 보더/링: `border` (=border-border) / `ring-ring`
- Tauri(`donation-admin-tauri`)는 현재 독립 Tailwind 토큰 구조이므로 `zinc/emerald/sky/amber/red` 팔레트를 `shared/ui` 내부에서만 제한적으로 허용한다. 화면/feature 파일에서 상태색과 컨트롤 스타일을 직접 칠하지 않는다.
- 아이콘: `lucide-react`.
- 다크/브랜드 테마 전환이 있으므로 토큰을 벗어나면 테마가 깨진다.

---

## 2. 간격 스케일 (중요 — 빡빡하지 않게)

| 용도 | 클래스 | 값 |
|---|---|---|
| 페이지 셸 | `mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8` | |
| 섹션 세로 리듬 | `space-y-6` | 24px |
| 카드 안쪽 | `p-5` (컴팩트 `p-4`) | 20 / 16px |
| 카드 라운드 | `rounded-xl` | |
| 카드 보더/그림자 | `border bg-card shadow-sm` | |
| 카드 그리드 | `grid gap-5 sm:grid-cols-2 lg:grid-cols-3` | 20px |
| 리스트 항목 간 | `space-y-3` ~ `space-y-4` | 12~16px |
| 컨트롤 높이 | `h-9`(sm) / `h-10`(기본) | |
| 인라인 요소 gap | `gap-2` ~ `gap-3` | 8~12px |

**금지:** 데이터 행 `py-1`, 카드 `p-2` 같은 과밀. 테이블 행은 최소 `py-2.5`, 폼 필드 간 최소 `space-y-4`.

---

## 3. 타이포

- 페이지 타이틀 `text-2xl font-semibold tracking-tight`
- 섹션 타이틀 `text-lg font-semibold`
- 부제/설명 `text-sm text-muted-foreground`
- 본문 `text-sm`

---

## 4. 색·상태 표시

- **진행률 바** = 실제 금액 기준(`raised/goal`), 추상 목표 금지. 100% 달성 색은 진행 색과 구분.
- **상태 뱃지**: 모집중/통합 구매 진행/배송중/목표달성 → `Badge` variant로 색 매핑.
  - **예외 (단일 출처):** 상태 구분색(green/violet/amber/sky 등)은 오직 `shared/ui/Badge`(웹) · `shared/ui/StatusBadge`(Tauri) **한 파일에서만** 팔레트를 쓴다. 페이지·피처에서 상태색을 직접 칠하지 않는다.

> 로딩/빈 상태 처리, 검색·입력 인터랙션 등 **행동 규칙**은 `frontend-conventions.md` 4절 참조.
