# Project Instructions (Claude)

**먼저 `/docs/design-system.md`(시각 언어 — 색·간격·타이포·상태색)와 `/docs/frontend-conventions.md`(만드는 규칙 — 핵심 원칙·FSD 배치·primitive 규약·인터랙션·화면 템플릿·AI 작업 점검)를 읽고 따른다.**

Astryx는 패키지를 설치해 도입하지 않는다. 이 프로젝트는 Astryx의 **AI가 읽고 따르는 디자인 시스템 운영 방식만** 가져온다. 사용자가 별도 실험을 명시하지 않으면 Astryx/StyleX 마이그레이션 금지.

핵심 요약:
- 깔끔·모던, shadcn/ui **new-york** 톤. 시맨틱 토큰만 사용 — raw Tailwind 팔레트(`bg-emerald-500` 등) 금지.
- **공통 컴포넌트 우선.** primitive가 있으면 페이지/피처에서 `<button>`·`<input>`·`<select>`·테이블 스타일을 인라인으로 새로 만들지 않는다. 없으면 `src/shared/ui`에 만들고 재사용.
- FSD 배치: 순수 UI = `src/shared/ui`, 도메인 표시 = `src/entities/{domain}/ui`, 행동 흐름 = `src/features/{feature}/ui`. 페이지는 조립만.
- **간격 빡빡하게 하지 말 것.** 페이지 `py-8`, 카드 `p-5 rounded-xl`, 섹션 `space-y-6`, 그리드 `gap-5`, 폼 필드 `space-y-4`. (스케일은 design-system.md 2절)
- 아이콘 `lucide-react`, className 병합 `cn()`(`@/shared/lib/utils`), variant `cva`.
- UI 작업 후 feature/page 파일에 원시 `<select>`, `<textarea>`, `<table>`, `const field`, `const label` 같은 반복 스타일이 남았는지 검색한다.

## 에이전트 운영 정책

- **백엔드 서버의 재시작·테스트는 사용자 몫이다.** 기본적으로 Claude는 서버를 켜지 않는다. 코드 변경 후에는 "사용자가 재시작해서 확인하세요"로 넘긴다.
- **예외 — Claude가 직접 검증할 때만** 서버를 임시로 켠다(예: 동시성·엔드포인트 실호출 검증). 그리고 그 **검증이 끝나면 반드시 다시 종료해 포트(4301)를 비운다** — 그래야 사용자가 자기 방식으로 재시작해서 테스트할 수 있다.
- 서버를 상시 켜두지 않는다. 사용자의 수동 `./gradlew bootRun`과 포트 충돌을 만들지 않는다.

프로젝트 구조: Spring(DDD) 공유 백엔드 + `donation-admin-tauri`(관리·CRUD) + `donation-platform-front`(웹·Next.js). 시설/물품 등 관리는 Tauri, 후원자 대면 출력은 웹.
