export type PermissionCategorySummary = {
  id: number;
  code: string;
  name: string;
};

export type PermissionCategory = PermissionCategorySummary & {
  description: string | null;
  displayOrder: number;
  createdAt: string;
};

export type Permission = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  category: PermissionCategorySummary | null;
  createdAt: string;
};

export type PermissionInput = {
  code?: string;
  name: string;
  description: string;
  categoryCode: string;
};
