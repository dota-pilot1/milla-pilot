# 화면 폭 설정 공통화

## 배경

후원자 웹 화면에서 각 페이지가 `max-w-* px-4 py-8`를 직접 들고 있으면 화면마다 좌우 여백이 다르게 보이고, 큰 모니터에서 콘텐츠가 지나치게 가운데로 몰리는 문제가 생긴다.

따라서 페이지 폭은 개별 페이지에서 임의로 정하지 않고, 웹 공통 UI primitive인 `PageShell`로 관리한다.

관련 구현:

- `donation-platform-front/src/shared/ui/PageShell.tsx`

## 공통 규칙

페이지 최상위 `main`은 직접 작성하지 말고 `PageShell`을 사용한다.

```tsx
import { PageShell } from "@/shared/ui/PageShell";

export default function Page() {
  return (
    <PageShell>
      <div className="space-y-6">...</div>
    </PageShell>
  );
}
```

`PageShell` 기본 클래스:

```tsx
mx-auto w-full px-4 py-8 sm:px-6 lg:px-8
```

폭 variant:

| variant | max width | 사용처 |
|---|---:|---|
| `default` | `max-w-6xl` | 일반 후원자 화면, 목록, 빈 상태, 카드 2~3열 |
| `content` | `max-w-4xl` | 상세/폼처럼 너무 넓으면 읽기 흐름이 깨지는 화면 |
| `wide` | `max-w-7xl` | 대시보드, 통계, 카드 4열 이상 화면 |

## 적용 기준

- 목록/탐색 화면은 기본적으로 `PageShell`을 사용한다.
- 카드가 2열 이상인 화면은 `max-w-3xl`, `max-w-4xl`처럼 좁게 제한하지 않는다.
- 상세 화면은 본문과 액션 패널이 함께 있을 때만 `content`를 우선 검토한다.
- 대시보드처럼 요약 카드가 4개 이상 있거나 표/현황 정보가 넓게 펼쳐지는 화면은 `wide`를 사용한다.
- 페이지 파일에서 `mx-auto w-full max-w-* px-4 py-8`를 직접 반복하지 않는다.

## 현재 적용 페이지

| 페이지 | 적용 폭 | 이유 |
|---|---|---|
| `/dashboard` | `PageShell width="wide"` | 요약 카드 4개와 시설별 현황을 넓게 보여준다. |
| `/donate` | `PageShell` | 시설 카드 목록 3열 탐색 화면이다. |
| `/donate/facility` | `PageShell` | 시설 요약 카드와 후원 물품 2열 카드가 있어 좁히지 않는다. |
| `/donate/item` | `PageShell width="content"` | 상세 설명과 후원 패널 중심이라 너무 넓으면 시선이 흐트러진다. |
| `/my-donations` | `PageShell` | 빈 상태 또는 후원 내역 리스트가 지나치게 좁아 보이지 않도록 기본 폭을 쓴다. |

## 점검 명령

페이지에서 폭 스타일을 직접 반복하는지 확인:

```bash
rg -n "<main className=\"mx-auto w-full max-w-|max-w-[0-9a-z\\[\\]-]+ px-4 py-8|mx-auto w-full max-w-[0-9a-z\\[\\]-]+ px-4" donation-platform-front/src/app donation-platform-front/src/features donation-platform-front/src/shared -S
```

UI primitive 직접 스타일 잔여 확인:

```bash
rg -n "<select|<textarea|<table|const field|const label" donation-platform-front/src/app donation-platform-front/src/features -S
```

## 주의

좌우 여백이 넓어 보인다고 해서 각 페이지에서 임의로 `max-w-*`를 수정하지 않는다. 먼저 화면 성격이 `default`, `content`, `wide` 중 어디에 맞는지 판단하고, 필요한 경우 `PageShell` variant를 추가한다.
