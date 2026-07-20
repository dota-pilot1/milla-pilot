"use client";

import { FolderTree } from "lucide-react";
import { RequireAuth } from "@/widgets/guards/RequireAuth";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageShell } from "@/shared/ui/PageShell";
import { PermissionCategoryTable } from "@/features/permission-management/PermissionCategoryTable";

export default function PermissionCategoriesPage() {
  return (
    <RequireAuth>
      <PageShell className="space-y-6">
        <PageHeader
          icon={FolderTree}
          title="권한 카테고리 관리"
          description="권한(Permission)을 분류하는 카테고리를 조회하고 등록·수정·삭제할 수 있습니다."
        />
        <PermissionCategoryTable />
      </PageShell>
    </RequireAuth>
  );
}
