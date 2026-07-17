"use client";

import { ShoppingCart } from "lucide-react";
import { RequireRole } from "@/widgets/guards/RequireRole";
import { AdminPlaceholderPage } from "@/shared/ui/AdminPlaceholderPage";

export default function PurchaseOrdersPage() {
  return (
    <RequireRole roles={["ROLE_ADMIN", "ROLE_MANAGER"]}>
      <AdminPlaceholderPage
        title="통합 구매"
        description="목표 달성 물품의 구매 요청, 발주, 품절, 가격 변동을 처리합니다."
        icon={ShoppingCart}
        tasks={["구매 대상 묶기", "발주 상태 관리", "품절/가격변동 기록", "구매 완료 처리"]}
      />
    </RequireRole>
  );
}
