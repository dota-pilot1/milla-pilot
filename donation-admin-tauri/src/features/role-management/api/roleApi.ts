import { apiRequest } from "../../../shared/api/client";
import type { CreateRoleInput, PermissionSummary, Role, UpdateRoleInput } from "../../../entities/role/model/types";

export function fetchRoles(token: string) {
  return apiRequest<Role[]>("/api/roles", { token });
}

export function createRole(token: string, body: CreateRoleInput) {
  return apiRequest<Role>("/api/roles", { method: "POST", token, body });
}

export function updateRole(token: string, id: number, body: UpdateRoleInput) {
  return apiRequest<Role>(`/api/roles/${id}`, { method: "PATCH", token, body });
}

export function deleteRole(token: string, id: number) {
  return apiRequest<void>(`/api/roles/${id}`, { method: "DELETE", token });
}

export function fetchRolePermissions(token: string, id: number) {
  return apiRequest<PermissionSummary[]>(`/api/roles/${id}/permissions`, { token });
}

export function setRolePermissions(token: string, id: number, permissionIds: number[]) {
  return apiRequest<Role>(`/api/roles/${id}/permissions`, { method: "PUT", token, body: permissionIds });
}
