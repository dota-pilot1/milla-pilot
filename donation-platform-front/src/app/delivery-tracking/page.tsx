"use client";

import { Truck } from "lucide-react";
import { RequireRole } from "@/widgets/guards/RequireRole";
import { AdminPlaceholderPage } from "@/shared/ui/AdminPlaceholderPage";

export default function DeliveryTrackingPage() {
  return (
    <RequireRole roles={["ROLE_ADMIN", "ROLE_MANAGER"]}>
      <AdminPlaceholderPage
        title="배송 추적"
        description="주문 물품의 배송, 수령, 시설 전달 상태를 추적합니다."
        icon={Truck}
        tasks={["배송 상태 등록", "운송장 관리", "시설 수령 확인", "전달 완료 이력"]}
      />
    </RequireRole>
  );
}
