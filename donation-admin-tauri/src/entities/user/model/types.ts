export type RoleSummary = {
  id: number;
  code: string;
  name: string;
};

export type RoleOption = RoleSummary & {
  description?: string | null;
  systemRole?: boolean;
};

export type UserSummary = {
  id: number;
  email: string;
  username: string;
  role: RoleSummary;
  permissions: string[];
  createdAt?: string;
};

export type ManagedUser = {
  id: number;
  email: string;
  username: string;
  role: RoleSummary;
  active: boolean;
  createdAt: string;
};

export type UserPage = {
  content: ManagedUser[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type CreateUserInput = {
  email: string;
  password: string;
  username: string;
  roleId: number;
};

export type UpdateUserInput = {
  email: string;
  username: string;
};

export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresInSec: number;
  user: UserSummary;
};
