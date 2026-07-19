"use client";

import { Check, Info, ShieldCheck, Users, Zap } from "lucide-react";
import { devLoginAccounts, type DevLoginAccount } from "@/features/auth/login/LoginForm";
import { Button } from "@/shared/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/Dialog";
import { cn } from "@/shared/lib/utils";

type SeedAccountPickerProps = {
  onSelect: (account: DevLoginAccount) => void;
  selectedEmail?: string | null;
  compact?: boolean;
};

export function SeedAccountPicker({ onSelect, selectedEmail, compact = false }: SeedAccountPickerProps) {
  return (
    <section className={cn("rounded-xl border bg-card shadow-sm", compact ? "p-2" : "p-2.5")}>
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 hidden size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary sm:flex">
          <Zap className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-3 gap-1 sm:grid-cols-5 lg:grid-cols-10">
            {devLoginAccounts.map((account) => {
              const role = getSeedRoleView(account.description);
              const selected = selectedEmail === account.email;

              return (
                <Button
                  key={account.email}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "relative h-auto min-h-7 flex-col items-start gap-0.5 rounded-md px-2.5 py-1 text-left text-xs",
                    role.buttonClassName,
                    selected && "ring-2 ring-ring ring-offset-1 ring-offset-background",
                  )}
                  onClick={() => onSelect(account)}
                >
                  <span className="font-semibold text-foreground">{account.label}</span>
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-bold leading-none",
                      role.badgeClassName,
                    )}
                  >
                    {role.label}
                  </span>
                  {selected ? (
                    <Check className="absolute right-1.5 top-1.5 size-3.5 text-foreground" />
                  ) : null}
                </Button>
              );
            })}
          </div>
        </div>
        <RoleGuideDialog />
      </div>
    </section>
  );
}

function RoleGuideDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hidden shrink-0 rounded-lg px-2.5 text-xs font-bold xl:inline-flex"
        >
          <Info className="size-3.5" />
          역할 안내
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>역할 구분과 접근 권한</DialogTitle>
          <DialogDescription>
            테스트 계정은 같은 비밀번호를 사용하지만, 역할에 따라 볼 수 있는 메뉴와 수행 가능한 작업이 다릅니다.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {roleGuides.map((role) => (
            <article key={role.code} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", role.iconClassName)}>
                  {role.icon}
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground">{role.title}</h3>
                  <p className="mt-1 text-xs font-mono text-muted-foreground">{role.code}</p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{role.description}</p>
              <ul className="mt-3 space-y-1.5">
                {role.permissions.map((permission) => (
                  <li key={permission} className="flex gap-2 text-sm text-foreground">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span>{permission}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          모든 테스트 계정의 기본 비밀번호는 <span className="font-mono font-semibold text-foreground">password123</span>입니다.
        </div>
      </DialogContent>
    </Dialog>
  );
}

const roleGuides = [
  {
    title: "플랫폼 관리자",
    code: "ROLE_PLATFORM_ADMIN",
    icon: <Zap className="size-4" />,
    iconClassName: "bg-destructive/10 text-destructive",
    description: "플랫폼 전체 운영과 관리 메뉴에 접근하는 최상위 역할입니다.",
    permissions: ["시설·후원·구매 전체 관리", "사용자와 역할 관리", "메뉴와 권한 정책 관리"],
  },
  {
    title: "시설 관리자",
    code: "ROLE_FACILITY_ADMIN",
    icon: <ShieldCheck className="size-4" />,
    iconClassName: "bg-primary/10 text-primary ring-1 ring-primary/20",
    description: "소속 시설의 후원 준비와 물품 상태를 관리합니다.",
    permissions: ["담당 시설 물품 관리", "시설별 후원 현황 확인", "배송·수령 흐름 확인"],
  },
  {
    title: "후원자",
    code: "ROLE_DONOR",
    icon: <Users className="size-4" />,
    iconClassName: "bg-secondary text-secondary-foreground ring-1 ring-border",
    description: "후원 화면을 이용하는 일반 사용자 역할입니다.",
    permissions: ["후원 가능한 시설과 물품 확인", "후원 참여", "내 후원 내역 확인"],
  },
] as const;

function getSeedRoleView(roleCode: string) {
  if (roleCode === "ROLE_PLATFORM_ADMIN") {
    return {
      label: "플랫폼",
      buttonClassName: "border-destructive/35 bg-destructive/5 hover:bg-destructive/10",
      badgeClassName: "bg-destructive text-white",
    };
  }

  if (roleCode === "ROLE_FACILITY_ADMIN") {
    return {
      label: "시설",
      buttonClassName: "border-primary/35 bg-primary/5 hover:bg-primary/10",
      badgeClassName: "bg-primary text-primary-foreground",
    };
  }

  return {
    label: "후원자",
    buttonClassName: "border-border bg-background hover:bg-muted",
    badgeClassName: "border border-border bg-muted text-muted-foreground",
  };
}
