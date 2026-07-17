"use client";

import { ReceiptText } from "lucide-react";
import { RequireRole } from "@/widgets/guards/RequireRole";
import { AdminPlaceholderPage } from "@/shared/ui/AdminPlaceholderPage";

export default function ContributionsPage() {
  return (
    <RequireRole roles={["ROLE_ADMIN", "ROLE_MANAGER"]}>
      <AdminPlaceholderPage
        title="후원 내역"
        description="후원자별 결제 내역, 누적 금액, 취소/환불 상태를 확인합니다."
        icon={ReceiptText}
        tasks={["후원자별 결제 조회", "누적 금액 대조", "취소/환불 처리", "결제 상태 이력"]}
      />
    </RequireRole>
  );
}
