import { apiRequest } from "../../../shared/api/client";
import type { Permission, PermissionCategory, PermissionInput } from "../../../entities/permission/model/types";

export function fetchPermissions(token: string) {
  return apiRequest<Permission[]>("/api/permissions", { token });
}

export function fetchPermissionCategories(token: string) {
  return apiRequest<PermissionCategory[]>("/api/permission-categories", { token });
}

export function createPermission(token: string, body: PermissionInput & { code: string }) {
  return apiRequest<Permission>("/api/permissions", { method: "POST", token, body });
}

export function updatePermission(token: string, id: number, body: Omit<PermissionInput, "code">) {
  return apiRequest<Permission>(`/api/permissions/${id}`, { method: "PATCH", token, body });
}

export function deletePermission(token: string, id: number) {
  return apiRequest<void>(`/api/permissions/${id}`, { method: "DELETE", token });
}
