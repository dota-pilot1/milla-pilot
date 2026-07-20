import { CheckCircle2, PackageSearch, ReceiptText, ShieldCheck, Truck } from "lucide-react";
import { RequireAuth } from "@/widgets/guards/RequireAuth";
import { ChalkTitleBanner } from "@/widgets/brand-intro";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { PageShell } from "@/shared/ui/PageShell";

const FLOW_STEPS = [
  {
    icon: PackageSearch,
    title: "필요 물품 공개",
    description: "시설이 등록한 물품과 목표금액이 그대로 공개됩니다. 무엇이 필요한지 먼저 확인할 수 있습니다.",
  },
  {
    icon: CheckCircle2,
    title: "목표 달성 확인",
    description: "여러 후원자의 참여가 모여 목표금액에 도달하면 그 시점이 화면에 그대로 표시됩니다.",
  },
  {
    icon: Truck,
    title: "구매·배송 공개",
    description: "판매처, 구매금액, 송장 정보가 등록되어 물품이 실제로 이동하는 과정을 확인할 수 있습니다.",
  },
  {
    icon: ReceiptText,
    title: "수령·증빙 정리",
    description: "시설의 수령확인과 구매증빙을 묶어 후원자 화면에 남깁니다. 사후에도 계속 조회할 수 있습니다.",
  },
];

export default function IntroTransparencyPage() {
  return (
    <RequireAuth>
      <PageShell width="wide" className="py-6">
        <div className="space-y-5">
          <ChalkTitleBanner
            tag="TRANSPARENCY"
            title="투명한 기부"
            accent="sky"
            subtitle="후원이 어떤 물품으로 이어지는지, 그 과정을 가리지 않고 그대로 보여드립니다."
          />

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">공개 원칙</h2>
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>목표금액은 추상적인 모금액이 아니라 실제 구매 총액을 기준으로 표시합니다.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>구매·배송·수령 각 단계는 시설과 운영팀이 기록한 정보를 그대로 후원자 화면에 반영합니다.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>구매증빙과 세액공제 기부금영수증은 성격이 다르므로 화면에서 구분해서 안내합니다.</span>
              </li>
            </ul>
          </Card>

          <Card className="p-5">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">후원 한 건이 시설에 닿기까지</h2>
                <p className="mt-1 text-sm text-muted-foreground">단계마다 남는 기록이 후원자 화면에 그대로 노출됩니다.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {FLOW_STEPS.map((step, index) => (
                  <div key={step.title} className="flex gap-3 rounded-xl border bg-background p-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <step.icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                          {index + 1}
                        </Badge>
                        <h3 className="text-sm font-semibold">{step.title}</h3>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </PageShell>
    </RequireAuth>
  );
}
