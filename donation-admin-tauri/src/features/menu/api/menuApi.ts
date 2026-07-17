import type { MenuRecord } from "../../../app/model/navigation";
import { apiRequest } from "../../../shared/api/client";

export function fetchMenus(token: string) {
  return apiRequest<MenuRecord[]>("/api/menus", { token });
}
