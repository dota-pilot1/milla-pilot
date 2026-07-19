export type MenuLike = { code: string };

export type MenuScope = "web" | "admin-app";

export function isAdminAppMenu(menu: MenuLike) {
  return menu.code === "DASHBOARD" || menu.code === "ADMIN" || menu.code.startsWith("ADMIN_");
}

export function isWebMenu(menu: MenuLike) {
  if (menu.code === "PROJECT_INTRO") return true;
  if (menu.code === "DASHBOARD") return true;
  if (menu.code === "ADMIN" || menu.code.startsWith("ADMIN_")) return false;
  return true;
}

export function matchesMenuScope(menu: MenuLike, scope: MenuScope) {
  return scope === "admin-app" ? isAdminAppMenu(menu) : isWebMenu(menu);
}
