"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Truck } from "lucide-react";
import { RequireAuth } from "@/widgets/guards/RequireAuth";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";
import { buttonVariants } from "@/shared/ui/Button";
import { contributionApi } from "@/entities/contribution/api/contributionApi";
import { MyDonationsList } from "@/features/my-donations/ui/MyDonationsList";

export default function MyDonationsPage() {
  return (
    <RequireAuth>
      <MyDonationsInner />
    </RequireAuth>
  );
}

function MyDonationsInner() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["contributions", "me"],
    queryFn: contributionApi.getMine,
    refetchOnWindowFocus: true,
  });

  return (
    <PageShell width="content" className="py-6">
      <div className="space-y-5">
        <PageHeader
          icon={Truck}
          title="내 후원·배송"
          description="내가 참여한 후원 물품의 모금, 통합구매, 배송 진행을 시설별로 확인합니다."
        />

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl border bg-card" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState icon={Truck} title="후원 내역을 불러오지 못했습니다" />
        ) : !data?.length ? (
          <EmptyState
            icon={Truck}
            title="아직 후원 내역이 없어요"
            description="마음에 드는 시설의 준비물에 참여해 보세요."
            action={
              <Link href="/donate" className={buttonVariants({ size: "sm" })}>
                후원하러 가기
              </Link>
            }
          />
        ) : (
          <MyDonationsList contributions={data} />
        )}
      </div>
    </PageShell>
  );
}
