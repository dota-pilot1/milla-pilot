import type { AppMenuItem, AppMenuRecord } from "../model/types";

export function buildMenuTree(flat: AppMenuRecord[]) {
  const map = new Map<number, AppMenuItem>();
  flat.forEach((menu) => map.set(menu.id, { ...menu, children: [] }));

  const roots: AppMenuItem[] = [];
  map.forEach((item) => {
    if (item.parentId == null) {
      roots.push(item);
      return;
    }
    map.get(item.parentId)?.children.push(item);
  });

  const sort = (items: AppMenuItem[]) => {
    items.sort((a, b) => a.displayOrder - b.displayOrder || a.id - b.id);
    items.forEach((item) => sort(item.children));
  };

  sort(roots);
  return roots;
}

export function flattenTree(items: AppMenuItem[]): AppMenuItem[] {
  return items.flatMap((item) => [item, ...flattenTree(item.children)]);
}

export function collectDescendantIds(flat: AppMenuRecord[], parentId: number): number[] {
  const children = flat.filter((menu) => menu.parentId === parentId);
  return children.flatMap((child) => [child.id, ...collectDescendantIds(flat, child.id)]);
}
