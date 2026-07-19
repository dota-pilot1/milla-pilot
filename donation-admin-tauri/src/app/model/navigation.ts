import {
  BadgeCheck,
  Building2,
  FileText,
  HandCoins,
  KeyRound,
  LayoutDashboard,
  Menu,
  MonitorCog,
  PackagePlus,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Truck,
  UserCircle,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { UserSummary } from "../../entities/user/model/types";

export type MenuRecord = {
  id: number;
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

export type MenuItem = MenuRecord & {
  children: MenuItem[];
};

export type AdminMenu = {
  id: string;
  code: string;
  label: string;
  subtitle: string;
  icon: LucideIcon;
  path: string | null;
  children: AdminMenu[];
};

export const PROFILE_MENU: AdminMenu = {
  id: "profile",
  code: "PROFILE",
  label: "프로필",
  subtitle: "계정 정보",
  icon: UserCircle,
  path: null,
  children: [],
};

export const SETTINGS_MENU: AdminMenu = {
  id: "settings",
  code: "SETTINGS",
  label: "설정",
  subtitle: "앱 환경",
  icon: Settings,
  path: null,
  children: [],
};

export const iconByCode: Record<string, LucideIcon> = {
  DASHBOARD: LayoutDashboard,
  ADMIN: Settings,
  ADMIN_FACILITY: Building2,
  ADMIN_DONATION: HandCoins,
  ADMIN_PURCHASE: ShoppingCart,
  ADMIN_SYSTEM: Settings,
  ADMIN_FACILITIES: Building2,
  ADMIN_DONATION_ITEMS: PackagePlus,
  ADMIN_FUNDING_CAMPAIGNS: HandCoins,
  ADMIN_CONTRIBUTIONS: ReceiptText,
  ADMIN_PURCHASE_ORDERS: ShoppingCart,
  ADMIN_DELIVERY_TRACKING: Truck,
  ADMIN_RECEIPTS: FileText,
  ADMIN_USERS: Users,
  ADMIN_ROLES: BadgeCheck,
  ADMIN_PERMISSIONS: KeyRound,
  ADMIN_ROLE_PERMISSIONS: ShieldCheck,
  ADMIN_SITE_SETTINGS: MonitorCog,
  ADMIN_SCREEN_SETTINGS: MonitorCog,
  ADMIN_NAV_MANAGEMENT: Menu,
  ADMIN_MENU_MANAGEMENT: Menu,
  ADMIN_APP_MENU_MANAGEMENT: SlidersHorizontal,
  ADMIN_ACCESS_POLICY: ShieldCheck,
  ADMIN_EXPERIENCE_SETTINGS: MonitorCog,
};

const subtitles: Record<string, string> = {
  DASHBOARD: "운영 현황",
  ADMIN_FACILITY: "시설과 요청 물품",
  ADMIN_DONATION: "후원 원장과 증빙",
  ADMIN_PURCHASE: "구매와 배송 처리",
  ADMIN_SYSTEM: "계정 · 권한 · 설정",
  ADMIN_FACILITIES: "시설 기본 정보",
  ADMIN_DONATION_ITEMS: "시설 요청 물품",
  ADMIN_FUNDING_CAMPAIGNS: "공동구매 펀딩",
  ADMIN_CONTRIBUTIONS: "후원 결제 내역",
  ADMIN_PURCHASE_ORDERS: "통합 구매 처리",
  ADMIN_PURCHASE_PENDING: "구매 실행 대기",
  ADMIN_PURCHASE_COMPLETED: "구매 이력과 배송 처리",
  ADMIN_DELIVERY_TRACKING: "배송과 수령 상태",
  ADMIN_RECEIPTS: "영수증과 증빙",
  ADMIN_USERS: "회원 계정",
  ADMIN_ROLES: "역할 코드",
  ADMIN_PERMISSIONS: "권한 코드",
  ADMIN_ROLE_PERMISSIONS: "역할별 권한",
  ADMIN_SITE_SETTINGS: "서비스 설정",
  ADMIN_MENU_MANAGEMENT: "웹 헤더 메뉴",
  ADMIN_APP_MENU_MANAGEMENT: "관리자 앱 사이드바",
  ADMIN_ACCESS_POLICY: "역할과 권한 정책",
  ADMIN_EXPERIENCE_SETTINGS: "웹·앱 화면 설정",
};

const TAURI_APP_MENU_MANAGEMENT: AdminMenu = {
  id: "ADMIN_APP_MENU_MANAGEMENT",
  code: "ADMIN_APP_MENU_MANAGEMENT",
  label: "앱 메뉴 관리",
  subtitle: subtitles.ADMIN_APP_MENU_MANAGEMENT,
  icon: iconByCode.ADMIN_APP_MENU_MANAGEMENT,
  path: "/app-menu-management",
  children: [],
};

export function buildTree(flat: MenuRecord[], user: UserSummary | null): MenuItem[] {
  const roleCode = user?.role.code ?? null;
  const visible = flat.filter(
    (m) => m.visible && isAdminAppMenu(m) && canAccessRole(roleCode, m.requiredRole)
  );
  const map = new Map<number, MenuItem>();
  visible.forEach((m) => map.set(m.id, { ...m, children: [] }));

  const roots: MenuItem[] = [];
  map.forEach((item) => {
    if (item.parentId === null) {
      roots.push(item);
    } else {
      map.get(item.parentId)?.children.push(item);
    }
  });

  const sort = (items: MenuItem[]) =>
    items.sort((a, b) => a.displayOrder - b.displayOrder);
  map.forEach((item) => sort(item.children));
  return sort(roots);
}

function isAdminAppMenu(menu: MenuRecord) {
  return menu.code === "DASHBOARD" || menu.code === "ADMIN" || menu.code.startsWith("ADMIN_");
}

function canAccessRole(userRole: string | null, requiredRole: string | null) {
  if (!requiredRole) return true;
  if (!userRole) return false;
  if (userRole === requiredRole) return true;
  if (requiredRole === "ROLE_ADMIN" && userRole === "ROLE_PLATFORM_ADMIN") return true;
  if (requiredRole === "ROLE_PLATFORM_ADMIN" && userRole === "ROLE_ADMIN") return true;
  return false;
}

export function toAdminMenu(item: MenuItem): AdminMenu {
  return {
    id: item.code,
    code: item.code,
    label: item.label,
    subtitle: subtitles[item.code] ?? "관리 기능",
    icon: iconByCode[item.code] ?? Menu,
    path: item.path,
    children: item.children.map(toAdminMenu),
  };
}

export function toTauriSidebarMenus(menus: AdminMenu[]): AdminMenu[] {
  const topLevel = menus.flatMap((menu) => (menu.code === "ADMIN" ? menu.children : [menu]));
  const all = flattenMenus(topLevel);
  const byCode = new Map(all.map((menu) => [menu.code, menu]));

  const cloneLeaf = (code: string, label?: string): AdminMenu | null => {
    const menu = byCode.get(code);
    if (!menu) return null;
    return {
      ...menu,
      label: label ?? menu.label,
      children: [],
    };
  };

  const makeGroup = (
    code: string,
    label: string,
    subtitle: string,
    icon: LucideIcon,
    children: Array<AdminMenu | null>,
  ): AdminMenu | null => {
    const visibleChildren = children.filter(Boolean) as AdminMenu[];
    if (!visibleChildren.length) return null;
    return {
      id: code,
      code,
      label,
      subtitle,
      icon,
      path: null,
      children: visibleChildren,
    };
  };

  const facilities = byCode.get("ADMIN_FACILITY");
  const donation = byCode.get("ADMIN_DONATION");
  const purchase = byCode.get("ADMIN_PURCHASE");
  const purchaseOrders = byCode.get("ADMIN_PURCHASE_ORDERS");
  const users = cloneLeaf("ADMIN_USERS");
  const hasSystemAccess = Boolean(byCode.get("ADMIN_SYSTEM"));

  const purchasePending: AdminMenu | null = purchaseOrders
    ? {
        ...purchaseOrders,
        id: "ADMIN_PURCHASE_PENDING",
        code: "ADMIN_PURCHASE_PENDING",
        label: "통합 구매 대기",
        subtitle: subtitles.ADMIN_PURCHASE_PENDING,
        children: [],
      }
    : null;

  const purchaseCompleted: AdminMenu | null = purchaseOrders
    ? {
        ...purchaseOrders,
        id: "ADMIN_PURCHASE_COMPLETED",
        code: "ADMIN_PURCHASE_COMPLETED",
        label: "통합 구매 완료",
        subtitle: subtitles.ADMIN_PURCHASE_COMPLETED,
        children: [],
      }
    : null;

  const purchaseGroup = purchase
    ? {
        ...purchase,
        children:
          purchasePending || purchaseCompleted
            ? [purchasePending, purchaseCompleted, ...purchase.children.filter((child) => child.code !== "ADMIN_PURCHASE_ORDERS")].filter(
                Boolean,
              ) as AdminMenu[]
            : purchase.children,
      }
    : null;

  const accessPolicy = makeGroup(
    "ADMIN_ACCESS_POLICY",
    "권한·정책",
    subtitles.ADMIN_ACCESS_POLICY,
    iconByCode.ADMIN_ACCESS_POLICY,
    [
      cloneLeaf("ADMIN_ROLES"),
      cloneLeaf("ADMIN_PERMISSIONS"),
      cloneLeaf("ADMIN_ROLE_PERMISSIONS"),
    ],
  );

  const experienceSettings = makeGroup(
    "ADMIN_EXPERIENCE_SETTINGS",
    "화면·메뉴 설정",
    subtitles.ADMIN_EXPERIENCE_SETTINGS,
    iconByCode.ADMIN_EXPERIENCE_SETTINGS,
    [
      cloneLeaf("ADMIN_SITE_SETTINGS"),
      cloneLeaf("ADMIN_MENU_MANAGEMENT", "웹 메뉴 관리"),
      cloneLeaf("ADMIN_APP_MENU_MANAGEMENT") ?? (hasSystemAccess ? TAURI_APP_MENU_MANAGEMENT : null),
    ],
  );

  const preferred = [
    byCode.get("DASHBOARD"),
    users,
    facilities,
    donation,
    purchaseGroup,
    accessPolicy,
    experienceSettings,
  ].filter(Boolean) as AdminMenu[];

  const preferredCodes = new Set(flattenMenus(preferred).map((menu) => menu.code));
  const leftovers = topLevel.filter((menu) => !preferredCodes.has(menu.code) && menu.code !== "ADMIN_SYSTEM");

  return [...preferred, ...leftovers];
}

export function flattenMenus(menus: AdminMenu[]): AdminMenu[] {
  return menus.flatMap((menu) => [menu, ...flattenMenus(menu.children)]);
}

export function canAccessMenu(user: UserSummary | null, menuId: string) {
  if (!user) return false;
  if (menuId === PROFILE_MENU.id || menuId === SETTINGS_MENU.id) return true;
  return ["ROLE_ADMIN", "ROLE_PLATFORM_ADMIN", "ROLE_MANAGER"].includes(user.role.code);
}
