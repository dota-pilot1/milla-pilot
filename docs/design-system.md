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

**테마 5종** — `haggyo`(학교·기본) / `coral` / `amber` / `sky` / `rose`.
기본값은 **학교 브랜드**다(`themeStore.ts`의 `DEFAULT_THEME`). 무채색 테마는 커머스 톤이 아니라 제거했다.

**CTA 색 (`--cta` 코랄)**
- **최종 전환 버튼 전용** — "후원하기"처럼 결제로 넘어가는, 화면당 하나뿐인 버튼.
- 반드시 `Button variant="cta"` 로만 쓴다. 클래스로 직접 칠하지 않는다.
- 목록·필터·폼 제출 등 일반 액션에는 쓰지 않는다. 강조가 흔해지면 전환력이 죽는다.

**레이어 대비 (구분감)**
- **텍스트가 놓이는 본문 면은 흰색**이다 — 카드·콘텐츠 본문(`--card`/`--background`).
  가독성이 먼저다. 앱 프레임인 헤더·사이드바는 아주 약한 `primary` 틴트로 브랜드 균형을 맞출 수 있다.
- 본문 바닥은 **흰색(`--background`)**을 기본으로 둔다. 페이지 전체를 틴트로 깔면 후원 화면이 탁하고 어둡게 보인다.
- 구분은 **카드 보더와 앱 프레임 강조**가 담당한다. 앱 상단 헤더와 사이드바에는 `primary` 틴트와 border를 써서 테마색을 드러내고, 본문 카드에는 `border`+`shadow-sm`를 쓴다.
- **본문 위 설명 문구는 `text-foreground/75`를 쓴다.** muted 는 카드 안 보조 텍스트용으로 제한한다(`shared/ui/PageHeader` 참고).
- sticky 헤더에 `bg-*/90` 같은 반투명을 쓰지 않는다. 뒤의 페이지 배경이 비쳐 헤더가 물든다.
- 금액·수량 같은 **핵심 수치는 본문보다 확실히 크게** (`text-2xl font-bold` 수준).

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
- 본문 `text-sm` (= `text-foreground`)

**대비(가독성) 규칙 — 중요**

- `text-muted-foreground`는 **보조 텍스트 전용**이다. 라벨·캡션·메타 정보에만 쓴다.
  사용자가 실제로 읽어야 하는 **본문은 `text-foreground`**(기본값)로 둔다.
  본문까지 muted 로 칠하면 화면 전체가 흐려 보인다.
- 라이트 테마 `--muted-foreground`는 흰 배경 대비 **최소 4.5:1**(WCAG AA)을 지킨다.
  현재 `oklch(0.44)` ≈ 6.5:1 (다크 `oklch(0.75)`). 이보다 밝게(값을 크게) 바꾸지 않는다.

**타이포 스케일 — shadcn 기본보다 한 단 크다 (`globals.css`의 `@theme`)**

| 유틸 | 값 | 용도 |
|---|---|---|
| `text-xs` | 13px / 18px | 캡션·배지 |
| `text-sm` | 15px / 24px | **본문 기본** |
| `text-base` | 16px / 26px | 강조 본문 |

후원은 금액을 읽고 결제까지 가는 커머스 흐름이라 대시보드형 14px 본문을 쓰지 않는다.
크기를 조정할 일이 생기면 컴포넌트가 아니라 이 `@theme` 블록에서 바꾼다.
- 보더는 카드가 배경에 묻히지 않을 만큼 유지한다. 현재 라이트 `oklch(0.865)`.

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
> | 보조 바닥 | `#F7F8FA` | `bg-page` |
> | 패널/카드 | `white` | `bg-card` (= `bg-background`) |
> | 보조 영역 | `zinc-50` | `bg-muted` |
>
> **`--page`는 웹 전용 보조 바닥 토큰이다.** 기본 본문은 `--background`(흰색)를 쓰고,
> `--page`는 로그인/인증처럼 별도 바닥 톤이 필요한 화면에서만 제한적으로 쓴다.

- **레이어 구조 고정:** 본문 `white` → 패널/카드 `white` + 보더/그림자 → 보조 영역 `bg-muted`.
- **카드 톤:** 상단 장식선(컬러 bar) 대신, 색 포인트는 **아이콘 배경 / 상태 배지 / 진행바 / hover ring**에만 사용.
- **KPI 카드 계층:** 라벨(11~12) → 값(36~42, `font-extrabold`) → 보조 설명(12~13) 순서 유지.
- **카드 간격:** 섹션 `space-y-6`, 카드 그리드 `gap-4~6`, 카드 라운드 `rounded-2xl~3xl`.
- **인터랙션:** 카드 hover는 `-translate-y-0.5~1` + `shadow` 상승만 사용(과한 애니메이션 금지).
- **검색/필터 영역:** 본문과 분리된 별도 화이트 카드(보더+라운드+얕은 그림자)로 묶는다.
- **데이터 그리드:** 테이블/그리드는 라운드 컨테이너(`rounded-2xl border bg-white shadow-sm`)로 감싸 화면 밀도를 정리한다.
- **토글 탭:** 공통 `shared/ui/Tabs` 사용, active 인디케이터는 위치/너비가 부드럽게 이동하도록 유지한다.

---

## 6. 학교 브랜드 (패밀리룩) — 칠판·분필·손글씨

> 기준: 파일럿 사이트 `donaschool.ai.studio`에서 실측 추출한 값. 컨셉은 **"칠판 + 분필 + 손글씨"**.
> 토큰 정의는 `donation-platform-front/src/app/globals.css`, 첫 적용 사례는 `src/app/project-intro/page.tsx`의 `ChalkboardHero`.

### 6-1. 두 개의 표면 — 절대 섞지 않는다

| 표면 | 어디 | 규칙 |
|---|---|---|
| **마케팅 표면** | 소개 페이지 히어로, 로그인 좌측 패널, (향후) 랜딩·공유 카드 | 칠판·분필·손글씨 허용 |
| **데이터 표면** | 목록·폼·대시보드·CRUD 전부 | §1~5 그대로. 칠판/분필/`font-display` **금지** |

파일럿도 전 화면이 칠판이 아니라 **히어로만 칠판**이다. 데이터 화면의 패밀리룩은 칠판이 아니라 `data-theme="haggyo"` 토큰(틸그린 primary)으로 낸다.

### 6-2. 브랜드 고정 토큰 (테마·다크 무관 고정값)

| 토큰 | 값 | 용도 |
|---|---|---|
| `bg-chalkboard` | `oklch(0.3 0.038 158)` ≈ `#1A2F23` | 칠판 바탕. 마케팅 표면 전용 |
| `ring-chalkboard-line` | `white 14%` | 칠판 위 괘선·보더 |
| `text-chalk` | 웜 화이트 | 칠판 위 기본 글자 |
| `text-chalk-yellow / -pink / -sky` | `#FFF59D / #FFC1E3 / #81D4FA` | 분필 강조 3색. **칠판 위에서만** |
| `bg-cta` / `text-cta` | `#FF7043` 코랄 | 최상위 행동 유도 1개에만. 남용 금지 |

- 분필색·CTA를 라이트 배경 위에 쓰지 않는다(대비 무너짐). 칠판 밖 강조는 `primary`.
- 칠판 위에서는 `muted-foreground` 같은 시맨틱 텍스트 토큰 대신 `text-chalk/NN` 투명도로 위계를 만든다.

### 6-3. 손글씨 폰트 (Gaegu)

- `next/font` `Gaegu` → `--font-gaegu` → 유틸 `font-display`.
- **허용:** 마케팅 표면의 헤드라인·리드·CTA 라벨, 브랜드 문구.
- **금지:** 본문 단락, 폼 라벨, 테이블, 데이터 화면 전체. (파일럿도 본문은 Inter — 손글씨 본문은 가독성이 무너진다.)

### 6-4. 테마

- `data-theme="haggyo"` — primary/링/사이드바가 선명한 로고 틸그린(`oklch(0.58 0.13 172)`), 서피스는 아주 약한 그린 틴트. 라이트·다크 모두 정의됨.
- 살롱 팔레트 6종(rose~sky)은 BeautyBook 유산. 학교 브랜드 확정 시 default 교체·유산 제거는 별도 결정.

### 6-5. 칠판 섹션 구성 규칙 (ChalkboardHero · MembershipSection 패턴)

1. 컨테이너: `rounded-3xl bg-chalkboard ring-1 ring-chalkboard-line` + 넉넉한 패딩(`py-14` 이상, 히어로는 `py-16~20`).
2. 비네트: `bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.28))]`를 `absolute inset-0`으로 깔아 가장자리를 눌러준다. 그 위 콘텐츠에는 `relative`를 준다.
3. 텍스트 위계: 라벨(`font-display text-cta` 또는 `text-chalk-yellow`) → 헤드라인(`font-display text-chalk`) → 본문(`text-chalk/75~85`, **일반 폰트**).
4. 섹션 구분선: `h-px bg-gradient-to-r from-transparent via-chalk/40 to-transparent` (헤더 아래) 또는 `border-dashed border-chalk/20~25` (블록 사이).
5. 칠판 위 카드: `border border-dashed border-chalk/25 bg-chalk/[0.03]`, hover 시 `bg-chalk/[0.06]`. 카드마다 분필색 1색을 아이콘·태그·제목에 일관되게 적용한다.
6. 플로우 다이어그램: 원형 노드 `ring-2` + 분필색 1노드 1색, 화살표는 `text-chalk/50`.
7. CTA: 코랄 채움 1개 + 분필 아웃라인 1개, 그 이상 두지 않는다.

### 6-6. UI 프로토타입 표시 규칙 (백엔드 없이 화면만 먼저 만들 때)

기획 검증을 위해 UI만 먼저 만드는 경우가 있다. 이때 **사용자가 실제로 동작한다고 오해하게 두면 안 된다.**

- **상태 배지 필수** — 제목 옆에 `UI 프로토타입 · 저장되지 않음` 같은 배지를 붙인다.
- **API 호출 금지** — 로컬 `useState`만 쓴다. 새로고침하면 초기화된다는 사실을 문구로도 안내한다.
- **없는 기능은 "준비 중"으로 정직하게** — 실제로 구현되지 않은 항목을 있는 것처럼 꾸미지 않는다. 카드/타일에 `준비 중` 배지를 달고, 상세 화면에서는 왜 아직 없는지와 무엇을 먼저 하고 있는지 적는다.
- **가짜 실적 수치 금지** — 참여자 수·좋아요 수처럼 신뢰를 만드는 숫자를 임의로 지어내지 않는다.
- 참고 구현: `widgets/brand-intro/ui/MessageWallPrototype.tsx`

### 6-7. 외부 사이트를 참고할 때

파일럿·경쟁 사이트를 참고할 수 있지만 **레이아웃 패턴과 정보 구조까지만** 가져온다.

- 본문 문구·카피는 **우리 제품 실제 동작 기준으로 새로 쓴다.** 남의 문장을 단어만 바꿔 옮기지 않는다.
- 사진·일러스트 등 저작물은 가져오지 않는다. 준비 전이면 로고 마크나 플레이스홀더를 둔다.
- 참고한 출처는 컴포넌트 주석에 남긴다(예: `파일럿(donaschool.ai.studio) 구성을 참고`).
