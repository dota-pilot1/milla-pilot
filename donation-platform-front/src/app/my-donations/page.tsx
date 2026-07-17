"use client";

import { ReceiptText } from "lucide-react";
import { AdminPlaceholderPage } from "@/shared/ui/AdminPlaceholderPage";

export default function MyDonationsPage() {
  return (
    <AdminPlaceholderPage
      title="내 후원 내역"
      description="내가 참여한 후원과 결제 상태, 목표 달성 여부를 확인합니다."
      icon={ReceiptText}
      tasks={[
        "내 후원 목록 조회",
        "결제 상태와 후원 금액 확인",
        "후원 물품의 목표 달성 상태 확인",
        "영수증과 증빙 자료 연결",
      ]}
    />
  );
}
