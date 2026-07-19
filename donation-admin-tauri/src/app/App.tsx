import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Database, RefreshCw } from "lucide-react";
import { AppUpdatePanel } from "../shared/ui/AppUpdatePanel";
import { LoginScreen } from "../features/auth/login/LoginScreen";
import { useAppUpdate } from "../shared/lib/useAppUpdate";
import { configureAuthSession } from "../shared/api/client";
import type { UserSummary } from "../entities/user/model/types";
import type { TokenResponse } from "../entities/user/model/types";
import { login, logout, me, signup } from "../features/auth/api/authApi";
import { fetchMenus } from "../features/menu/api/menuApi";
import { FacilityManagementScreen } from "../features/facility-management/ui/FacilityManagementScreen";
import { ContributionsScreen } from "../features/contribution-ledger/ui/ContributionsScreen";
import { PurchaseOrdersScreen } from "../features/purchase-management/ui/PurchaseOrdersScreen";
import { UserManagementScreen } from "../features/user-management/ui/UserManagementScreen";
import { API_BASE_URL, SERVER_ROOT_PATH } from "../shared/config/server";
import { AppSidebar } from "../widgets/app-shell/ui/AppSidebar";
import { AppTopbar } from "../widgets/app-shell/ui/AppTopbar";
import {
  PROFILE_MENU,
  SETTINGS_MENU,
  buildTree,
  canAccessMenu,
  flattenMenus,
  toAdminMenu,
  toTauriSidebarMenus,
  type AdminMenu,
  type MenuRecord,
} from "./model/navigation";

const appVersion = "0.1.0";
const ACCESS_TOKEN_KEY = "donation-admin:access-token";
const REFRESH_TOKEN_KEY = "donation-admin:refresh-token";

export function App() {
  const [token, setToken] = useState(() => localStorage.getItem(ACCESS_TOKEN_KEY) || "");
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem(REFRESH_TOKEN_KEY) || "");
  const [user, setUser] = useState<UserSummary | null>(null);
  const [menus, setMenus] = useState<MenuRecord[]>([]);
  const [menuError, setMenuError] = useState("");
  const [booting, setBooting] = useState(true);
  const [activeMenu, setActiveMenu] = useState("DASHBOARD");
  const [workspaceRefreshKey, setWorkspaceRefreshKey] = useState(0);
  const appUpdate = useAppUpdate(appVersion);
  const isLoggedIn = Boolean(token && user);

  const clearSession = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setToken("");
    setRefreshToken("");
    setUser(null);
    setMenus([]);
  }, []);

  const applyTokens = useCallback((result: TokenResponse) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, result.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);
    setToken(result.accessToken);
    setRefreshToken(result.refreshToken);
    setUser(result.user);
  }, []);

  useEffect(() => {
    configureAuthSession({
      getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY) || "",
      onRefresh: applyTokens,
      onExpired: clearSession,
    });

    return () => configureAuthSession(null);
  }, [applyTokens, clearSession]);

  useEffect(() => {
    if (isLoggedIn) appUpdate.checkOnceOnStartup();
  }, [appUpdate.checkOnceOnStartup, isLoggedIn]);

  useEffect(() => {
    if (!token) {
      setBooting(false);
      return;
    }

    me(token)
      .then(setUser)
      .catch(clearSession)
      .finally(() => setBooting(false));
  }, [clearSession, token]);

  const loadMenus = useCallback(() => {
    if (!token || !user) return Promise.resolve();
    return fetchMenus(token)
      .then((nextMenus) => {
        setMenus(nextMenus);
        setMenuError("");
      })
      .catch((error: unknown) => {
        setMenuError(error instanceof Error ? error.message : "메뉴를 불러오지 못했습니다.");
      });
  }, [token, user]);

  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  const adminMenus = useMemo(() => {
    const tree = buildTree(menus, user);
    const mapped = tree.map(toAdminMenu);
    return toTauriSidebarMenus(mapped);
  }, [menus, user]);

  const flatAdminMenus = useMemo(
    () => [...flattenMenus(adminMenus), PROFILE_MENU, SETTINGS_MENU],
    [adminMenus],
  );

  const activeWebMenu =
    flatAdminMenus.find((menu) => menu.id === activeMenu) ??
    flatAdminMenus.find((menu) => menu.id === "DASHBOARD") ??
    PROFILE_MENU;

  const handleLogin = async (email: string, password: string) => {
    const result = await login(email.trim(), password);
    applyTokens(result);
  };

  const handleSignup = async (email: string, username: string, password: string) => {
    await signup(email.trim(), username.trim(), password);
  };

  const handleLogout = async () => {
    if (token) {
      await logout(token).catch(() => undefined);
    }
    clearSession();
  };

  const openMenu = (menu: string) => {
    if (!canAccessMenu(user, menu)) return;
    setActiveMenu(menu);
  };

  const refreshWorkspace = async () => {
    await loadMenus();
    setWorkspaceRefreshKey((key) => key + 1);
  };

  if (booting) {
    return (
      <div className="boot-screen">
        <strong>Donation Admin</strong>
        <span>서버 세션 확인 중...</span>
      </div>
    );
  }

  if (!token || !user) {
    return <LoginScreen onLogin={handleLogin} onSignup={handleSignup} />;
  }

  return (
    <div className="app-shell">
      <AppSidebar
        menus={adminMenus}
        activeMenu={activeMenu}
        user={user}
        connectionStatus={menuError ? "offline" : "online"}
        appVersion={appUpdate.state.currentVersion}
        updateState={appUpdate.state}
        updateBusy={appUpdate.busy}
        onOpenMenu={openMenu}
        onRefreshMenus={refreshWorkspace}
        onInstallUpdate={() => void appUpdate.installUpdate()}
        onLogout={handleLogout}
      />
      <div className="app-main">
        <AppTopbar activeWebMenu={activeWebMenu} activeMenu={activeMenu} />
        <AdminWorkspace
          activeMenu={activeMenu}
          activeWebMenu={activeWebMenu}
          user={user}
          token={token}
          refreshToken={refreshToken}
          menuError={menuError}
          appUpdate={appUpdate}
          refreshKey={workspaceRefreshKey}
        />
      </div>
    </div>
  );
}

function AdminWorkspace({
  activeMenu,
  activeWebMenu,
  user,
  token,
  refreshToken,
  menuError,
  appUpdate,
  refreshKey,
}: {
  activeMenu: string;
  activeWebMenu: AdminMenu;
  user: UserSummary;
  token: string;
  refreshToken: string;
  menuError: string;
  appUpdate: ReturnType<typeof useAppUpdate>;
  refreshKey: number;
}) {
  if (activeMenu === "settings") {
    return (
      <main className="workspace-page">
        <section className="workspace-hero compact">
          <p className="eyebrow">Settings</p>
          <h1>앱 설정</h1>
          <p>업데이트와 서버 연결 정보를 확인합니다.</p>
        </section>
        <AppUpdatePanel
          updateState={appUpdate.state}
          busy={appUpdate.busy}
          onCheckUpdate={() => void appUpdate.checkForUpdate()}
          onInstallUpdate={() => void appUpdate.installUpdate()}
        />
      </main>
    );
  }

  if (activeMenu === "profile") {
    return (
      <main className="workspace-page">
        <section className="workspace-hero compact">
          <p className="eyebrow">Profile</p>
          <h1>{user.username}</h1>
          <p>{user.email}</p>
        </section>
      </main>
    );
  }

  if (activeMenu === "ADMIN_FACILITIES") {
    return <FacilityManagementScreen token={token} />;
  }

  if (activeMenu === "ADMIN_CONTRIBUTIONS") {
    return <ContributionsScreen token={token} refreshKey={refreshKey} />;
  }

  if (activeMenu === "ADMIN_PURCHASE_ORDERS") {
    return <PurchaseOrdersScreen token={token} />;
  }

  if (activeMenu === "ADMIN_USERS") {
    return <UserManagementScreen token={token} />;
  }

  const Icon = activeWebMenu.icon;

  return (
    <main className="workspace-page">
      <section className="workspace-hero">
        <div className="workspace-hero-mark">
          <Icon size={26} />
        </div>
        <p className="eyebrow">DonationPlatform Admin</p>
        <h1>{activeWebMenu.label}</h1>
        <p>{activeWebMenu.subtitle}</p>
      </section>

      <section className="starter-grid">
        <article className="starter-panel">
          <Activity size={20} />
          <strong>관리자 전용 앱</strong>
          <span>웹 관리자 화면과 분리해 운영자 반복 업무에 맞춘 데스크톱 콘솔로 확장합니다.</span>
        </article>
        <article className="starter-panel">
          <Database size={20} />
          <strong>DB 메뉴 기반</strong>
          <span>현재 사이드바 메뉴는 `/api/menus` 응답을 역할 기준으로 필터링해 표시합니다.</span>
          {menuError && <small className="error-text">{menuError}</small>}
        </article>
        <article className="starter-panel">
          <RefreshCw size={20} />
          <strong>서버 연결</strong>
          <span>{API_BASE_URL}</span>
          <small>{SERVER_ROOT_PATH}</small>
        </article>
      </section>

      <section className="admin-detail-panel">
        <h2>다음 연결 대상</h2>
        <div className="admin-detail-grid">
          <div>
            <span>메뉴 코드</span>
            <strong>{activeWebMenu.code}</strong>
          </div>
          <div>
            <span>백엔드 경로</span>
            <strong>{activeWebMenu.path ?? "그룹 메뉴"}</strong>
          </div>
          <div>
            <span>권한</span>
            <strong>{user.role.name}</strong>
          </div>
          <div>
            <span>세션</span>
            <strong>{token && refreshToken ? "활성" : "확인 필요"}</strong>
          </div>
        </div>
      </section>
    </main>
  );
}
