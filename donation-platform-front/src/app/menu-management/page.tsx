"use client";

import { Menu } from "lucide-react";
import { RequireRole } from "@/widgets/guards/RequireRole";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageShell } from "@/shared/ui/PageShell";
import { MenuTreeTab } from "@/features/menu-management/MenuTreeTab";

export default function MenuManagementPage() {
  return (
    // 트리 + 상세 패널 2단 구성이라 가로 여유가 필요하다.
    <RequireRole roles={["ROLE_ADMIN"]}>
      <PageShell width="wide" className="space-y-6">
        <PageHeader
          icon={Menu}
          title="헤더 메뉴 관리"
          description="헤더 메뉴를 추가·수정·삭제하고 드래그로 순서를 변경합니다. 변경 사항은 즉시 헤더에 반영됩니다."
        />
        <MenuTreeTab />
      </PageShell>
    </RequireRole>
  );
}
