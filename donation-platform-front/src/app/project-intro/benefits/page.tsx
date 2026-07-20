import { ClipboardList, Handshake, PackageCheck, Sparkles } from "lucide-react";
import { RequireAuth } from "@/widgets/guards/RequireAuth";
import { ChalkTitleBanner } from "@/widgets/brand-intro";
import { Card } from "@/shared/ui/Card";
import { PageShell } from "@/shared/ui/PageShell";

const BENEFIT_ITEMS = [
  {
    icon: ClipboardList,
    title: "물품 등록만 하면 됩니다",
    description: "필요한 물품과 수량을 올리면, 여러 후원자가 나눠서 채워 갑니다. 모금 독려나 개별 연락은 필요하지 않습니다.",
  },
  {
    icon: PackageCheck,
    title: "구매 실무는 운영팀이 맡습니다",
    description: "목표금액이 채워지면 운영팀이 구매를 진행하고 증빙을 남깁니다. 시설은 수령확인만 하면 됩니다.",
  },
  {
    icon: Handshake,
    title: "진행 상황을 함께 확인합니다",
    description: "모금·구매·배송 현황이 같은 화면에서 후원자와 시설 모두에게 공개되어, 별도로 안내드릴 필요가 줄어듭니다.",
  },
];

export default function IntroBenefitsPage() {
  return (
    <RequireAuth>
      <PageShell width="wide" className="py-6">
        <div className="space-y-5">
          <ChalkTitleBanner
            tag="BENEFITS"
            title="기부처 혜택"
            accent="pink"
            subtitle="시설 담당 선생님이 서류 대신 아이들을 챙기는 데 더 집중할 수 있도록 돕습니다."
          />

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">시설이 덜어내는 것</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-1">
              {BENEFIT_ITEMS.map((item) => (
                <div key={item.title} className="flex gap-3 rounded-xl border bg-background p-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <item.icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold">{item.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-sm leading-6 text-muted-foreground">
              지금은 1차 MVP 단계라 실제 결제 없이 참여 기록과 이행 과정 공개를 먼저 검증하고 있습니다.
              실결제 도입, 현물 후원 접수 같은 확장 기능은 운영 정책이 확정되는 대로 순서대로 안내드리겠습니다.
            </p>
          </Card>
        </div>
      </PageShell>
    </RequireAuth>
  );
}
