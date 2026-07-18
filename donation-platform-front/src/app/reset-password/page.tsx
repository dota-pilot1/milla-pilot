"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { AuthLayout } from "@/shared/ui/AuthLayout";
import { PasswordInput } from "@/shared/ui/PasswordInput";
import { authApi } from "@/entities/user/api/authApi";

function ResetPasswordInner() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const invalidLink = !token;
  const mismatch = pw2.length > 0 && pw !== pw2;
  const canSubmit = pw.length >= 8 && pw === pw2 && !loading;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      await authApi.confirmPasswordReset(token, pw);
      setDone(true);
      setTimeout(() => router.push("/login"), 1800);
    } catch {
      setError("링크가 만료되었거나 유효하지 않습니다. 다시 요청해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  if (invalidLink) {
    return (
      <AuthLayout title="비밀번호 재설정" subtitle="잘못된 접근입니다.">
        <div className="space-y-4 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
          <p className="text-sm text-muted-foreground">재설정 토큰이 없습니다. 메일의 링크로 다시 접속해 주세요.</p>
          <Link href="/forgot-password" className="inline-block text-sm underline hover:text-foreground">
            재설정 링크 다시 받기
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout title="비밀번호 재설정" subtitle="완료되었습니다.">
        <div className="space-y-3 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
          <p className="text-sm text-muted-foreground">비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="비밀번호 재설정" subtitle="새 비밀번호를 입력하세요.">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">새 비밀번호</label>
          <PasswordInput
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="8자 이상"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">비밀번호 확인</label>
          <PasswordInput
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            placeholder="다시 입력"
            invalid={mismatch}
          />
          {mismatch ? (
            <p className="text-xs text-destructive">비밀번호가 일치하지 않습니다.</p>
          ) : null}
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "변경 중..." : "비밀번호 변경"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}
