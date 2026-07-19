import { apiRequest } from "../../../shared/api/client";
import type {
  CreateUserInput,
  ManagedUser,
  RoleOption,
  UpdateUserInput,
  UserPage,
} from "../../../entities/user/model/types";

export type UserListQuery = {
  q?: string;
  roleId?: number;
  active?: boolean;
  sort?: string;
  direction?: "asc" | "desc";
};

export function fetchUsers(token: string, page = 0, size = 20, query: UserListQuery = {}) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (query.q?.trim()) params.set("q", query.q.trim());
  if (query.roleId != null) params.set("roleId", String(query.roleId));
  if (query.active != null) params.set("active", String(query.active));
  if (query.sort) params.set("sort", query.sort);
  if (query.direction) params.set("direction", query.direction);
  return apiRequest<UserPage>(`/api/users?${params.toString()}`, { token });
}

export function createUser(token: string, body: CreateUserInput) {
  return apiRequest<ManagedUser>("/api/users", { method: "POST", token, body });
}

export function updateUser(token: string, id: number, body: UpdateUserInput) {
  return apiRequest<ManagedUser>(`/api/users/${id}`, { method: "PATCH", token, body });
}

export function changeUserRole(token: string, id: number, roleId: number) {
  return apiRequest<ManagedUser>(`/api/users/${id}/role`, {
    method: "PATCH",
    token,
    body: { roleId },
  });
}

export function toggleUserActive(token: string, id: number) {
  return apiRequest<ManagedUser>(`/api/users/${id}/active`, { method: "PATCH", token });
}

export function deleteUser(token: string, id: number) {
  return apiRequest<void>(`/api/users/${id}`, { method: "DELETE", token });
}

export function fetchRoles(token: string) {
  return apiRequest<RoleOption[]>("/api/roles", { token });
}
