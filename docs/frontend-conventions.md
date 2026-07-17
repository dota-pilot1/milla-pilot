# Milla Pilot — 프론트엔드 컨벤션 (만드는 규칙)

> 컴포넌트 구조·인터랙션·화면 템플릿·AI 작업 규칙 등 **"어떻게 만드는가"** 기준 문서.
> 시각 언어(색·간격·타이포·상태색)는 → `docs/design-system.md`.
> 외부 디자인 시스템(Astryx 등)을 **설치하지 않는다.** AI가 읽고 따르는 운영 방식만 가져온 내부 기준이며, 사용자가 별도 실험을 명시하지 않으면 Astryx/StyleX 마이그레이션 금지.

---

## 0. 핵심 원칙

**"화면은 조립이다."** 페이지는 공통 컴포넌트를 조합할 뿐, 버튼·입력·테이블·카드 스타일을 인라인으로 새로 만들지 않는다.

AI가 UI 작업을 할 때의 우선순위:

1. 이 문서와 `design-system.md`를 먼저 읽는다.
2. 기존 `shared/ui` primitive를 확인한다.
3. 필요한 primitive가 없고 반복 가능성이 있으면 먼저 만든다.
4. 화면은 primitive + entity + feature + widget 조합으로 작성한다.
5. 마지막에 원시 `<button>`, `<input>`, `<select>`, `<textarea>`, `<table>` 직접 스타일링이 남았는지 검색한다.

---

## 1. FSD 배치 규칙

| 레이어 | 넣는 것 | 예 |
|---|---|---|
| `shared/ui` | 도메인 없는 순수 UI primitive | `Button` `Input` `Select` `Badge` `Progress` `Card` `Dialog` `PageHeader` `EmptyState` |
| `entities/{domain}/ui` | 도메인 데이터 **표시** 컴포넌트 | `FacilityCard` `DonationItemCard` |
| `entities/{domain}/api` `.../model` | API 클라이언트 · 타입 | `facilityApi.ts` `types.ts` |
| `features/{feature}/ui` | 사용자 **행동** 흐름 UI | 등록/수정 다이얼로그, 검색바, 후원 폼 |
| `widgets` | 페이지 골격 | `Header` `Sidebar` `AppShell` |
| `app/**/page.tsx` | 위 컴포넌트를 **조립**만 | 긴 인라인 UI 로직 금지 |

---

## 2. 공통 컴포넌트 우선순위 (코드 쓰기 전 체크)

1. `shared/ui`에 이미 있나? → 재사용
2. 없지만 2회 이상 반복될 primitive인가? → `shared/ui`에 만들고 재사용
3. 도메인 데이터 카드/뱃지인가? → `entities/{domain}/ui`
4. 그 외 일회성 조합 → 페이지에서 primitive 조립

**금지:** 이미 primitive가 있는데 페이지/피처에서 `<button>`·`<input>`·`<select>`·테이블 스타일을 인라인으로 재작성.

---

## 3. Primitive 규약

- `class-variance-authority(cva)`로 variant 정의, `cn()`(`@/shared/lib/utils`)으로 className 병합.
- `variant` / `size` prop 노출, `className`으로 오버라이드 허용.
- 폼 요소는 `disabled`, `aria-*`, `focus-visible:ring` 포함.
- 네이티브 컨트롤이 OS 기본 모양으로 튀면 안 된다. 예: `Select`는 `appearance-none`, 자체 chevron, 공통 focus/disabled 스타일을 가진다.
- primitive 내부에서만 색상/간격/라운드 상세값을 가진다. 화면 파일은 variant와 조합만 선택한다.

**최소 primitive 세트 (웹):** `Button` `Input` `Select` `Textarea` `Badge` `Progress` `Card`(+Header/Content) `PageHeader` `EmptyState` `Dialog`.
**Tauri:** `Button` `Input` `Select` `Textarea` `Checkbox` `Panel` `FormField` `FormSection` `DataTable` `StatusBadge` `EmptyState`.

---

## 4. 인터랙션 컨벤션

### 4.1 로딩 / 빈 상태

- 로딩/빈 상태 → `EmptyState` 또는 스켈레톤. 화면마다 다르게 그리지 않는다.

### 4.2 검색·입력

- **입력은 즉시 반영, 실행은 지연.** 검색/필터 입력값(controlled)은 바로 보여주되, 실제 필터링·조회는 아래 기준으로 지연한다.
- **메모리 필터**(이미 불러온 목록을 클라이언트에서 거름): **디바운스 200~300ms**. 키 입력마다 즉시 필터링(리렌더 지터)하지 않는다. Enter 강제는 쓰지 않는다(오히려 불편).
- **서버 조회형 검색**(입력이 API 호출로 이어짐): **디바운스 300ms 또는 Enter 제출**. 매 키 입력마다 요청 금지.
- 디바운스는 `shared/lib/useDebouncedValue` 훅으로 통일. 화면마다 setTimeout을 직접 짜지 않는다.
- 칩/토글/셀렉트 같은 **이산 선택**은 디바운스 없이 즉시 반영.

---

## 5. 화면 템플릿

### 5.1 Tauri 관리자 CRUD 화면

관리자 화면은 반복 업무용 콘솔이다. 랜딩 페이지처럼 꾸미지 말고, 조밀하지만 읽기 쉬운 운영 UI로 만든다.

```tsx
<main className="workspace-page">
  <section className="workspace-hero">...</section>

  <Panel>
    <PanelHeader title="목록 · N건" action={<Button>추가</Button>} />

    {formOpen && (
      <FormSection>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <FormField label="이름"><Input /></FormField>
          <FormField label="상태"><Select>...</Select></FormField>
          <FormField label="설명" className="md:col-span-2"><Textarea /></FormField>
        </div>
      </FormSection>
    )}

    {items.length === 0 ? (
      <EmptyState title="등록된 항목이 없습니다." />
    ) : (
      <DataTable>
        <DataTableHead>...</DataTableHead>
        <tbody>
          <DataTableRow>
            <DataTableCell>...</DataTableCell>
            <DataTableCell><StatusBadge>모집중</StatusBadge></DataTableCell>
          </DataTableRow>
        </tbody>
      </DataTable>
    )}
  </Panel>
</main>
```

관리자 CRUD 화면 금지:

- feature 파일에서 `const field = "..."`, `const label = "..."`로 폼 스타일 복제 금지.
- feature 파일에서 원시 `<select>`, `<textarea>`, `<table>` 직접 스타일링 금지.
- 상태 텍스트를 일반 문자열로만 표시하지 말고 `StatusBadge` 사용.
- 빈 목록을 단순 `<p>`로 표시하지 말고 `EmptyState` 사용.

### 5.2 웹 후원자 화면

웹 화면은 후원자가 탐색하고 참여하는 화면이다. 관리 용어보다 사용자 행동 언어를 우선한다.

```tsx
<main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
  <PageHeader title="후원하기" description="필요한 물품을 확인하고 후원에 참여하세요." />
  <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    <FacilityCard />
    <DonationItemCard />
  </section>
</main>
```

웹 화면 금지:

- 페이지 파일에 긴 카드/폼/테이블 UI를 직접 작성하지 않는다.
- 후원자 화면에서 관리자 용어(`관리`, `CRUD`, `승인 처리`)를 노출하지 않는다.
- "100% 전달"처럼 검증되지 않은 보장 문구를 쓰지 않는다.

---

## 6. AI 작업 규칙

UI 작업을 맡길 때 포함할 조건:

```md
`/docs/design-system.md`(시각)와 `/docs/frontend-conventions.md`(규칙)를 먼저 읽고 따른다.
기존 `shared/ui` primitive를 우선 사용한다.
primitive가 없고 반복될 UI면 먼저 `shared/ui`에 만든 뒤 화면에 적용한다.
페이지/feature 파일에서 원시 button/input/select/textarea/table 스타일을 새로 만들지 않는다.
작업 후 `rg "<select|<textarea|<table|const field|const label"`로 반복 스타일이 남았는지 확인한다.
```

작업 후 자체 점검:

- 공통 컴포넌트를 재사용했나?
- 새 primitive가 한 화면 전용 이름을 갖고 있지 않나?
- feature/page 파일에 스타일 문자열이 과하게 쌓이지 않았나?
- 상태/빈 상태/로딩/에러 표현이 공통화됐나?
- 빌드 또는 타입 체크를 통과했나?

---

## 7. 도메인 맥락 (요약)

후원 이행 플랫폼: **시설 → 시설별 후원 물품 → 후원**. 아동 개인정보 0노출, 후원금 시설 전용계좌 직접 귀속, "100% 전달" 등 보장 문구 금지. 실결제는 전문가 검토 관문 뒤. (상세: `docs-for-프로젝트 문서/기획 문서`)

---

## 8. 현재 적용 상태

- 루트 지침: `AGENTS.md`, `CLAUDE.md`가 `design-system.md` + 이 문서를 기준으로 연결한다.
- 웹 기준: `donation-platform-front/components.json`의 shadcn alias는 `@/shared/ui`.
- Tauri 기준: `donation-admin-tauri/src/shared/ui`에 운영 콘솔용 primitive를 둔다.
- 외부 Astryx 패키지는 설치하지 않는다. 필요하면 신규 실험 화면에서만 별도 검토한다.
