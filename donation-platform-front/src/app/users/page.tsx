"use client";

import Link from "next/link";
import { KeyRound, ShieldCheck, UsersRound } from "lucide-react";
import { RequireAuth } from "@/widgets/guards/RequireAuth";
import { buttonVariants } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageShell } from "@/shared/ui/PageShell";
import { UserTableWithGuard } from "@/features/user-management/UserTable";

const SETUP_STEPS = [
  { title: "1. 권한 정의", description: "후원, 구매, 증빙 기능별 권한 코드를 먼저 등록합니다." },
  { title: "2. 롤 구성", description: "권한 묶음을 관리자, 운영자, 시설 담당자 롤에 연결합니다." },
  { title: "3. 유저 배정", description: "후원자와 운영 담당자에게 필요한 롤만 부여합니다." },
];

export default function UsersPage() {
  return (
    <RequireAuth>
      <PageShell className="space-y-6">
        <PageHeader
          icon={UsersRound}
          title="유저 관리"
          description="전체 유저 목록을 조회하고 역할 및 활성 상태를 변경할 수 있습니다."
          actions={
            <>
              <Link href="/roles" className={buttonVariants({ variant: "outline", size: "sm" })}>
                <UsersRound />
                롤 관리
              </Link>
              <Link
                href="/permissions"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <KeyRound />
                권한 관리
              </Link>
              <Link href="/role-permissions" className={buttonVariants({ size: "sm" })}>
                <ShieldCheck />
                역할-권한 매핑
              </Link>
            </>
          }
        />

        <Card className="grid gap-5 p-5 md:grid-cols-3">
          {SETUP_STEPS.map((step) => (
            <div key={step.title}>
              <p className="text-sm font-semibold">{step.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </Card>

        <UserTableWithGuard />
      </PageShell>
    </RequireAuth>
  );
}
