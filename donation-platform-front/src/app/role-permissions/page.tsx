"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { RequireAuth } from "@/widgets/guards/RequireAuth";
import { buttonVariants } from "@/shared/ui/Button";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageShell } from "@/shared/ui/PageShell";
import { RolePermissionManager } from "@/features/role-management/RolePermissionManager";

export default function RolePermissionsPage() {
  return (
    // 좌우 2단 매핑 UI라 가로 여유가 필요하다.
    <RequireAuth>
      <PageShell width="wide" className="space-y-6">
        <PageHeader
          icon={ShieldCheck}
          title="역할-권한 매핑"
          description="역할별 권한을 설정하고, 유저 롤을 한 화면에서 관리하세요."
          actions={
            <Link href="/permissions" className={buttonVariants({ size: "sm" })}>
              권한 관리
            </Link>
          }
        />
        <RolePermissionManager />
      </PageShell>
    </RequireAuth>
  );
}
