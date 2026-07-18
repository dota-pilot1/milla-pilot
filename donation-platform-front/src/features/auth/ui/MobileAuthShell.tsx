"use client";

import { useState } from "react";
import { KeyRound, LogIn, UserPlus, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LoginForm, type DevLoginAccount } from "@/features/auth/login/LoginForm";
import { SignupForm } from "@/features/auth/signup/SignupForm";
import { SeedAccountPicker } from "@/features/auth/ui/SeedAccountPicker";
import { Button } from "@/shared/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/Dialog";

type AuthMode = "login" | "signup";

type MobileAuthShellProps = {
  initialMode: AuthMode;
  nextPath?: string;
  seedAccount: DevLoginAccount | null;
  onSeedAccountSelect: (account: DevLoginAccount) => void;
  onModeChange: (mode: AuthMode) => void;
};

const isDev = process.env.NODE_ENV !== "production";

export function MobileAuthShell({
  initialMode,
  nextPath,
  seedAccount,
  onSeedAccountSelect,
  onModeChange,
}: MobileAuthShellProps) {
  const { t } = useTranslation("auth");
  const [seedOpen, setSeedOpen] = useState(false);
  const isSignup = initialMode === "signup";
  const title = isSignup ? t("signUpTitle") : t("signInTitle");
  const subtitle = isSignup ? t("signUpSubtitle") : t("signInSubtitle");
  const Icon = isSignup ? UserPlus : LogIn;

  return (
    <section className="mx-auto w-full max-w-md overflow-hidden rounded-xl border bg-card shadow-lg shadow-foreground/5">
      <div className="border-b bg-muted/30 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border bg-card text-primary shadow-sm">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-normal text-foreground">{title}</h1>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>

          {isDev ? (
            <Dialog open={seedOpen} onOpenChange={setSeedOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0">
                  <Zap className="size-4" />
                  시더
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md p-4">
                <DialogHeader>
                  <DialogTitle>개발용 시더 계정</DialogTitle>
                  <DialogDescription>계정을 선택하면 로그인 폼에 자동 입력됩니다.</DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  <SeedAccountPicker
                    onSelect={(account) => {
                      onSeedAccountSelect(account);
                      setSeedOpen(false);
                    }}
                    compact
                  />
                </div>
              </DialogContent>
            </Dialog>
          ) : null}
        </div>
      </div>

      <div className="px-4 py-5">
        {isSignup ? (
          <SignupForm showModeLink={false} />
        ) : (
          <LoginForm
            nextPath={nextPath}
            showModeLink={false}
            showDevAccounts={false}
            seedAccount={seedAccount}
          />
        )}

        <div className="mt-5 rounded-lg border bg-secondary p-4 text-center">
          <p className="text-sm font-semibold text-foreground">
            {isSignup ? "이미 계정이 있나요?" : "계정이 아직 없나요?"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {isSignup
              ? "등록된 계정으로 후원 내역을 계속 확인할 수 있습니다."
              : "가입 후 후원 진행 상태와 구매 증빙을 확인할 수 있습니다."}
          </p>
          <Button
            variant="outline"
            className="mt-3 w-full bg-background"
            onClick={() => onModeChange(isSignup ? "login" : "signup")}
          >
            <KeyRound className="size-4" />
            {isSignup ? t("signInLink") : t("signUpLink")}
          </Button>
        </div>
      </div>
    </section>
  );
}
