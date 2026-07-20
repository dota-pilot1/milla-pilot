export type ProjectAreaId = "front" | "backend" | "admin" | "dev";

export type TodoTemplate = {
  id: string;
  label: string;
};

export type ProjectProfile = {
  id: ProjectAreaId;
  label: string;
  subtitle: string;
  repo: string;
  repoUrl: string;
  directory: string;
  role: string;
  runCommands: string[];
  copyBlocks: Array<{ label: string; value: string }>;
  todoTemplates: TodoTemplate[];
};

const REPO = "dota-pilot1/milla-pilot";
const REPO_URL = `https://github.com/${REPO}`;

export const PROJECT_PROFILES: readonly ProjectProfile[] = [
  {
    id: "front",
    label: "프론트",
    subtitle: "후원자 웹 서비스 (Next.js)",
    repo: REPO,
    repoUrl: REPO_URL,
    directory: "/Users/terecal/milla-pilot/donation-platform-front",
    role: "후원자 유입·참여·조회 UI 제공, 공개 서비스 화면 담당",
    runCommands: [
      "cd /Users/terecal/milla-pilot/donation-platform-front",
      "npm run dev",
      "npm run build",
    ],
    copyBlocks: [
      { label: "GitHub", value: REPO_URL },
      { label: "로컬 경로", value: "/Users/terecal/milla-pilot/donation-platform-front" },
      { label: "개발 실행", value: "cd /Users/terecal/milla-pilot/donation-platform-front && npm run dev" },
    ],
    todoTemplates: [
      { id: "front-nav-check", label: "헤더/내비게이션 노출 점검" },
      { id: "front-i18n-check", label: "문구/라벨 번역 키 적용 여부 확인" },
      { id: "front-build-check", label: "배포 전 npm run build 확인" },
    ],
  },
  {
    id: "backend",
    label: "백엔드",
    subtitle: "API 서버 (Spring Boot)",
    repo: REPO,
    repoUrl: REPO_URL,
    directory: "/Users/terecal/milla-pilot/donation-platform-server",
    role: "인증·권한·메뉴·후원·구매/배송 API 및 데이터 정합성 담당",
    runCommands: [
      "cd /Users/terecal/milla-pilot/donation-platform-server",
      "./gradlew bootRun",
      "./gradlew test",
    ],
    copyBlocks: [
      { label: "GitHub", value: REPO_URL },
      { label: "로컬 경로", value: "/Users/terecal/milla-pilot/donation-platform-server" },
      { label: "서버 실행", value: "cd /Users/terecal/milla-pilot/donation-platform-server && ./gradlew bootRun" },
    ],
    todoTemplates: [
      { id: "backend-menu-api", label: "/api/menus 응답 스키마 변경 영향 검토" },
      { id: "backend-auth-check", label: "권한(Role/Permission) 정책 테스트 케이스 확인" },
      { id: "backend-env-check", label: ".env/DB 연결값 최신화 확인" },
    ],
  },
  {
    id: "admin",
    label: "관리자 앱",
    subtitle: "Donation Admin Tauri",
    repo: REPO,
    repoUrl: REPO_URL,
    directory: "/Users/terecal/milla-pilot/donation-admin-tauri",
    role: "운영 콘솔(시설·후원·구매·권한·메뉴) 관리 UI 담당",
    runCommands: [
      "cd /Users/terecal/milla-pilot/donation-admin-tauri",
      "npm run dev",
      "npm run build",
    ],
    copyBlocks: [
      { label: "GitHub", value: REPO_URL },
      { label: "로컬 경로", value: "/Users/terecal/milla-pilot/donation-admin-tauri" },
      { label: "개발 실행", value: "cd /Users/terecal/milla-pilot/donation-admin-tauri && npm run dev" },
    ],
    todoTemplates: [
      { id: "admin-menu-sync", label: "DB 메뉴/사이드바 매핑 동기화 확인" },
      { id: "admin-dashboard-check", label: "대시보드 KPI/탭 UI 동작 점검" },
      { id: "admin-build-check", label: "릴리즈 전 npm run build 확인" },
    ],
  },
  {
    id: "dev",
    label: "개발 관리 앱",
    subtitle: "Milla Dev Task Tauri",
    repo: REPO,
    repoUrl: REPO_URL,
    directory: "/Users/terecal/milla-pilot/milla-dev-task-tauri",
    role: "개발 태스크 관리·내부 생산성 워크플로우 지원",
    runCommands: [
      "cd /Users/terecal/milla-pilot/milla-dev-task-tauri",
      "npm run dev",
      "npm run build",
    ],
    copyBlocks: [
      { label: "GitHub", value: REPO_URL },
      { label: "로컬 경로", value: "/Users/terecal/milla-pilot/milla-dev-task-tauri" },
      { label: "개발 실행", value: "cd /Users/terecal/milla-pilot/milla-dev-task-tauri && npm run dev" },
    ],
    todoTemplates: [
      { id: "dev-board-check", label: "태스크 보드 상태(우선순위/상태) 점검" },
      { id: "dev-notification-check", label: "알림/리마인더 동작 확인" },
      { id: "dev-build-check", label: "릴리즈 전 npm run build 확인" },
    ],
  },
];

