import { apiRequest } from "../../../shared/api/client";
import type { AppMenuRecord, CreateMenuBody, UpdateMenuBody } from "../model/types";

export const appMenuApi = {
  getAll: (token: string) => apiRequest<AppMenuRecord[]>("/api/menus", { token }),
  create: (token: string, body: CreateMenuBody) =>
    apiRequest<AppMenuRecord>("/api/menus", { method: "POST", token, body }),
  update: (token: string, id: number, body: UpdateMenuBody) =>
    apiRequest<AppMenuRecord>(`/api/menus/${id}`, { method: "PATCH", token, body }),
  delete: (token: string, id: number) =>
    apiRequest<void>(`/api/menus/${id}`, { method: "DELETE", token }),
};
