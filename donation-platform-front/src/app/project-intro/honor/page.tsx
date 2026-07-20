import { Award } from "lucide-react";
import { RequireAuth } from "@/widgets/guards/RequireAuth";
import { ChalkTitleBanner } from "@/widgets/brand-intro";
import { Card } from "@/shared/ui/Card";
import { PageShell } from "@/shared/ui/PageShell";

export default function IntroHonorPage() {
  return (
    <RequireAuth>
      <PageShell width="wide" className="py-6">
        <div className="space-y-5">
          <ChalkTitleBanner
            tag="HONOR"
            title="명예 홍보관"
            accent="yellow"
            subtitle="꾸준히 함께해 준 기부자와 단체를 기록하는 공간을 준비하고 있습니다."
          />

          <Card className="flex flex-col items-center gap-3 p-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Award className="size-6" />
            </span>
            <h2 className="text-lg font-semibold tracking-tight">아직 준비 중입니다</h2>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              1차 MVP는 시설별 후원 흐름을 검증하는 단계라 명예 홍보관은 아직 열리지 않았습니다.
              후원자·단체를 기록하는 방식이 정해지면 이곳에서 안내드리겠습니다.
            </p>
          </Card>
        </div>
      </PageShell>
    </RequireAuth>
  );
}
