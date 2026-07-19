import { getCurrentWindow } from "@tauri-apps/api/window";
import { getVersion } from "@tauri-apps/api/app";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { FormEvent, MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  BookOpenCheck,
  CheckCircle2,
  CircleAlert,
  Download,
  Eye,
  EyeOff,
  GraduationCap,
  Info,
  Loader2,
  LogIn,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";
import { WindowControls } from "../../../widgets/app-shell/ui/WindowControls";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { cn } from "../../../shared/lib/cn";

type LoginScreenProps = {
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (email: string, username: string, password: string) => Promise<void>;
};

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,100}$/;
const REMEMBER_EMAIL_KEY = "donation-admin:login-email";
const REMEMBER_PASSWORD_KEY = "donation-admin:login-password";
const FALLBACK_APP_VERSION = "0.1.0";
const LOGIN_UPDATE_CHECK_INTERVAL_MS = 10 * 60 * 1000;
const TEST_PASSWORD = "password123";

type SeedLoginAccount = {
  label: string;
  roleCode: "ROLE_PLATFORM_ADMIN" | "ROLE_FACILITY_ADMIN" | "ROLE_DONOR";
  email: string;
};

const seedLoginAccounts: SeedLoginAccount[] = [
  { label: "배준영", roleCode: "ROLE_PLATFORM_ADMIN", email: "admin@milla.im" },
  { label: "서민재", roleCode: "ROLE_PLATFORM_ADMIN", email: "ops@milla.im" },
  { label: "오은주", roleCode: "ROLE_FACILITY_ADMIN", email: "haetsal.admin@milla.im" },
  { label: "신재훈", roleCode: "ROLE_FACILITY_ADMIN", email: "pureunsup.admin@milla.im" },
  { label: "문가영", roleCode: "ROLE_FACILITY_ADMIN", email: "onmaeul.admin@milla.im" },
  { label: "조성민", roleCode: "ROLE_FACILITY_ADMIN", email: "saessak.admin@milla.im" },
  { label: "김서연", roleCode: "ROLE_DONOR", email: "seoyeon.kim@gmail.com" },
  { label: "이준호", roleCode: "ROLE_DONOR", email: "junho.lee@naver.com" },
  { label: "박지우", roleCode: "ROLE_DONOR", email: "jiwoo.park@daum.net" },
  { label: "최민준", roleCode: "ROLE_DONOR", email: "minjun.choi@gmail.com" },
  { label: "정하윤", roleCode: "ROLE_DONOR", email: "hayoon.jung@naver.com" },
  { label: "강도윤", roleCode: "ROLE_DONOR", email: "doyoon.kang@kakao.com" },
  { label: "윤서준", roleCode: "ROLE_DONOR", email: "seojun.yoon@gmail.com" },
  { label: "임지호", roleCode: "ROLE_DONOR", email: "jiho.lim@naver.com" },
  { label: "한예은", roleCode: "ROLE_DONOR", email: "yeeun.han@daum.net" },
  { label: "오시우", roleCode: "ROLE_DONOR", email: "siwoo.oh@gmail.com" },
];

export function LoginScreen({ onLogin, onSignup }: LoginScreenProps) {
  const win = getCurrentWindow();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [roleGuideOpen, setRoleGuideOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formMessage, setFormMessage] = useState("");

  const isSignup = mode === "signup";

  const resetFeedback = () => {
    setFormError("");
    setFormMessage("");
  };

  const switchMode = (nextMode: "login" | "signup") => {
    setMode(nextMode);
    if (nextMode === "signup") setPassword("");
    setPasswordConfirm("");
    resetFeedback();
  };

  const selectSeedAccount = (account: SeedLoginAccount) => {
    setMode("login");
    setEmail(account.email);
    setPassword(TEST_PASSWORD);
    setPasswordConfirm("");
    setRemember(true);
    resetFeedback();
  };

  const saveRememberedLogin = (nextEmail: string, nextPassword: string) => {
    if (!remember) {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
      localStorage.removeItem(REMEMBER_PASSWORD_KEY);
      return;
    }
    localStorage.setItem(REMEMBER_EMAIL_KEY, nextEmail);
    localStorage.setItem(REMEMBER_PASSWORD_KEY, nextPassword);
  };

  const validateSignup = () => {
    if (!email.trim()) return "이메일을 입력해주세요.";
    if (!username.trim()) return "사용자명을 입력해주세요.";
    if (username.trim().length < 2 || username.trim().length > 50) return "사용자명은 2~50자여야 합니다.";
    if (!PASSWORD_PATTERN.test(password)) return "비밀번호는 영문과 숫자를 포함한 8자 이상이어야 합니다.";
    if (password !== passwordConfirm) return "비밀번호 확인이 일치하지 않습니다.";
    return "";
  };

  const submitLogin = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    if (isSignup) {
      const validationError = validateSignup();
      if (validationError) {
        setFormError(validationError);
        return;
      }
    } else if (!email.trim() || !password) {
      return;
    }
    setSubmitting(true);
    resetFeedback();
    try {
      if (isSignup) {
        await onSignup(email.trim(), username.trim(), password);
        saveRememberedLogin(email.trim(), password);
        setFormMessage("회원가입이 완료되었습니다. 같은 계정으로 로그인하세요.");
        setMode("login");
        setPasswordConfirm("");
      } else {
        await onLogin(email.trim(), password);
        saveRememberedLogin(email.trim(), password);
      }
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : isSignup ? "회원가입에 실패했습니다." : "로그인에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY) || "";
    const rememberedPassword = localStorage.getItem(REMEMBER_PASSWORD_KEY) || "";
    setEmail(rememberedEmail);
    setPassword(rememberedPassword);
    setRemember(Boolean(rememberedEmail || rememberedPassword));
  }, []);

  const handleDragStart = (event: MouseEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    void win.startDragging();
  };

  return (
    <main className="login-screen">
      <header className="login-topbar" onMouseDown={handleDragStart}>
        <div className="brand compact">
          <div className="brand-mark">
            <Zap size={18} />
          </div>
          <div>
            <strong>Donation Admin</strong>
          </div>
        </div>
        <WindowControls />
      </header>

      <div className="login-stage">
        <SeedAccountBar
          selectedEmail={email}
          onSelect={selectSeedAccount}
          onOpenRoleGuide={() => setRoleGuideOpen(true)}
        />
        <section className="login-shell">
          <div className="login-panel">
            <div className="login-card-header">
              <div className="login-mark">
                {isSignup ? <UserPlus size={24} /> : <Zap size={24} />}
              </div>
              <div>
                <p className="login-kicker">{isSignup ? "Create Account" : "Welcome Back"}</p>
                <h1>{isSignup ? "계정 만들기" : "로그인"}</h1>
                <p>{isSignup ? "관리자 계정을 만들고 운영 콘솔을 시작하세요." : "DonationPlatform 관리자 콘솔로 이동합니다."}</p>
              </div>
            </div>

            <div className={`auth-mode-switch ${isSignup ? "signup" : "login"}`} role="tablist" aria-label="인증 방식">
              <span className="auth-mode-thumb" aria-hidden="true" />
              <button
                aria-selected={!isSignup}
                className={!isSignup ? "active" : ""}
                onClick={() => switchMode("login")}
                role="tab"
                type="button"
              >
                로그인
              </button>
              <button
                aria-selected={isSignup}
                className={isSignup ? "active" : ""}
                onClick={() => switchMode("signup")}
                role="tab"
                type="button"
              >
                회원가입
              </button>
            </div>

            <div className="auth-form-stage">
              <form className={`login-form auth-form-pane ${!isSignup ? "active" : ""}`} onSubmit={submitLogin}>
                <label>
                  이메일
                  <Input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@milla.im"
                    type="email"
                    autoComplete="email"
                  />
                </label>

                <label>
                  비밀번호
                  <span className="password-field">
                    <Input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="비밀번호"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} title="비밀번호 표시 전환">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </span>
                </label>

                <div className="login-options">
                  <label className="remember-row">
                    <input
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                      type="checkbox"
                    />
                    이메일/비밀번호 기억하기
                  </label>
                </div>

                {formMessage && <div className="login-message">{formMessage}</div>}
                {!isSignup && formError && <div className="login-error">{formError}</div>}

                <Button
                  className="login-primary-action h-12 w-full text-base"
                  disabled={submitting || !email.trim() || !password}
                  type="submit"
                >
                  {submitting && !isSignup ? <Loader2 className="spin" size={18} /> : <LogIn size={18} />}
                  로그인
                </Button>
              </form>

              <form className={`login-form auth-form-pane signup ${isSignup ? "active" : ""}`} onSubmit={submitLogin}>
                <label>
                  이메일
                  <Input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@milla.im"
                    type="email"
                    autoComplete="email"
                  />
                </label>

                <label>
                  사용자명
                  <Input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="홍길동"
                    type="text"
                    autoComplete="name"
                  />
                </label>

                <label>
                  비밀번호
                  <span className="password-field">
                    <Input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="비밀번호"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} title="비밀번호 표시 전환">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </span>
                </label>

                <label>
                  비밀번호 확인
                  <Input
                    value={passwordConfirm}
                    onChange={(event) => setPasswordConfirm(event.target.value)}
                    placeholder="비밀번호 재입력"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                  />
                </label>

                {isSignup && formError && <div className="login-error">{formError}</div>}

                <Button
                  className="login-primary-action h-12 w-full text-base"
                  disabled={submitting || !email.trim() || !password || !username.trim() || !passwordConfirm}
                  type="submit"
                >
                  {submitting && isSignup ? <Loader2 className="spin" size={18} /> : <UserPlus size={18} />}
                  회원가입
                </Button>
              </form>
            </div>
          </div>

          <aside className="login-product-panel">
            <div className="app-preview" aria-hidden="true">
              <div className="app-preview-sidebar">
                <span className="active"><Zap size={16} /></span>
                <span><MessageCircle size={15} /></span>
                <span><GraduationCap size={15} /></span>
                <span><BookOpenCheck size={15} /></span>
              </div>
              <div className="app-preview-main">
                <div className="app-preview-top">
                  <div>
                    <strong>운영 현황</strong>
                    <span>Donation Admin</span>
                  </div>
                  <i />
                </div>
                <div className="app-preview-card">
                  <div>
                    <span>후원 관리</span>
                    <strong>펀딩 캠페인</strong>
                  </div>
                  <CheckCircle2 size={18} />
                </div>
                <div className="app-preview-grid">
                  <div>
                    <span>처리 대기</span>
                    <strong>12건</strong>
                  </div>
                  <div>
                    <span>배송 확인</span>
                    <strong>4건</strong>
                  </div>
                </div>
                <div className="app-preview-progress">
                  <span />
                </div>
              </div>
            </div>
            <div className="login-product-copy">
              <h2>{isSignup ? "관리자 운영 환경을 준비하세요." : "후원 운영을 이어가세요."}</h2>
              <p>로그인 후 DB 메뉴 기반의 후원 관리, 주문, 배송, 권한 화면으로 전환됩니다.</p>
            </div>
            <button className="login-panel-switch" type="button" onClick={() => switchMode(isSignup ? "login" : "signup")}>
              {isSignup ? "이미 계정이 있어요" : "새 계정 만들기"}
            </button>
            <LoginUpdateStatus />
          </aside>
        </section>
      </div>

      {roleGuideOpen && <RoleGuideDialog onClose={() => setRoleGuideOpen(false)} />}
    </main>
  );
}

type SeedAccountBarProps = {
  selectedEmail: string;
  onSelect: (account: SeedLoginAccount) => void;
  onOpenRoleGuide: () => void;
};

function SeedAccountBar({ selectedEmail, onSelect, onOpenRoleGuide }: SeedAccountBarProps) {
  return (
    <section
      className="flex w-full max-w-[940px] items-start gap-2.5 rounded-xl border border-zinc-200 bg-white/95 p-2.5 shadow-[0_16px_44px_rgba(15,23,42,0.12)] backdrop-blur"
      aria-label="시드 로그인 계정"
    >
      <span className="mt-0.5 hidden size-8 shrink-0 place-items-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700 sm:grid" aria-hidden="true">
        <Zap size={16} />
      </span>
      <div className="grid min-w-0 flex-1 grid-cols-2 gap-1.5 sm:grid-cols-4 xl:grid-cols-8">
        {seedLoginAccounts.map((account) => {
          const role = getSeedRoleView(account.roleCode);
          const selected = selectedEmail === account.email;

          return (
            <button
              key={account.email}
              className={cn(
                "relative flex min-h-[42px] min-w-0 flex-col items-start justify-center gap-0.5 rounded-lg border bg-white px-2.5 py-1.5 pr-6 text-left shadow-sm transition",
                "hover:-translate-y-px hover:border-zinc-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2",
                role.cardClassName,
                selected && "border-emerald-300 bg-emerald-50/80 ring-2 ring-emerald-600/15",
              )}
              type="button"
              onClick={() => onSelect(account)}
              title={`${account.label} / ${role.label} / ${account.email}`}
            >
              <span className="block max-w-full truncate text-[12px] font-extrabold leading-none text-zinc-950">{account.label}</span>
              <small className={cn("inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-black leading-none", role.badgeClassName)}>
                {role.label}
              </small>
              {selected && <Check className="absolute right-2 top-2 text-emerald-700" size={13} />}
            </button>
          );
        })}
      </div>
      <button
        className="hidden min-h-[42px] shrink-0 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-[12px] font-extrabold text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 xl:inline-flex"
        type="button"
        onClick={onOpenRoleGuide}
      >
        <Info size={14} />
        역할 안내
      </button>
    </section>
  );
}

function RoleGuideDialog({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/45 px-5"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="relative w-full max-w-[620px] rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_22px_70px_rgba(15,23,42,0.28)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-guide-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
          type="button"
          onClick={onClose}
          title="닫기"
        >
          <X size={18} />
        </button>
        <header className="space-y-1 pr-10">
          <h2 id="role-guide-title" className="text-lg font-extrabold tracking-tight text-zinc-950">역할 구분과 접근 권한</h2>
          <p className="text-[13px] leading-6 text-zinc-500">테스트 계정은 같은 비밀번호를 사용하지만, 역할에 따라 볼 수 있는 메뉴와 수행 가능한 작업이 다릅니다.</p>
        </header>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {roleGuides.map((role) => (
            <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm" key={role.code}>
              <div className="flex items-center gap-3">
                <span className={cn("inline-flex size-9 items-center justify-center rounded-lg", role.iconClassName)}>{role.icon}</span>
                <div>
                  <strong className="block text-sm font-extrabold text-zinc-950">{role.title}</strong>
                  <small className="block text-[11px] font-bold text-zinc-400">{role.code}</small>
                </div>
              </div>
              <p className="mt-3 min-h-[52px] text-[13px] leading-6 text-zinc-500">{role.description}</p>
              <ul className="mt-3 space-y-2">
                {role.permissions.map((permission) => (
                  <li className="flex gap-2 text-[12px] font-bold leading-5 text-zinc-700" key={permission}>
                    <Check className="mt-0.5 shrink-0 text-zinc-900" size={14} />
                    {permission}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <p className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-[13px] text-zinc-500">
          모든 테스트 계정의 기본 비밀번호는 <strong>{TEST_PASSWORD}</strong>입니다.
        </p>
      </section>
    </div>
  );
}

const roleGuides = [
  {
    title: "플랫폼 관리자",
    code: "ROLE_PLATFORM_ADMIN",
    iconClassName: "bg-rose-50 text-rose-600",
    icon: <Zap size={18} />,
    description: "플랫폼 전체 운영과 관리 메뉴에 접근하는 최상위 역할입니다.",
    permissions: ["시설·후원·구매 전체 관리", "사용자와 역할 관리", "메뉴와 권한 정책 관리"],
  },
  {
    title: "시설 관리자",
    code: "ROLE_FACILITY_ADMIN",
    iconClassName: "bg-sky-50 text-sky-700",
    icon: <ShieldCheck size={18} />,
    description: "소속 시설의 후원 준비와 물품 상태를 관리합니다.",
    permissions: ["담당 시설 물품 관리", "시설별 후원 현황 확인", "배송·수령 흐름 확인"],
  },
  {
    title: "후원자",
    code: "ROLE_DONOR",
    iconClassName: "bg-zinc-100 text-zinc-700",
    icon: <Users size={18} />,
    description: "후원 화면을 이용하는 일반 사용자 역할입니다.",
    permissions: ["후원 가능한 시설과 물품 확인", "후원 참여", "내 후원 내역 확인"],
  },
] as const;

function getSeedRoleView(roleCode: SeedLoginAccount["roleCode"]) {
  if (roleCode === "ROLE_PLATFORM_ADMIN") {
    return {
      label: "플랫폼",
      cardClassName: "border-rose-200 bg-rose-50/55 hover:border-rose-300",
      badgeClassName: "bg-rose-600 text-white",
    };
  }

  if (roleCode === "ROLE_FACILITY_ADMIN") {
    return {
      label: "시설",
      cardClassName: "border-sky-200 bg-sky-50/60 hover:border-sky-300",
      badgeClassName: "bg-sky-900 text-white",
    };
  }

  return {
    label: "후원자",
    cardClassName: "border-zinc-200 bg-white hover:border-zinc-300",
    badgeClassName: "bg-zinc-100 text-zinc-700",
  };
}

type UpdateCheckStatus = "idle" | "checking" | "uptodate" | "available" | "downloading" | "error";

function LoginUpdateStatus() {
  const [version, setVersion] = useState(FALLBACK_APP_VERSION);
  const [status, setStatus] = useState<UpdateCheckStatus>("idle");
  const [newVersion, setNewVersion] = useState("");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const updateRef = useRef<Update | null>(null);
  const checkingRef = useRef(false);
  const statusRef = useRef<UpdateCheckStatus>("idle");

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const checkForUpdate = useCallback(async () => {
    if (checkingRef.current || statusRef.current === "downloading") return;
    checkingRef.current = true;
    setStatus("checking");
    setMessage("");
    try {
      const update = await check();
      updateRef.current = update;
      if (update) {
        setNewVersion(update.version);
        setStatus("available");
      } else {
        setNewVersion("");
        setStatus("uptodate");
      }
    } catch (caught) {
      setStatus("error");
      setMessage(caught instanceof Error ? caught.message : "업데이트 확인 실패");
    } finally {
      checkingRef.current = false;
    }
  }, []);

  const installUpdate = async () => {
    const update = updateRef.current;
    if (!update) return;
    setStatus("downloading");
    setProgress(0);
    setMessage("");
    try {
      let total = 0;
      let downloaded = 0;
      await update.downloadAndInstall((event) => {
        if (event.event === "Started") {
          total = event.data.contentLength ?? 0;
        } else if (event.event === "Progress") {
          downloaded += event.data.chunkLength;
          if (total > 0) setProgress(Math.min(100, Math.round((downloaded / total) * 100)));
        }
      });
      await relaunch();
    } catch (caught) {
      setStatus("error");
      setMessage(caught instanceof Error ? caught.message : "업데이트 설치 실패");
    }
  };

  useEffect(() => {
    getVersion().then(setVersion).catch(() => {});
  }, []);

  useEffect(() => {
    void checkForUpdate();
    const interval = window.setInterval(() => void checkForUpdate(), LOGIN_UPDATE_CHECK_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [checkForUpdate]);

  const label =
    status === "checking"
      ? "업데이트 확인 중"
      : status === "available"
        ? `새 버전 v${newVersion}`
        : status === "downloading"
          ? `다운로드 ${progress}%`
          : status === "error"
            ? "확인 실패"
            : status === "uptodate"
              ? "최신 버전"
              : "업데이트 대기";

  return (
    <div className={`login-update-status ${status}`}>
      <div className="login-update-summary">
        <span>v{version}</span>
        <strong>{label}</strong>
      </div>
      {status === "downloading" && (
        <div className="login-update-progress">
          <span style={{ width: `${progress}%` }} />
        </div>
      )}
      {status === "error" && message && <p>{message}</p>}
      <div className="login-update-actions">
        {status === "available" ? (
          <button type="button" onClick={() => void installUpdate()}>
            <Download size={13} />
            업데이트
          </button>
        ) : (
          <button type="button" disabled={status === "checking" || status === "downloading"} onClick={() => void checkForUpdate()}>
            {status === "checking" ? <Loader2 className="spin" size={13} /> : status === "error" ? <CircleAlert size={13} /> : <RefreshCw size={13} />}
            다시 확인
          </button>
        )}
      </div>
    </div>
  );
}
