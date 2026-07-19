# 클라이언트 웹 메뉴 관리 구현 계획

## 목표

donor-facing 웹 헤더와 모바일 메뉴에 표시되는 메뉴를 관리한다. 관리자 앱 메뉴와 분리해서 웹 사용자가 볼 메뉴만 생성, 수정, 숨김, 순서 변경할 수 있게 한다.

## 대상 메뉴

- 포함: `PROJECT_INTRO`, `WEB_*`
- 조건부 포함: 웹 헤더에 노출할 필요가 있는 비관리 메뉴
- 제외: `DASHBOARD`, `ADMIN`, `ADMIN_*`

현재 헤더는 `donation-platform-front/src/widgets/header/ui/Header.tsx`에서 `/api/menus`를 조회하고 `isWebMenu()`로 필터링한다. 이 필터 기준을 메뉴 관리 화면과 맞춘다.

## 현재 코드 정리 필요점

- `donation-platform-front/src/features/menu-management/MenuTreeTab.tsx`에 dnd-kit 트리 UI가 이미 있다.
- 일부 폼/버튼/select/input 스타일이 feature 파일 안에 직접 작성되어 있다.
- `MenuFormDialog`도 raw select/input 스타일을 사용한다.
- 계획 구현 시 `shared/ui` primitive를 먼저 확인하고, 필요한 primitive가 없으면 `shared/ui`에 만든다.

## 파일 배치

- 유지/정리:
  - `donation-platform-front/src/entities/menu/api/menuApi.ts`
  - `donation-platform-front/src/entities/menu/model/types.ts`
  - `donation-platform-front/src/features/menu-management/*`
  - `donation-platform-front/src/app/menu-management/page.tsx`
- 필요 시 추가:
  - `donation-platform-front/src/entities/menu/lib/menuTree.ts`
  - `donation-platform-front/src/features/menu-management/ui/WebMenuTreeSidebar.tsx`
  - `donation-platform-front/src/features/menu-management/ui/WebMenuDetailPanel.tsx`
  - `donation-platform-front/src/features/menu-management/ui/WebMenuContextMenu.tsx`

## 화면 구조

```text
PageHeader
  웹 메뉴 관리
  웹 헤더와 모바일 메뉴에 표시되는 항목을 관리합니다.

Panel/Card
  left: 웹 메뉴 트리
  right: 상세 편집 패널
```

## 주요 인터랙션

- 웹 루트 메뉴 추가
- 하위 메뉴 추가
- 메뉴 선택 후 상세 수정
- dnd-kit으로 같은 부모 내 순서 변경
- 표시/숨김 전환
- 외부 링크 여부 설정
- 컨텍스트 메뉴
  - 하위 메뉴 추가
  - 수정
  - 표시/숨김
  - 삭제

## 헤더 반영 기준

- `/api/menus` 응답에서 웹 메뉴만 필터링한다.
- `visible=false`는 헤더/모바일 메뉴에서 숨긴다.
- `displayOrder` 기준으로 정렬한다.
- `parentId`로 드롭다운 또는 하위 메뉴를 구성한다.
- `isExternal=true`이면 외부 링크 아이콘과 새 탭 정책을 적용한다.
- `requiredRole`이 있는 웹 메뉴는 로그인/권한 상태와 충돌하지 않게 별도 검토한다. MVP donor-facing 메뉴는 가능한 공개 메뉴 위주로 둔다.

## 백엔드/API

MVP는 기존 `/api/menus` CRUD를 사용한다.

추가 검토:

- 웹/앱 메뉴 타입을 명시하는 `menuScope` 필드
- 배치 순서 변경 API
- 메뉴 조회 endpoint 분리
  - `GET /api/menus/web`
  - `GET /api/menus/admin-app`

현재는 코드 prefix 규칙으로 분리하고, 추후 DB 필드로 명확히 분리한다.

## 사전 고정 사항 (MVP 안정화)

1. 분리 기준 단일화
   - prefix 규칙(`WEB_*`, `ADMIN_*`)은 유지하되, 필터 기준은 공통 유틸로 통일한다.
   - `Header.tsx`, 메뉴 관리 화면, Tauri 앱이 같은 `isWebMenu()/isAdminAppMenu()` 기준을 공유한다.

2. 정렬/순서 저장 안정화
   - dnd는 같은 부모 내 이동만 허용한다.
   - optimistic update 후 저장 실패 시 반드시 롤백한다.
   - 가능하면 `PATCH /api/menus/reorder` 배치 API를 우선 도입해 순서 저장 안정성을 높인다.

3. 삭제 정책 통일
   - 하위 메뉴가 있는 항목은 삭제 차단, 숨김 전환을 우선 안내한다.
   - 삭제/숨김 정책 문구와 에러 처리 방식을 관리앱과 동일하게 맞춘다.

4. 반영 지점 명확화
   - 저장 성공 후 웹 헤더/모바일 메뉴 재조회 트리거를 명시적으로 호출한다.
   - Tauri의 `refreshWorkspace()`와 동일한 역할의 재동기화 훅을 웹에도 둔다.

## UI 규칙

- shadcn/ui new-york 스타일과 Tailwind semantic token만 사용한다.
- raw palette 사용 금지.
- 원시 `<select>`, `<textarea>`, `<table>` 직접 스타일링을 남기지 않는다.
- `cn()`으로 className을 병합한다.
- 버튼에는 가능한 lucide 아이콘을 함께 사용한다.

## 완료 기준

- 웹 메뉴 관리 화면에서 웹 메뉴만 보인다.
- 추가/수정/숨김/삭제/순서 변경이 가능하다.
- 헤더와 모바일 메뉴가 변경 후 재조회 기준으로 반영된다.
- 관리자 앱 메뉴가 웹 메뉴 관리 화면에 섞이지 않는다.
- `rg "<select|<textarea|<table|const field|const label"` 점검에서 새 반복 스타일이 남지 않는다.
- 타입 체크와 빌드가 통과한다.
