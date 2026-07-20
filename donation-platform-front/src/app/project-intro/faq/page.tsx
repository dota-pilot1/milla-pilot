import { HelpCircle } from "lucide-react";
import { RequireAuth } from "@/widgets/guards/RequireAuth";
import { ChalkTitleBanner } from "@/widgets/brand-intro";
import { Card } from "@/shared/ui/Card";
import { PageShell } from "@/shared/ui/PageShell";

const FAQ_ITEMS = [
  {
    q: "지금 참여하면 실제로 결제가 되나요?",
    a: "아니요. 1차 MVP는 실제 결제 없이 참여를 기록하는 단계입니다. 시설이 올린 물품에 참여하면 그 기록이 목표금액에 반영되고, 목표를 채운 뒤 운영팀이 구매를 진행합니다. 실결제 도입은 별도 검토를 거쳐 순서대로 안내드립니다.",
  },
  {
    q: "제가 참여한 물품이 실제로 전달됐는지 어떻게 확인하나요?",
    a: "물품 상태가 모집중 → 목표달성 → 통합구매 → 배송중 → 수령확인 순서로 바뀌며, 각 단계의 판매처·구매금액·송장 정보가 후원자 화면에 그대로 표시됩니다.",
  },
  {
    q: "구매증빙과 기부금영수증은 같은 건가요?",
    a: "다릅니다. 구매증빙은 물품을 구매했다는 기록이고, 세액공제를 위한 기부금영수증은 별도 절차로 발급됩니다. 두 문서는 화면에서도 구분해서 안내합니다.",
  },
  {
    q: "여러 명이 같은 물품에 함께 참여할 수 있나요?",
    a: "네. 한 물품의 목표금액을 여러 후원자가 나눠서 채우는 방식입니다. 목표금액에 도달하면 추가 참여가 자동으로 잠겨 중복 결제나 초과 모금이 발생하지 않습니다.",
  },
  {
    q: "시설이 요청한 물품이 아닌 것도 후원할 수 있나요?",
    a: "아니요. 시설이 직접 등록한 물품만 카탈로그에 노출됩니다. 임의의 물품을 추가로 후원할 수는 없습니다.",
  },
];

export default function IntroFaqPage() {
  return (
    <RequireAuth>
      <PageShell width="wide" className="py-6">
        <div className="space-y-5">
          <ChalkTitleBanner
            tag="FAQ"
            title="자주 묻는 질문"
            accent="pink"
            subtitle="후원 참여부터 진행 상태 확인까지 자주 궁금해하시는 내용을 정리했습니다."
          />

          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <HelpCircle className="size-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">질문 모음</h2>
            </div>
            <ul className="space-y-3">
              {FAQ_ITEMS.map((item) => (
                <li key={item.q} className="rounded-xl border bg-background p-4">
                  <p className="text-sm font-semibold">Q. {item.q}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">A. {item.a}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </PageShell>
    </RequireAuth>
  );
}
