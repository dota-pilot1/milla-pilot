export type PermissionSummary = {
  id: number;
  code: string;
  name: string;
};

export type Role = {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  systemRole: boolean;
  permissions: PermissionSummary[];
};

export type CreateRoleInput = {
  code: string;
  name: string;
  description: string;
};

export type UpdateRoleInput = {
  name: string;
  description: string;
};

/** 서버 CreateRoleRequest의 @Pattern과 동일한 규칙. */
export const ROLE_CODE_PATTERN = /^ROLE_[A-Z][A-Z0-9_]*$/;
