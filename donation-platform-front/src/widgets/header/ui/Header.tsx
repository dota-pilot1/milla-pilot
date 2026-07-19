"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BadgeCheck,
  Building2,
  ChevronDown,
  FileText,
  HandCoins,
  Info,
  KeyRound,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MonitorCog,
  PackagePlus,
  ReceiptText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Truck,
  UserCircle,
  UserPlus,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth, authActions } from "@/entities/user/model/authStore";
import { menuApi } from "@/entities/menu/api/menuApi";
import type { MenuItem, MenuRecord } from "@/entities/menu/model/types";
import { RoleBadge } from "@/features/user-management/RoleBadge";
import { Button } from "@/shared/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/Dialog";
import { LanguageSelect } from "@/shared/ui/LanguageSelect";
import { ThemeSwitcher } from "@/shared/ui/theme/ThemeSwitcher";
import { cn } from "@/shared/lib/utils";

function buildTree(flat: MenuRecord[], userRole: string | null): MenuItem[] {
  const visible = flat.filter(
    (m) => m.visible && isWebMenu(m) && (!m.requiredRole || m.requiredRole === userRole)
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

function isWebMenu(menu: MenuRecord) {
  if (menu.code === "PROJECT_INTRO") return true;
  if (menu.code === "DASHBOARD") return true;
  if (menu.code === "ADMIN" || menu.code.startsWith("ADMIN_")) return false;
  return true;
}

const menuIcons: Record<string, LucideIcon> = {
  PROJECT_INTRO: Info,
  DASHBOARD: LayoutDashboard,
  WEB_DONATION: HandCoins,
  WEB_DONATE: HandCoins,
  WEB_PURCHASE: Truck,
  WEB_PURCHASE_MONITORING: ShoppingCart,
  WEB_MY_DONATIONS: Truck,
  WEB_FACILITIES: Building2,
  WEB_DONATION_ITEMS: PackagePlus,
  WEB_MY_CONTRIBUTIONS: ReceiptText,
  ADMIN: Settings,
  ADMIN_FACILITY: Building2,
  ADMIN_DONATION: HandCoins,
  ADMIN_PURCHASE: ShoppingCart,
  ADMIN_SYSTEM: Settings,
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
};

const fallbackSections = [
  {
    id: -1,
    label: "시설 관리",
    codes: [
      "ADMIN_FACILITIES",
      "ADMIN_DONATION_ITEMS",
    ],
  },
  {
    id: -2,
    label: "후원 관리",
    codes: [
      "ADMIN_FUNDING_CAMPAIGNS",
      "ADMIN_CONTRIBUTIONS",
      "ADMIN_RECEIPTS",
    ],
  },
  {
    id: -3,
    label: "구매·배송",
    codes: [
      "ADMIN_PURCHASE_ORDERS",
      "ADMIN_DELIVERY_TRACKING",
    ],
  },
  {
    id: -4,
    label: "시스템 관리",
    codes: [
      "ADMIN_USERS",
      "ADMIN_ROLES",
      "ADMIN_PERMISSIONS",
      "ADMIN_ROLE_PERMISSIONS",
      "ADMIN_SITE_SETTINGS",
      "ADMIN_SCREEN_SETTINGS",
      "ADMIN_NAV_MANAGEMENT",
      "ADMIN_MENU_MANAGEMENT",
    ],
  },
];

function flattenLeaves(items: MenuItem[]): MenuItem[] {
  return items.flatMap((item) =>
    item.children.length > 0 ? flattenLeaves(item.children) : item.path ? [item] : []
  );
}

function normalizeAdminSections(admin: MenuItem | undefined) {
  if (!admin) return [];

  if (admin.children.some((child) => child.children.length > 0)) {
    return admin.children.map((child) => ({
      id: child.id,
      label: child.label,
      icon: menuIcons[child.code] ?? Settings,
      children: child.children.length > 0 ? child.children : [child],
    }));
  }

  const used = new Set<string>();
  const sections = fallbackSections
    .map((section) => {
      const children = section.codes
        .map((code) => admin.children.find((child) => child.code === code))
        .filter((child): child is MenuItem => Boolean(child));
      children.forEach((child) => used.add(child.code));
      const icon =
        section.id === -1 ? Building2 :
        section.id === -2 ? HandCoins :
        section.id === -3 ? ShoppingCart :
        Settings;
      return { ...section, icon, children };
    })
    .filter((section) => section.children.length > 0);

  const uncategorized = admin.children.filter((child) => !used.has(child.code));
  if (uncategorized.length > 0) {
    sections.push({ id: -99, label: "기타", codes: [], icon: Menu, children: uncategorized });
  }

  return sections;
}

function normalizePath(path: string) {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

function isActivePath(pathname: string, href: string | null) {
  if (!href) return false;
  const current = normalizePath(pathname);
  const target = normalizePath(href);
  return target === "/dashboard" ? current === target : current.startsWith(target);
}

function UserAvatar({ name }: { name: string }) {
  const initials = (name ?? "?").slice(0, 2).toUpperCase();
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground select-none">
      {initials}
    </span>
  );
}

function UserDropdown({
  displayName,
  user,
  onLogout,
}: {
  displayName: string;
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  onLogout: () => void;
}) {
  const { t } = useTranslation("nav");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-2.5 transition-colors hover:bg-accent"
      >
        <UserAvatar name={displayName} />
        <span className="text-sm font-medium leading-none text-foreground">{displayName}</span>
        {user.role && <RoleBadge role={user.role} />}
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-md border border-border bg-background py-1 shadow-lg">
          <div className="border-b border-border px-3 py-2.5">
            <div className="flex items-center gap-2">
              <UserAvatar name={displayName} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <UserCircle className="h-4 w-4" />
            {t("profile")}
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </button>
        </div>
      )}
    </div>
  );
}

function PublicHeader() {
  const { t } = useTranslation("nav");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="flex h-14 w-full items-center justify-between px-4">
        <Link href="/" className="text-sm font-semibold tracking-tight transition-opacity hover:opacity-80">
          DonationPlatform
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSelect />
          <ThemeSwitcher />
          <Link
            href="/register"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-foreground transition-colors hover:bg-accent"
          >
            <UserPlus className="h-4 w-4 text-muted-foreground" />
            <span className="hidden text-sm font-medium leading-none sm:inline">{t("register")}</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-primary-foreground transition-opacity hover:opacity-90"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden text-sm font-medium leading-none sm:inline">{t("login")}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

function SidebarLink({ item, depth = 0 }: { item: MenuItem; depth?: number }) {
  const pathname = usePathname();
  const Icon = menuIcons[item.code] ?? Menu;
  const active = isActivePath(pathname, item.path);

  if (!item.path) return null;

  return (
    <Link
      href={item.path}
      target={item.isExternal ? "_blank" : undefined}
      rel={item.isExternal ? "noopener noreferrer" : undefined}
      className={cn(
        "flex items-center rounded-md transition-colors",
        depth > 0 ? "h-9 gap-2 px-2 text-[13px]" : "h-10 gap-2.5 px-2.5 text-sm",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
      style={{ paddingLeft: depth > 0 ? 14 : undefined }}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate font-medium">{item.label}</span>
    </Link>
  );
}

function SidebarSection({
  label,
  icon: Icon,
  items,
}: {
  label: string;
  icon: LucideIcon;
  items: MenuItem[];
}) {
  const pathname = usePathname();
  const active = items.some((child) =>
    flattenLeaves([child]).some((leaf) => isActivePath(pathname, leaf.path))
  );
  const [open, setOpen] = useState(active);

  useEffect(() => {
    if (active) setOpen(true);
  }, [active]);

  return (
    <section className="space-y-0.5">
      <button
        type="button"
        className={cn(
          "flex h-10 w-full items-center gap-2.5 rounded-md px-2.5 text-sm font-semibold transition-colors",
          active
            ? "text-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
        )}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <Icon className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <div className="ml-3 mt-1 space-y-0.5 border-l border-sidebar-border py-0.5 pl-3">
          {items.flatMap((child) => (child.children.length > 0 ? child.children : [child])).map((child) => (
            <SidebarLink key={child.id} item={child} depth={1} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function Sidebar({ tree }: { tree: MenuItem[] }) {
  const dashboard = tree.find((item) => item.code === "DASHBOARD");
  const admin = tree.find((item) => item.code === "ADMIN");
  const webItems = tree.filter(
    (item) => item.code !== "DASHBOARD" && item.code !== "ADMIN"
  );
  const sections = normalizeAdminSections(admin);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
      <div className="flex h-14 items-center border-b border-sidebar-border bg-sidebar px-4">
        <Link href="/dashboard" className="text-sm font-bold tracking-tight">
          DonationPlatform
        </Link>
      </div>
      <nav className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
        <div className="space-y-0.5">
          {dashboard && <SidebarLink item={dashboard} />}
        </div>
        {webItems.map((item) =>
          item.children.length > 0 ? (
            <SidebarSection
              key={item.id}
              label={item.label}
              icon={menuIcons[item.code] ?? Menu}
              items={item.children}
            />
          ) : (
            <div key={item.id} className="space-y-0.5">
              <SidebarLink item={item} />
            </div>
          ),
        )}
        {sections.map((section) => (
          <SidebarSection
            key={section.id}
            label={section.label}
            icon={section.icon}
            items={section.children}
          />
        ))}
      </nav>
    </aside>
  );
}

function MobileNavLink({
  item,
  depth = 0,
  onSelect,
}: {
  item: MenuItem;
  depth?: number;
  onSelect: () => void;
}) {
  const pathname = usePathname();
  const Icon = menuIcons[item.code] ?? Menu;
  const active = isActivePath(pathname, item.path);

  if (!item.path) return null;

  return (
    <Link
      href={item.path}
      target={item.isExternal ? "_blank" : undefined}
      rel={item.isExternal ? "noopener noreferrer" : undefined}
      onClick={onSelect}
      className={cn(
        "flex items-center rounded-md transition-colors",
        depth > 0 ? "h-9 gap-2 px-2 text-[13px]" : "h-10 gap-2.5 px-3 text-sm",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
      style={{ paddingLeft: depth > 0 ? 18 : undefined }}
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate font-medium">{item.label}</span>
    </Link>
  );
}

function MobileNav({ tree }: { tree: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const dashboard = tree.find((item) => item.code === "DASHBOARD");
  const admin = tree.find((item) => item.code === "ADMIN");
  const webItems = tree.filter(
    (item) => item.code !== "DASHBOARD" && item.code !== "ADMIN"
  );
  const sections = normalizeAdminSections(admin);
  const close = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 lg:hidden" aria-label="메뉴 열기">
          <Menu className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="left-3 top-3 h-[calc(100vh-1.5rem)] max-h-none w-[calc(100vw-1.5rem)] max-w-sm translate-x-0 translate-y-0 p-0">
        <DialogHeader className="border-b px-4 py-4">
          <DialogTitle>메뉴</DialogTitle>
        </DialogHeader>
        <nav className="max-h-[calc(100vh-6.5rem)] space-y-3 overflow-y-auto px-3 py-3">
          <div className="space-y-0.5">
            {dashboard ? <MobileNavLink item={dashboard} onSelect={close} /> : null}
          </div>
          {webItems.map((item) => {
            if (item.children.length === 0) {
              return <MobileNavLink key={item.id} item={item} onSelect={close} />;
            }

            return (
              <MobileNavSection
                key={item.id}
                label={item.label}
                icon={menuIcons[item.code] ?? Menu}
                items={item.children}
                onSelect={close}
              />
            );
          })}
          {sections.map((section) => (
            <MobileNavSection
              key={section.id}
              label={section.label}
              icon={section.icon}
              items={section.children}
              onSelect={close}
            />
          ))}
        </nav>
      </DialogContent>
    </Dialog>
  );
}

function MobileNavSection({
  label,
  icon: Icon,
  items,
  onSelect,
}: {
  label: string;
  icon: LucideIcon;
  items: MenuItem[];
  onSelect: () => void;
}) {
  const pathname = usePathname();
  const active = items.some((child) =>
    flattenLeaves([child]).some((leaf) => isActivePath(pathname, leaf.path))
  );
  const [open, setOpen] = useState(active);

  useEffect(() => {
    if (active) setOpen(true);
  }, [active]);

  return (
    <section className="space-y-0.5">
      <button
        type="button"
        className={cn(
          "flex h-10 w-full items-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors",
          active
            ? "text-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
        )}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <Icon className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <div className="ml-4 mt-1 space-y-0.5 border-l border-border py-0.5 pl-3">
          {items
            .flatMap((child) => (child.children.length > 0 ? child.children : [child]))
            .map((child) => (
              <MobileNavLink key={child.id} item={child} depth={1} onSelect={onSelect} />
            ))}
        </div>
      ) : null}
    </section>
  );
}

function getCurrentPageTitle(pathname: string, tree: MenuItem[]) {
  const leaves = flattenLeaves(tree);
  const current = leaves
    .filter((item) => isActivePath(pathname, item.path))
    .sort((a, b) => (b.path?.length ?? 0) - (a.path?.length ?? 0))[0];
  return current?.label ?? "대시보드";
}

function AppShell({
  children,
  tree,
  displayName,
  user,
  onLogout,
}: {
  children: React.ReactNode;
  tree: MenuItem[];
  displayName: string;
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const title = useMemo(() => getCurrentPageTitle(pathname, tree), [pathname, tree]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar tree={tree} />
      <div className="min-h-screen lg:pl-64">
        <header className="fixed left-0 right-0 top-0 z-30 box-border flex h-14 items-center justify-between border-b border-border bg-sidebar px-4 text-sidebar-foreground lg:left-64">
          <div className="flex min-w-0 items-center gap-2.5">
            <MobileNav tree={tree} />
            <div className="min-w-0 lg:hidden">
              <Link
                href="/dashboard"
                className="block truncate text-sm font-bold leading-tight tracking-tight text-sidebar-foreground"
              >
                Milla
              </Link>
              <p className="truncate text-xs leading-tight text-muted-foreground">{title}</p>
            </div>
            <p className="hidden truncate text-sm font-semibold text-sidebar-foreground lg:block">{title}</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelect />
            <ThemeSwitcher />
            <UserDropdown displayName={displayName} user={user} onLogout={onLogout} />
          </div>
        </header>
        <div className="pt-14">{children}</div>
      </div>
    </div>
  );
}

export function Header({ children }: { children?: React.ReactNode }) {
  const { status, user } = useAuth();
  const router = useRouter();
  const userRole = user?.role?.code ?? null;

  const { data: flatMenus = [] } = useQuery({
    queryKey: ["menus"],
    queryFn: menuApi.getAll,
    staleTime: 1000 * 60 * 5,
    enabled: status === "authenticated",
  });

  const tree = useMemo(() => buildTree(flatMenus, userRole), [flatMenus, userRole]);
  const displayName = user?.username ?? user?.email ?? "?";

  const handleLogout = async () => {
    await authActions.logout();
    router.replace("/login");
  };

  if (status !== "authenticated" || !user) {
    return (
      <>
        <PublicHeader />
        {children}
      </>
    );
  }

  return (
    <AppShell
      tree={tree}
      displayName={displayName}
      user={user}
      onLogout={handleLogout}
    >
      {children}
    </AppShell>
  );
}
