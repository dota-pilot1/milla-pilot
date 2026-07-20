"use client";

import { ShieldCheck } from "lucide-react";
import { RequireAuth } from "@/widgets/guards/RequireAuth";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageShell } from "@/shared/ui/PageShell";
import { RoleTable } from "@/features/role-management/RoleTable";

export default function RolesPage() {
  return (
    <RequireAuth>
      <PageShell className="space-y-6">
        <PageHeader
          icon={ShieldCheck}
          title="롤 관리"
          description="시스템 롤을 조회하고 커스텀 롤을 등록·수정·삭제할 수 있습니다."
        />
        <RoleTable />
      </PageShell>
    </RequireAuth>
  );
}
