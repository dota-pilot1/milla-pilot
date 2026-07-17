"use client";

import { PackagePlus } from "lucide-react";
import { RequireRole } from "@/widgets/guards/RequireRole";
import { AdminPlaceholderPage } from "@/shared/ui/AdminPlaceholderPage";

export default function DonationItemsPage() {
  return (
    <RequireRole roles={["ROLE_ADMIN", "ROLE_MANAGER"]}>
      <AdminPlaceholderPage
        title="후원 물품 관리"
        description="시설이 요청한 물품, 목표 수량, 예상 단가, 승인 상태를 관리합니다."
        icon={PackagePlus}
        tasks={["물품 등록/승인", "목표 수량 설정", "예상 단가 관리", "시설 요청 내역 연결"]}
      />
    </RequireRole>
  );
}
