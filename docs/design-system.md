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

---

## 5. 화면 공통 UI 지침 (웹·Tauri 공통)

> 원래 Tauri Admin 기준으로 적은 지침이지만 **웹(`donation-platform-front`)에도 동일하게 적용**한다.
> 단, 웹은 브랜드 테마 6종 + 다크가 걸려 있어 **hex/팔레트를 그대로 옮기면 테마가 깨진다.** 아래 매핑을 쓴다.
>
> | 지침의 색 | Tauri | 웹 (토큰) |
> |---|---|---|
> | 페이지 바닥 | `#F7F8FA` | `bg-page` |
> | 패널/카드 | `white` | `bg-card` (= `bg-background`) |
> | 보조 영역 | `zinc-50` | `bg-muted` |
>
> **`--page`는 웹 전용 토큰이다.** shadcn 관례상 `--background`가 입력·다이얼로그·드롭다운의 **서피스** 색으로
> 이미 코드 전반에 쓰이고 있어서, 페이지 바닥을 `--background`로 어둡게 하면 그 서피스들이 전부 회색이 된다.
> 그래서 페이지 바닥만 `--page`로 분리했다. **페이지 최상위 래퍼에만 `bg-page`를 쓰고**, 그 외에는 쓰지 않는다.

- **레이어 구조 고정:** 페이지 `#F7F8FA` → 패널/카드 `white` → 보조 영역 `zinc-50`.
- **카드 톤:** 상단 장식선(컬러 bar) 대신, 색 포인트는 **아이콘 배경 / 상태 배지 / 진행바 / hover ring**에만 사용.
- **KPI 카드 계층:** 라벨(11~12) → 값(36~42, `font-extrabold`) → 보조 설명(12~13) 순서 유지.
- **카드 간격:** 섹션 `space-y-6`, 카드 그리드 `gap-4~6`, 카드 라운드 `rounded-2xl~3xl`.
- **인터랙션:** 카드 hover는 `-translate-y-0.5~1` + `shadow` 상승만 사용(과한 애니메이션 금지).
- **검색/필터 영역:** 본문과 분리된 별도 화이트 카드(보더+라운드+얕은 그림자)로 묶는다.
- **데이터 그리드:** 테이블/그리드는 라운드 컨테이너(`rounded-2xl border bg-white shadow-sm`)로 감싸 화면 밀도를 정리한다.
- **토글 탭:** 공통 `shared/ui/Tabs` 사용, active 인디케이터는 위치/너비가 부드럽게 이동하도록 유지한다.
