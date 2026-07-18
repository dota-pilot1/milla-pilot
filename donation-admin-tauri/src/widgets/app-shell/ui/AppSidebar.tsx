import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Download,
  Loader2,
  LogOut,
  RefreshCw,
  Settings,
  UserCircle,
} from "lucide-react";
import type { AdminMenu } from "../../../app/model/navigation";
import type { UserSummary } from "../../../entities/user/model/types";
import type { AppUpdateState } from "../../../shared/lib/useAppUpdate";

type ConnectionStatus = "checking" | "online" | "offline";

type AppSidebarProps = {
  menus: AdminMenu[];
  activeMenu: string;
  user: UserSummary;
  connectionStatus: ConnectionStatus;
  appVersion: string;
  updateState?: AppUpdateState;
  updateBusy?: boolean;
  onOpenMenu: (menu: string) => void;
  onRefreshMenus?: () => void | Promise<void>;
  onInstallUpdate?: () => void;
  onLogout: () => void;
};

export function AppSidebar({
  menus,
  activeMenu,
  user,
  connectionStatus,
  appVersion,
  updateState,
  updateBusy = false,
  onOpenMenu,
  onRefreshMenus,
  onInstallUpdate,
  onLogout,
}: AppSidebarProps) {
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const toggleGroup = (id: string) =>
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleRefresh = async () => {
    if (!onRefreshMenus || refreshing) return;
    setRefreshing(true);
    try {
      await onRefreshMenus();
    } finally {
      setTimeout(() => setRefreshing(false), 400);
    }
  };
  const displayName = user.username || user.email;
  const roleName = user.role.name || user.role.code.replace("ROLE_", "");
  const showUpdateButton = updateState?.status === "available" || updateState?.status === "downloading";
  const statusLabel = {
    checking: "연결 확인 중",
    online: "서버 연결됨",
    offline: "서버 연결 안 됨",
  } satisfies Record<ConnectionStatus, string>;

  useEffect(() => {
    if (!accountOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountOpen]);

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <button
          className="sidebar-brand-mark"
          onClick={() => onOpenMenu("DASHBOARD")}
          title="Donation Admin"
        >
          <span>DP</span>
        </button>
        <div className="sidebar-brand-copy">
          <strong>Donation Admin</strong>
          <span>관리자 콘솔</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        {menus.map((menu) => (
          <MenuNode
            key={menu.id}
            menu={menu}
            activeMenu={activeMenu}
            onOpenMenu={onOpenMenu}
            collapsedGroups={collapsedGroups}
            onToggleGroup={toggleGroup}
            depth={0}
          />
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-tools">
          <span className="sidebar-version">v{appVersion}</span>
          <button
            type="button"
            className="sidebar-icon-action"
            onClick={handleRefresh}
            disabled={refreshing || !onRefreshMenus}
            title="메뉴 새로고침"
          >
            <RefreshCw size={15} className={refreshing ? "spin" : ""} />
          </button>
          <button
            type="button"
            className="sidebar-icon-action"
            onClick={() => onOpenMenu("settings")}
            title="설정"
          >
            <Settings size={15} />
          </button>
        </div>
        {showUpdateButton && (
          <button
            type="button"
            className="sidebar-update-button"
            onClick={onInstallUpdate}
            disabled={updateBusy || !onInstallUpdate}
            title={`새 버전 v${updateState?.availableVersion || ""} 설치`}
          >
            {updateState?.status === "downloading" ? <Loader2 className="spin" size={15} /> : <Download size={15} />}
            <span>{updateState?.status === "downloading" ? `${updateState.progress}%` : "업데이트"}</span>
          </button>
        )}
        <div className="account-panel" ref={accountRef}>
          <button
            type="button"
            className={`account-trigger ${accountOpen ? "active" : ""}`}
            onClick={() => setAccountOpen((open) => !open)}
            aria-expanded={accountOpen}
            title={`${displayName} · ${roleName}`}
          >
            <div className="account-card">
              <div className="account-avatar">{displayName.slice(0, 2).toUpperCase()}</div>
              <div className={`account-status ${connectionStatus}`} aria-label={statusLabel[connectionStatus]}>
                {connectionStatus === "checking" && <Loader2 className="spin" size={13} />}
                {connectionStatus === "online" && <CheckCircle2 size={13} />}
                {connectionStatus === "offline" && <CircleAlert size={13} />}
              </div>
            </div>
            <span className="account-trigger-copy">
              <strong>{displayName}</strong>
              <small>{roleName}</small>
            </span>
          </button>

          {accountOpen && (
            <div className="account-popover">
              <div className="account-popover-head">
                <div className="account-card large">
                  <div className="account-avatar">{displayName.slice(0, 2).toUpperCase()}</div>
                  <div className={`account-status ${connectionStatus}`} aria-label={statusLabel[connectionStatus]}>
                    {connectionStatus === "checking" && <Loader2 className="spin" size={13} />}
                    {connectionStatus === "online" && <CheckCircle2 size={13} />}
                    {connectionStatus === "offline" && <CircleAlert size={13} />}
                  </div>
                </div>
                <div className="account-copy">
                  <strong>{displayName}</strong>
                  <span>{user.email}</span>
                </div>
              </div>
              <div className="account-popover-meta">
                <span>{roleName}</span>
                <span className={connectionStatus}>{statusLabel[connectionStatus]}</span>
              </div>
              <button
                type="button"
                className="account-action"
                onClick={() => {
                  setAccountOpen(false);
                  onOpenMenu("profile");
                }}
              >
                <UserCircle size={16} />
                <span>프로필</span>
              </button>
              <button
                type="button"
                className="account-action danger"
                onClick={() => {
                  setAccountOpen(false);
                  onLogout();
                }}
              >
                <LogOut size={16} />
                <span>로그아웃</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function MenuNode({
  menu,
  activeMenu,
  onOpenMenu,
  collapsedGroups,
  onToggleGroup,
  depth,
}: {
  menu: AdminMenu;
  activeMenu: string;
  onOpenMenu: (menu: string) => void;
  collapsedGroups: Set<string>;
  onToggleGroup: (id: string) => void;
  depth: number;
}) {
  // 자식이 없으면 실제 이동 가능한 메뉴 버튼
  if (menu.children.length === 0) {
    return (
      <SidebarButton
        menu={menu}
        activeMenu={activeMenu}
        onOpenMenu={onOpenMenu}
        nested={depth > 0}
      />
    );
  }

  // 자식이 있으면 접기 가능한 그룹 헤더 + 하위 재귀 렌더 (3뎁스 이상 지원)
  const GroupIcon = menu.icon;
  const collapsed = collapsedGroups.has(menu.id);
  return (
    <section className="sidebar-menu-group">
      <div
        className="sidebar-group-title"
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        onClick={() => onToggleGroup(menu.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggleGroup(menu.id);
          }
        }}
      >
        <ChevronDown size={13} className="sidebar-chevron" data-collapsed={collapsed} />
        <GroupIcon size={13} />
        <span>{menu.label}</span>
      </div>
      <div className={`sidebar-group-body${collapsed ? " collapsed" : ""}`}>
        <div className="sidebar-group-body-inner">
          {menu.children.map((child) => (
            <MenuNode
              key={child.id}
              menu={child}
              activeMenu={activeMenu}
              onOpenMenu={onOpenMenu}
              collapsedGroups={collapsedGroups}
              onToggleGroup={onToggleGroup}
              depth={depth + 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function SidebarButton({
  menu,
  activeMenu,
  nested = false,
  onOpenMenu,
}: {
  menu: AdminMenu;
  activeMenu: string;
  nested?: boolean;
  onOpenMenu: (menu: string) => void;
}) {
  const Icon = menu.icon;
  return (
    <button
      className={`${activeMenu === menu.id ? "active" : ""} ${nested ? "nested" : ""}`}
      onClick={() => onOpenMenu(menu.id)}
      title={`${menu.label} · ${menu.subtitle}`}
    >
      <Icon size={16} />
      <strong>{menu.label}</strong>
    </button>
  );
}
