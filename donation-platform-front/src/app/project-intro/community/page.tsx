import { RequireAuth } from "@/widgets/guards/RequireAuth";
import { ChalkTitleBanner, MessageWallPrototype } from "@/widgets/brand-intro";
import { PageShell } from "@/shared/ui/PageShell";

export default function IntroCommunityPage() {
  return (
    <RequireAuth>
      <PageShell width="wide" className="py-6">
        <div className="space-y-5">
          <ChalkTitleBanner
            tag="COMMUNITY"
            title="사랑터"
            accent="sky"
            subtitle="기부자와 시설이 서로의 소식을 나누는 커뮤니티 공간입니다. 아래는 방향을 먼저 확인해 보는 UI 프로토타입입니다."
          />

          <MessageWallPrototype />
        </div>
      </PageShell>
    </RequireAuth>
  );
}
