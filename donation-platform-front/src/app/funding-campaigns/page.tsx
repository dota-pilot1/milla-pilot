"use client";

import { HandCoins } from "lucide-react";
import { RequireRole } from "@/widgets/guards/RequireRole";
import { AdminPlaceholderPage } from "@/shared/ui/AdminPlaceholderPage";

export default function FundingCampaignsPage() {
  return (
    <RequireRole roles={["ROLE_ADMIN", "ROLE_MANAGER"]}>
      <AdminPlaceholderPage
        title="펀딩 캠페인"
        description="후원 물품별 목표 금액, 진행률, 마감 상태를 관리합니다."
        icon={HandCoins}
        tasks={["목표 금액 설정", "펀딩 진행률 확인", "달성 시 결제 잠금", "캠페인 공개/마감"]}
      />
    </RequireRole>
  );
}
