import type { MenuRecord } from "../../../app/model/navigation";

export type AppMenuRecord = MenuRecord;

export type CreateMenuBody = {
  code: string;
  parentId: number | null;
  label: string;
  labelKey: string | null;
  path: string | null;
  icon: string | null;
  isExternal: boolean;
  requiredRole: string | null;
  requiredPermission: string | null;
  visible: boolean;
  displayOrder: number;
};

export type UpdateMenuBody = Omit<CreateMenuBody, "code">;

export type AppMenuItem = AppMenuRecord & {
  children: AppMenuItem[];
};
