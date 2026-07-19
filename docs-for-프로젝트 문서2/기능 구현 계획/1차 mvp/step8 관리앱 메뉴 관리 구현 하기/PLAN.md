# Step8 관리앱 메뉴 관리 구현 계획

## 목표

관리자 Tauri 앱에서 DB 기반 사이드바 메뉴를 직접 관리할 수 있게 한다. 메뉴 생성, 수정, 삭제, 표시 여부, 역할/권한, 아이콘, 경로, 부모-자식 구조, 같은 부모 내 순서 변경을 지원하고, 변경 결과가 관리자 앱 사이드바와 클라이언트 웹 헤더 메뉴에 각각 일관되게 반영되도록 정리한다.

## 현재 상태

- 백엔드에는 `menus` 도메인과 `/api/menus` CRUD가 이미 있다.
- `MenuSeeder`가 웹 메뉴, 관리자 메뉴, `ADMIN_APP_MENU_MANAGEMENT` 기본 데이터를 upsert한다.
- `donation-admin-tauri`는 `/api/menus`를 읽어 사이드바를 구성하지만, 앱 안에서 메뉴를 편집하는 화면은 아직 연결되지 않았다.
- `donation-platform-front`에는 `menu-management` 화면과 dnd-kit 기반 트리 UI가 있으나, 관리자 Tauri 앱 기준 primitive/FSD 규칙과 분리 정책을 다시 맞출 필요가 있다.
- 참고 프로젝트 `/Users/terecal/towercrane-for-uiux/towercrane-for-uiux-front`의 `MenuAdminPage`, `AdminShellSidebar`는 왼쪽 트리/사이드바 + dnd-kit 순서 변경 + 오른쪽 편집 패널 구조 참고용으로 적합하다.

## 구현 방향

메뉴 관리는 두 화면으로 분리한다.

1. 관리앱 메뉴 관리: Tauri 관리자 앱 사이드바에 표시되는 `DASHBOARD`, `ADMIN`, `ADMIN_*` 메뉴를 관리한다.
2. 클라이언트 웹 메뉴 관리: donor-facing 웹 헤더/모바일 메뉴에 표시되는 `WEB_*`, `PROJECT_INTRO` 등 웹 메뉴를 관리한다.

두 화면 모두 같은 `menus` 테이블을 사용하되, 화면별 필터와 설명을 명확히 분리한다. 공통 백엔드 API는 재사용하고, 필요하면 순서 저장 전용 API를 추가한다.

## UX 골격

- 좌측: 사이드바형 메뉴 트리
  - 루트/하위 메뉴 계층 표시
  - dnd-kit으로 같은 부모 내 순서 변경
  - 확장/접기
  - 표시/숨김, 외부 링크, 권한 상태 아이콘
  - 항목 우클릭 또는 `MoreVertical` 버튼 컨텍스트 메뉴: 하위 메뉴 추가, 수정, 복제 후보, 숨김/표시, 삭제
- 우측: 선택 메뉴 상세 편집 패널
  - 코드, 라벨, i18n 키, 경로, 아이콘, 부모 메뉴, 표시 순서
  - 외부 링크 여부, 표시 여부
  - 필요 역할, 필요 권한
  - 저장/삭제 액션
- 상단: 메뉴 타입 필터와 상태 요약
  - 관리앱 메뉴 / 웹 메뉴
  - 전체, 표시 중, 숨김, 권한 필요

## 구현 순서

1. 백엔드 API 보강
   - 현재 CRUD로 구현 가능한 범위를 먼저 확인한다.
   - 순서 변경은 개별 PATCH 다중 호출로 시작할 수 있으나, 최종적으로는 배치 reorder API를 검토한다.
   - 자기 자신/하위 항목을 부모로 지정하는 순환 구조 방지 검증을 추가한다.
   - 하위 메뉴가 있는 삭제 정책을 명확히 한다. MVP는 삭제 차단 또는 숨김 전환을 기본으로 둔다.

2. Tauri 관리앱 메뉴 관리 화면 구현
   - `ADMIN_APP_MENU_MANAGEMENT` 라우팅을 실제 화면으로 연결한다.
   - `donation-admin-tauri/src/features/app-menu-management` 하위에 API/model/ui를 둔다.
   - `shared/ui`의 `Panel`, `Button`, `Input`, `Select`, `Textarea`, `Checkbox`, `FormField`, `EmptyState`를 사용한다.
   - dnd-kit으로 같은 부모 내 순서 변경을 구현한다.
   - 수정/삭제/숨김 액션은 컨텍스트 메뉴 또는 `MoreVertical` 메뉴로 제공한다.
   - 저장 후 `App.tsx`의 메뉴 재조회 흐름과 사이드바 갱신을 연결한다.

3. 클라이언트 웹 메뉴 관리 정리
   - 기존 `donation-platform-front/src/features/menu-management`를 웹 메뉴 전용으로 정리한다.
   - 웹 헤더에 노출되는 메뉴만 필터링하고, 관리자 앱 메뉴와 섞이지 않게 한다.
   - raw `<select>`, `<input>`, 직접 버튼 스타일을 shared primitive로 정리한다.
   - 헤더와 모바일 메뉴 반영 기준을 문서화한다.

4. 검증
   - 백엔드 단위/통합 테스트: 생성, 수정, 삭제 차단, 순환 부모 방지, 순서 변경.
   - Tauri 타입 체크/빌드.
   - 웹 타입 체크/빌드.
   - UI 작업 후 `rg "<select|<textarea|<table|const field|const label"`로 반복 primitive 스타일 잔존 여부 확인.
   - 백엔드 서버 재시작과 실제 endpoint 확인은 기본적으로 사용자에게 넘긴다. 에이전트가 직접 확인해야 할 때만 임시 실행하고 종료한다.

## MVP 범위

- 메뉴 트리 조회
- 메뉴 생성
- 메뉴 수정
- 메뉴 숨김/표시
- 메뉴 삭제 또는 삭제 차단 안내
- 같은 부모 안에서 dnd-kit 순서 변경
- 관리자 앱 메뉴/웹 메뉴 필터 분리
- 변경 후 사이드바 또는 웹 헤더 재조회

## 이후 확장

- 부모 변경 드래그앤드롭
- 메뉴 복제
- 아이콘 선택 팔레트
- 역할/권한 선택을 실제 역할/권한 API와 연결
- 변경 이력/감사 로그
- 메뉴별 접근 정책 미리보기
