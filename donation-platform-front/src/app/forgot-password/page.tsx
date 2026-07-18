"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { AuthLayout } from "@/shared/ui/AuthLayout";
import { authApi } from "@/entities/user/api/authApi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    try {
      await authApi.requestPasswordReset(email.trim());
    } catch {
      // 유저 열거 방지 — 실패해도 동일 안내
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <AuthLayout title="비밀번호 찾기" subtitle="가입한 이메일로 재설정 링크를 보내드립니다.">
      {sent ? (
        <div className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
          <p className="text-sm text-muted-foreground">
            <b className="text-foreground">{email}</b> 로 재설정 링크를 보냈습니다.
            <br />
            메일함(스팸함 포함)을 확인해 주세요. 링크는 15분간 유효합니다.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm underline hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> 로그인으로
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">이메일</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md border bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "보내는 중..." : "재설정 링크 보내기"}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="underline hover:text-foreground">
              로그인으로 돌아가기
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
