"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  KeyRound,
  LogIn,
  PanelsTopLeft,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { LoginForm, type DevLoginAccount } from "@/features/auth/login/LoginForm";
import { SignupForm } from "@/features/auth/signup/SignupForm";
import { MobileAuthShell } from "@/features/auth/ui/MobileAuthShell";
import { SeedAccountPicker } from "@/features/auth/ui/SeedAccountPicker";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/utils";

type AuthMode = "login" | "signup";

type AuthModeShellProps = {
  initialMode: AuthMode;
  nextPath?: string;
};

const isDev = process.env.NODE_ENV !== "production";

export function AuthModeShell({ initialMode, nextPath }: AuthModeShellProps) {
  const { t } = useTranslation("auth");
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [seedAccount, setSeedAccount] = useState<DevLoginAccount | null>(null);
  const isSignup = mode === "signup";

  const loginPath = useMemo(() => {
    const safeNext = nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//");
    return safeNext ? `/login?next=${encodeURIComponent(nextPath)}` : "/login";
  }, [nextPath]);

  const loginCopy = {
    title: t("signInTitle"),
    subtitle: t("signInSubtitle"),
    panelTitle: "후원 이행을 한 흐름으로 관리합니다.",
    panelBody: "시설별 필요 물품, 후원 기록, 구매 증빙까지 같은 기준으로 이어집니다.",
    panelButton: t("signUpLink"),
    panelMode: "signup" as const,
    icon: LogIn,
  };
  const signupCopy = {
    title: t("signUpTitle"),
    subtitle: t("signUpSubtitle"),
    panelTitle: "이미 계정이 있나요?",
    panelBody: "등록된 계정으로 후원 내역과 진행 상태를 계속 확인할 수 있습니다.",
    panelButton: t("signInLink"),
    panelMode: "login" as const,
    icon: UserPlus,
  };
  const copy = isSignup ? signupCopy : loginCopy;

  const selectMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    window.history.replaceState(null, "", nextMode === "signup" ? "/register" : loginPath);
  };

  const selectSeedAccount = (account: DevLoginAccount) => {
    setSeedAccount({ ...account });
    selectMode("login");
  };

  return (
    <main className="min-h-[calc(100vh-3.5rem)] bg-page px-4 py-3 sm:py-4 lg:block">
      <div className="lg:hidden">
        <MobileAuthShell
          initialMode={mode}
          nextPath={nextPath}
          seedAccount={seedAccount}
          onSeedAccountSelect={selectSeedAccount}
          onModeChange={selectMode}
        />
      </div>

      <div className="mx-auto w-full max-w-6xl space-y-3">
        {isDev ? (
          <div className="hidden lg:block">
            <SeedAccountPicker onSelect={selectSeedAccount} selectedEmail={seedAccount?.email} />
          </div>
        ) : null}

        <section className="hidden overflow-hidden rounded-xl border bg-card shadow-xl shadow-foreground/5 lg:block">
          <div className="relative min-h-[540px]">
            <div
              className={cn(
                "absolute inset-y-0 left-0 w-1/2 will-change-transform transition-transform duration-[1100ms] ease-[cubic-bezier(0.45,0,0.2,1)]",
                isSignup && "translate-x-full",
              )}
            >
              <div className="relative h-full overflow-hidden">
                <div
                  className={cn(
                    "absolute inset-0 will-change-transform transition-all duration-[850ms] ease-[cubic-bezier(0.45,0,0.2,1)]",
                    isSignup
                      ? "pointer-events-none -translate-x-5 opacity-0"
                      : "translate-x-0 opacity-100 delay-300",
                  )}
                >
                  <AuthFormPanel
                    mode="login"
                    title={loginCopy.title}
                    subtitle={loginCopy.subtitle}
                    icon={loginCopy.icon}
                    nextPath={nextPath}
                    seedAccount={seedAccount}
                    desktop
                  />
                </div>
                <div
                  className={cn(
                    "absolute inset-0 will-change-transform transition-all duration-[850ms] ease-[cubic-bezier(0.45,0,0.2,1)]",
                    isSignup
                      ? "translate-x-0 opacity-100 delay-300"
                      : "pointer-events-none translate-x-5 opacity-0",
                  )}
                >
                  <AuthFormPanel
                    mode="signup"
                    title={signupCopy.title}
                    subtitle={signupCopy.subtitle}
                    icon={signupCopy.icon}
                    nextPath={nextPath}
                    seedAccount={seedAccount}
                    desktop
                  />
                </div>
              </div>
            </div>

            <div
              className={cn(
                "absolute inset-y-0 left-1/2 w-1/2 will-change-transform transition-transform duration-[1100ms] ease-[cubic-bezier(0.45,0,0.2,1)]",
                isSignup && "-translate-x-full",
              )}
            >
              <SwitchPanel
                title={copy.panelTitle}
                body={copy.panelBody}
                buttonLabel={copy.panelButton}
                onClick={() => selectMode(copy.panelMode)}
                desktop
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

type AuthFormPanelProps = {
  mode: AuthMode;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  nextPath?: string;
  seedAccount: DevLoginAccount | null;
  desktop?: boolean;
};

function AuthFormPanel({
  mode,
  title,
  subtitle,
  icon: Icon,
  nextPath,
  seedAccount,
  desktop = false,
}: AuthFormPanelProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col justify-center bg-card px-5 py-6 sm:px-9",
        desktop && "px-12",
      )}
    >
      <div className="mx-auto w-full max-w-md">
        <div className="mb-5 text-center">
          <span className="mx-auto flex size-9 items-center justify-center rounded-xl border bg-card text-primary shadow-sm">
            <Icon className="size-4" />
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-normal text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {mode === "signup" ? (
          <SignupForm showModeLink={false} />
        ) : (
          <LoginForm
            nextPath={nextPath}
            showModeLink={false}
            showDevAccounts={false}
            seedAccount={seedAccount}
          />
        )}
      </div>
    </div>
  );
}

type SwitchPanelProps = {
  title: string;
  body: string;
  buttonLabel: string;
  onClick: () => void;
  desktop?: boolean;
};

function SwitchPanel({ title, body, buttonLabel, onClick, desktop = false }: SwitchPanelProps) {
  return (
    <aside
      className={cn(
        "relative flex h-full flex-col justify-center overflow-hidden border-t bg-secondary px-5 py-6 sm:px-9",
        "before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-primary",
        "after:absolute after:inset-0 after:bg-accent/60 after:content-['']",
        desktop && "border-l border-t-0 px-12",
      )}
    >
      <div className="relative z-10 mx-auto w-full max-w-md text-center">
        <div className="mx-auto w-full max-w-sm rounded-xl border bg-background/95 p-4 text-left shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg border bg-primary/10 text-primary">
              <PanelsTopLeft className="size-5" />
            </span>
            <span className="rounded-md border bg-background px-2 py-1 text-xs font-medium text-muted-foreground">
              Milla
            </span>
          </div>
          <div className="mt-4 space-y-2.5">
            {["시설별 필요 물품", "후원 진행 상태", "구매 증빙 기록"].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm text-foreground"
              >
                <span>{item}</span>
                <CheckCircle2 className="size-4 text-primary" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-2xl font-bold tracking-normal text-foreground">{title}</h2>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-muted-foreground">{body}</p>
        </div>

        <Button className="mt-6 w-full max-w-48" onClick={onClick}>
          <KeyRound className="size-4" />
          {buttonLabel}
        </Button>
      </div>
    </aside>
  );
}
