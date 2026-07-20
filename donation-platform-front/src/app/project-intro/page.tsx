"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/widgets/guards/RequireAuth";
import { ChalkboardHero, IntroCardGrid, MembershipSection } from "@/widgets/brand-intro";
import { SiteFooter } from "@/widgets/site-footer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageShell } from "@/shared/ui/PageShell";
import { buttonVariants } from "@/shared/ui/Button";

export default function ProjectIntroPage() {
  const router = useRouter();

  return (
    <RequireAuth>
      <PageShell width="wide" className="py-6">
        <div className="space-y-5">
          <PageHeader
            size="hero"
            icon={Info}
            title="프로젝트 소개"
            description="시설별 필요 물품 후원을 기록하고, 목표 달성 이후 구매·배송·수령 흐름을 공개해 이행 과정을 확인하는 MVP입니다."
            actions={
              <div className="flex items-center gap-2">
                <Link href="/dashboard" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  현황 보기
                </Link>
                <Link href="/donate" className={buttonVariants({ size: "sm" })}>
                  후원하러 가기
                </Link>
              </div>
            }
          />

          <ChalkboardHero onShowStory={() => router.push("/project-intro/story")} />

          <IntroCardGrid />

          <MembershipSection />

          <SiteFooter />
        </div>
      </PageShell>
    </RequireAuth>
  );
}
