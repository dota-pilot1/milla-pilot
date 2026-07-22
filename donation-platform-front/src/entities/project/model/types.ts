export type ProjectTaskGroup =
  | "PRE_LAUNCH_REQUIRED"
  | "UNDER_REVIEW"
  | "AFTER_PILOT";

export type ProjectTaskStatus = "TODO" | "DONE";

export interface ProjectTask {
  id: number;
  taskGroup: ProjectTaskGroup;
  status: ProjectTaskStatus;
  title: string;
  description: string | null;
  displayOrder: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectTaskPayload = {
  taskGroup: ProjectTaskGroup;
  title: string;
  description: string | null;
  displayOrder: number;
};

export const PROJECT_TASK_GROUP_LABEL: Record<ProjectTaskGroup, string> = {
  PRE_LAUNCH_REQUIRED: "실서비스 전 필수",
  UNDER_REVIEW: "검토 중",
  AFTER_PILOT: "파일럿 이후",
};

export const PROJECT_TASK_GROUP_NOTE: Record<ProjectTaskGroup, string> = {
  PRE_LAUNCH_REQUIRED: "본체 기능은 아니지만 실제 운영을 시작하려면 반드시 있어야 합니다.",
  UNDER_REVIEW: "운영 방식이 확정되지 않아 구현 범위에 아직 넣지 않았습니다.",
  AFTER_PILOT: "없어도 이행 루프는 동작합니다. 1차 MVP 검증 뒤 선택적으로 붙입니다.",
};

export const PROJECT_TASK_GROUP_VARIANT: Record<
  ProjectTaskGroup,
  "buying" | "shipping" | "muted"
> = {
  PRE_LAUNCH_REQUIRED: "buying",
  UNDER_REVIEW: "shipping",
  AFTER_PILOT: "muted",
};

export const PROJECT_TASK_GROUPS: ProjectTaskGroup[] = [
  "PRE_LAUNCH_REQUIRED",
  "UNDER_REVIEW",
  "AFTER_PILOT",
];
