"use client";

import { FileText } from "lucide-react";
import { RequireRole } from "@/widgets/guards/RequireRole";
import { AdminPlaceholderPage } from "@/shared/ui/AdminPlaceholderPage";

export default function ReceiptsPage() {
  return (
    <RequireRole roles={["ROLE_ADMIN", "ROLE_MANAGER"]}>
      <AdminPlaceholderPage
        title="증빙 관리"
        description="구매 영수증, 배송 증빙, 후원 결과 보고 자료를 관리합니다."
        icon={FileText}
        tasks={["영수증 업로드", "증빙 파일 연결", "후원 결과 보고", "파일 공개 범위 설정"]}
      />
    </RequireRole>
  );
}
