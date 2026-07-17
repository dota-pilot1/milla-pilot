"use client";

import { Building2 } from "lucide-react";
import { AdminPlaceholderPage } from "@/shared/ui/AdminPlaceholderPage";

export default function FacilitiesPage() {
  return (
    <AdminPlaceholderPage
      title="후원 시설"
      description="후원자가 공개된 시설 목록을 확인하고 시설별 필요 물품으로 이동합니다."
      icon={Building2}
      tasks={[
        "공개 시설 목록 조회",
        "시설별 기본 정보 표시",
        "시설별 후원 물품 목록 연결",
        "시설 상세 페이지 연결",
      ]}
    />
  );
}
