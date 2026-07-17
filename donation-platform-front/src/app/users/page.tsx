"use client";

import Link from "next/link";
import { KeyRound, ShieldCheck, UsersRound } from "lucide-react";
import { RequireAuth } from "@/widgets/guards/RequireAuth";
import { UserTableWithGuard } from "@/features/user-management/UserTable";

export default function UsersPage() {
  return (
    <RequireAuth>
      <main className="w-full px-4 py-4">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">유저 관리</h1>
            <p className="text-sm text-muted-foreground mt-1">
              전체 유저 목록을 조회하고 역할 및 활성 상태를 변경할 수 있습니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/roles"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-accent"
            >
              <UsersRound className="h-4 w-4" />
              롤 관리
            </Link>
            <Link
              href="/permissions"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-accent"
            >
              <KeyRound className="h-4 w-4" />
              권한 관리
            </Link>
            <Link
              href="/role-permissions"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <ShieldCheck className="h-4 w-4" />
              역할-권한 매핑
            </Link>
          </div>
        </header>

        <section className="mb-5 grid gap-3 border-y border-border bg-muted/25 py-3 text-sm md:grid-cols-3">
          <div className="px-1">
            <p className="font-semibold">1. 권한 정의</p>
            <p className="mt-1 text-xs text-muted-foreground">후원, 구매, 증빙 기능별 권한 코드를 먼저 등록합니다.</p>
          </div>
          <div className="px-1">
            <p className="font-semibold">2. 롤 구성</p>
            <p className="mt-1 text-xs text-muted-foreground">권한 묶음을 관리자, 운영자, 시설 담당자 롤에 연결합니다.</p>
          </div>
          <div className="px-1">
            <p className="font-semibold">3. 유저 배정</p>
            <p className="mt-1 text-xs text-muted-foreground">후원자와 운영 담당자에게 필요한 롤만 부여합니다.</p>
          </div>
        </section>

        <UserTableWithGuard />
      </main>
    </RequireAuth>
  );
}
