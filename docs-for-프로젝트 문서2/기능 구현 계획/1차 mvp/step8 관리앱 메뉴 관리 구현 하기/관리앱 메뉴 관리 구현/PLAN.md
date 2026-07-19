# 관리앱 메뉴 관리 구현 계획

## 목표

Tauri 관리자 앱 안에서 사이드바 메뉴를 관리한다. 운영자가 `ADMIN_*` 계열 메뉴의 라벨, 경로, 아이콘, 권한, 표시 여부, 순서를 수정하면 앱 사이드바에 바로 반영되도록 한다.

## 대상 메뉴

- 포함: `DASHBOARD`, `ADMIN`, `ADMIN_*`
- 제외: `WEB_*`, donor-facing 웹 전용 메뉴
- `ADMIN_APP_MENU_MANAGEMENT`는 관리 화면 진입용 메뉴로 유지한다.

## 파일 배치

- `donation-admin-tauri/src/features/app-menu-management/api/appMenuApi.ts`
- `donation-admin-tauri/src/features/app-menu-management/model/types.ts`
- `donation-admin-tauri/src/features/app-menu-management/lib/menuTree.ts`
- `donation-admin-tauri/src/features/app-menu-management/ui/AppMenuManagementScreen.tsx`
- `donation-admin-tauri/src/features/app-menu-management/ui/AppMenuTreeSidebar.tsx`
- `donation-admin-tauri/src/features/app-menu-management/ui/AppMenuDetailPanel.tsx`
- `donation-admin-tauri/src/features/app-menu-management/ui/AppMenuFormDialog.tsx`
- `donation-admin-tauri/src/features/app-menu-management/ui/AppMenuContextMenu.tsx`

필요한 순수 UI가 없으면 `donation-admin-tauri/src/shared/ui`에 먼저 만든다. 화면 파일에서 원시 input/select/button 스타일을 길게 만들지 않는다.

## 화면 구조

```text
workspace-page
  workspace-hero compact
    앱 메뉴 관리
    관리자 앱 사이드바 메뉴를 편집합니다.

  Panel
    Header: 메뉴 수, 표시 중 수, 숨김 수, 새 메뉴 버튼
    Body:
      left: AppMenuTreeSidebar
      right: AppMenuDetailPanel 또는 EmptyState
```

## 주요 인터랙션

- 새 루트 메뉴 추가
- 선택 메뉴 아래 하위 메뉴 추가
- 메뉴 클릭 시 상세 패널 표시
- `MoreVertical` 컨텍스트 메뉴
  - 하위 메뉴 추가
  - 수정
  - 표시/숨김 전환
  - 삭제
- dnd-kit 순서 변경
  - MVP는 같은 부모 안에서만 허용
  - 순서 변경 시 optimistic update 후 저장 실패하면 이전 순서로 복구
- 삭제
  - 하위 메뉴가 있으면 기본 삭제 차단
  - 실무 흐름은 삭제보다 숨김 전환을 우선 안내

## API 전략

현재 사용 가능 API:

- `GET /api/menus`
- `POST /api/menus`
- `PATCH /api/menus/{id}`
- `DELETE /api/menus/{id}`

MVP는 기존 API만으로 구현한다. dnd-kit 순서 변경은 변경된 sibling만 `PATCH`한다.

추가 검토 API:

```http
PATCH /api/menus/reorder
```

요청 예시:

```json
{
  "parentId": 12,
  "items": [
    { "id": 31, "displayOrder": 0 },
    { "id": 32, "displayOrder": 1 }
  ]
}
```

배치 API를 추가하면 순서 저장의 중간 실패와 다중 요청 문제를 줄일 수 있다.

## 백엔드 보강 항목

- 부모 순환 검증
  - 자기 자신을 부모로 지정 금지
  - 자신의 descendant를 부모로 지정 금지
- 삭제 정책
  - 하위 메뉴가 있으면 삭제 차단
  - 숨김으로 대체하도록 에러 메시지 제공
- 권한
  - 읽기: 현재 공개 또는 로그인 후 조회 정책을 유지할지 확정
  - 쓰기: `ROLE_ADMIN`, `ROLE_PLATFORM_ADMIN`
- 정렬
  - 같은 부모 내 `displayOrder`, `id` 보조 정렬 권장

## Tauri 연결 지점

- `donation-admin-tauri/src/app/App.tsx`
  - `activeMenu === "ADMIN_APP_MENU_MANAGEMENT"`일 때 `AppMenuManagementScreen` 렌더링
  - 저장/삭제/순서 변경 성공 후 `refreshWorkspace()` 또는 메뉴 재조회 콜백 호출
- `donation-admin-tauri/src/app/model/navigation.ts`
  - 관리 화면 라벨/아이콘/설명 유지
  - 메뉴 관리 화면에서는 실제 DB 트리를 보여주고, 사이드바 출력은 기존 `toTauriSidebarMenus` 정책을 유지

## 사전 고정 사항 (MVP 안정화)

1. 분리 기준 단일화
   - prefix 규칙(`ADMIN_*`, `WEB_*`)은 유지하되, 필터 기준은 공통 유틸로 한 곳에서만 관리한다.
   - 예: `isAdminAppMenu(menu)`, `isWebMenu(menu)`를 공통 모듈로 두고 화면/사이드바/헤더가 동일 기준을 사용한다.

2. 정렬/순서 저장 안정화
   - dnd는 같은 부모 안에서만 허용한다.
   - optimistic update 실패 시 롤백은 필수로 유지한다.
   - 가능하면 초기에 `PATCH /api/menus/reorder` 배치 API를 추가해 다중 PATCH 중간 실패를 줄인다.

3. 삭제 정책 통일
   - 하위 메뉴가 있으면 삭제를 차단한다.
   - 운영 UX는 삭제보다 숨김 전환을 우선 안내한다.
   - 에러 메시지/토스트 문구를 웹/앱에서 동일 규칙으로 맞춘다.

4. 반영 지점 명확화
   - 저장 성공 후 `refreshWorkspace()`(Tauri)로 사이드바 재조회 트리거를 보장한다.
   - 메뉴 변경이 즉시 보이지 않으면 화면 내 명시적 새로고침 액션도 제공한다.

## UI 규칙

- `Panel`, `Button`, `Input`, `Select`, `Textarea`, `Checkbox`, `FormField`, `EmptyState` 재사용
- 아이콘은 `lucide-react`
- Tauri 화면/feature 파일에서는 상태색을 직접 칠하지 않는다.
- 컨트롤 간격은 기존 관리자 CRUD 템플릿 기준을 따른다.
- 참고 프로젝트의 구조는 참고하되 `bg-brand-*`, `ui-text-*` 같은 외부 토큰은 가져오지 않는다.

## 완료 기준

- 앱 메뉴 관리 화면에서 `ADMIN_*` 메뉴만 보인다.
- 메뉴 추가/수정/숨김/삭제 차단/순서 변경이 동작한다.
- 순서 변경 후 앱 사이드바가 갱신된다.
- 하위 메뉴가 있는 메뉴 삭제 시 명확한 안내가 나온다.
- 타입 체크와 빌드가 통과한다.
- UI 작업 후 primitive 반복 스타일 검색을 통과한다.
