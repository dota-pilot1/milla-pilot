"use client";

import { Zap } from "lucide-react";
import { devLoginAccounts, type DevLoginAccount } from "@/features/auth/login/LoginForm";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/utils";

type SeedAccountPickerProps = {
  onSelect: (account: DevLoginAccount) => void;
  compact?: boolean;
};

export function SeedAccountPicker({ onSelect, compact = false }: SeedAccountPickerProps) {
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

              return (
                <Button
                  key={account.email}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-auto min-h-7 flex-col items-start gap-0.5 rounded-md px-2.5 py-1 text-left text-xs",
                    role.buttonClassName,
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
                </Button>
              );
            })}
          </div>
        </div>
        <span className="hidden shrink-0 pt-1 text-xs text-muted-foreground xl:block">
          password123
        </span>
      </div>
    </section>
  );
}

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
