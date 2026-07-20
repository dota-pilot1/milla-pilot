"use client";

import Link from "next/link";
import { KeyRound } from "lucide-react";
import { RequireAuth } from "@/widgets/guards/RequireAuth";
import { buttonVariants } from "@/shared/ui/Button";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageShell } from "@/shared/ui/PageShell";
import { PermissionTable } from "@/features/permission-management/PermissionTable";

export default function PermissionsPage() {
  return (
    <RequireAuth>
      <PageShell className="space-y-6">
        <PageHeader
          icon={KeyRound}
          title="권한 관리"
          description="시스템 권한(Permission)을 조회하고 등록·수정·삭제할 수 있습니다."
          actions={
            <Link href="/role-permissions" className={buttonVariants({ size: "sm" })}>
              역할-권한 매핑
            </Link>
          }
        />
        <PermissionTable />
      </PageShell>
    </RequireAuth>
  );
}
