"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertCircle, LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";
import { loginSchema, type LoginFormValues } from "@/shared/lib/validation/auth.schema";
import { authActions } from "@/entities/user/model/authStore";
import { getApiError } from "@/shared/api/errors";
import { Button } from "@/shared/ui/Button";
import { FormField } from "@/shared/ui/FormField";
import { TextInput } from "@/shared/ui/TextInput";
import { PasswordInput } from "@/shared/ui/PasswordInput";
import { Switch } from "@/shared/ui/Switch";

type LoginFormProps = {
  nextPath?: string;
  showModeLink?: boolean;
  showDevAccounts?: boolean;
  seedAccount?: DevLoginAccount | null;
};

export type DevLoginAccount = {
  label: string;
  description: string;
  email: string;
  password: string;
};

export const devLoginAccounts: DevLoginAccount[] = [
  {
    label: "김서연",
    description: "ROLE_DONOR",
    email: "seoyeon.kim@gmail.com",
    password: "password123",
  },
  {
    label: "이준호",
    description: "ROLE_DONOR",
    email: "junho.lee@naver.com",
    password: "password123",
  },
  {
    label: "박지우",
    description: "ROLE_DONOR",
    email: "jiwoo.park@daum.net",
    password: "password123",
  },
  {
    label: "최민준",
    description: "ROLE_DONOR",
    email: "minjun.choi@gmail.com",
    password: "password123",
  },
  {
    label: "정하윤",
    description: "ROLE_DONOR",
    email: "hayoon.jung@naver.com",
    password: "password123",
  },
  {
    label: "강도윤",
    description: "ROLE_DONOR",
    email: "doyoon.kang@kakao.com",
    password: "password123",
  },
  {
    label: "윤서준",
    description: "ROLE_DONOR",
    email: "seojun.yoon@gmail.com",
    password: "password123",
  },
  {
    label: "임지호",
    description: "ROLE_DONOR",
    email: "jiho.lim@naver.com",
    password: "password123",
  },
  {
    label: "한예은",
    description: "ROLE_DONOR",
    email: "yeeun.han@daum.net",
    password: "password123",
  },
  {
    label: "오시우",
    description: "ROLE_DONOR",
    email: "siwoo.oh@gmail.com",
    password: "password123",
  },
  {
    label: "배준영",
    description: "ROLE_PLATFORM_ADMIN",
    email: "admin@milla.im",
    password: "password123",
  },
  {
    label: "오은주",
    description: "ROLE_FACILITY_ADMIN",
    email: "haetsal.admin@milla.im",
    password: "password123",
  },
  {
    label: "신재훈",
    description: "ROLE_FACILITY_ADMIN",
    email: "pureunsup.admin@milla.im",
    password: "password123",
  },
  {
    label: "문가영",
    description: "ROLE_FACILITY_ADMIN",
    email: "onmaeul.admin@milla.im",
    password: "password123",
  },
  {
    label: "조성민",
    description: "ROLE_FACILITY_ADMIN",
    email: "saessak.admin@milla.im",
    password: "password123",
  },
];

const REMEMBER_EMAIL_KEY = "milla.rememberedEmail";

export function LoginForm({
  nextPath,
  showModeLink = true,
  showDevAccounts = true,
  seedAccount,
}: LoginFormProps) {
  const router = useRouter();
  const { t } = useTranslation("auth");
  const [formError, setFormError] = useState<string | null>(null);
  const [rememberEmail, setRememberEmail] = useState(false);
  const showDevLoginAccounts = process.env.NODE_ENV !== "production";

  const safePath =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/dashboard";

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      email: showDevLoginAccounts ? devLoginAccounts[0].email : "",
      password: showDevLoginAccounts ? devLoginAccounts[0].password : "",
    },
  });

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (saved) {
      setValue("email", saved);
      setRememberEmail(true);
    }
  }, [setValue]);

  const fillDevAccount = useCallback((account: DevLoginAccount) => {
    setFormError(null);
    setValue("email", account.email, { shouldDirty: true, shouldValidate: true });
    setValue("password", account.password, { shouldDirty: true, shouldValidate: true });
  }, [setValue]);

  useEffect(() => {
    if (seedAccount) {
      fillDevAccount(seedAccount);
    }
  }, [fillDevAccount, seedAccount]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await authActions.login(values.email, values.password);
      if (rememberEmail) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, values.email);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
      toast.success(t("loginSuccess"));
      router.replace(safePath);
    } catch (e) {
      const apiError = getApiError(e);
      if (apiError?.code === "AUTH_003") {
        setError("password", { type: "server", message: apiError.message });
      } else if (apiError?.code === "AUTH_004") {
        setError("email", { type: "server", message: apiError.message });
      } else {
        setFormError(apiError?.message ?? t("loginFailed"));
      }
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {formError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <FormField label={t("email")} htmlFor="login-email" error={errors.email?.message}>
        <TextInput
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          invalid={!!errors.email}
          aria-invalid={!!errors.email}
          {...register("email")}
        />
      </FormField>

      <FormField label={t("password")} htmlFor="login-password" error={errors.password?.message}>
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          placeholder="••••••••"
          invalid={!!errors.password}
          aria-invalid={!!errors.password}
          {...register("password")}
        />
      </FormField>

      <div className="flex items-center justify-between">
        <div className="flex select-none items-center gap-2 text-sm text-muted-foreground">
          <Switch
            checked={rememberEmail}
            onCheckedChange={setRememberEmail}
            aria-label="이메일 기억하기"
          />
          이메일 기억하기
        </div>
        <Link
          href="/forgot-password"
          className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          비밀번호 찾기
        </Link>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        <LogIn className="h-4 w-4" />
        {isSubmitting ? t("signingIn") : t("signInButton")}
      </Button>

      {showDevLoginAccounts && showDevAccounts ? (
        <section className="rounded-lg border border-dashed border-border bg-muted/30 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-foreground">개발용 빠른 입력</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                시더 계정은 입력 보조용이며 운영 빌드에서는 숨겨집니다.
              </p>
            </div>
            <span className="hidden shrink-0 rounded-full bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground sm:inline-flex">
              password123
            </span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {devLoginAccounts.map((account) => (
              <Button
                key={account.email}
                variant="outline"
                onClick={() => fillDevAccount(account)}
                className="h-auto flex-col items-start gap-1 px-3 py-2 text-left text-xs"
              >
                <span className="font-medium text-foreground">{account.label}</span>
                <span className="max-w-full truncate text-muted-foreground">{account.email}</span>
              </Button>
            ))}
          </div>
        </section>
      ) : null}

      {showModeLink ? (
        <>
          <div className="relative py-1 text-center">
            <span className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" />
            <span className="bg-background px-3 text-xs text-muted-foreground">
              {t("noAccount")}
            </span>
          </div>

          <Button asChild variant="outline" className="w-full">
            <Link href="/register">{t("signUpLink")}</Link>
          </Button>
        </>
      ) : null}
    </form>
  );
}
