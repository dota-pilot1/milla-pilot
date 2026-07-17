"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, PackageOpen } from "lucide-react";
import { Badge } from "@/shared/ui/Badge";
import { EmptyState } from "@/shared/ui/EmptyState";
import { facilityApi } from "@/entities/facility/api/facilityApi";
import {
  FACILITY_STATUS_LABEL,
  FACILITY_STATUS_VARIANT,
  FACILITY_TYPE_LABEL,
} from "@/entities/facility/model/types";
import { donationItemApi } from "@/entities/donation-item/api/donationItemApi";
import { DonationItemCard } from "@/entities/donation-item/ui/DonationItemCard";

export default function FacilityDonatePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const valid = Number.isFinite(id);

  const facilityQuery = useQuery({
    queryKey: ["facility", id],
    queryFn: () => facilityApi.getById(id),
    enabled: valid,
  });
  const itemsQuery = useQuery({
    queryKey: ["facility", id, "items"],
    queryFn: () => donationItemApi.getByFacility(id),
    enabled: valid,
  });

  const facility = facilityQuery.data;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <Link
          href="/donate"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> 후원하기
        </Link>

        {facility ? (
          <div className="flex items-start gap-4 rounded-xl border bg-card p-5 shadow-sm">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary">
              {facility.avatarInitial || facility.name.charAt(0)}
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">{facility.name}</h1>
              <div className="flex flex-wrap items-center gap-2">
                {facility.verified ? <Badge variant="verified">✓ 자격확인</Badge> : null}
                <Badge variant={FACILITY_STATUS_VARIANT[facility.status]}>
                  {FACILITY_STATUS_LABEL[facility.status]}
                </Badge>
                <Badge variant="muted">
                  {facility.region} · {FACILITY_TYPE_LABEL[facility.type]}
                </Badge>
              </div>
              {facility.description ? (
                <p className="text-sm text-muted-foreground">{facility.description}</p>
              ) : null}
            </div>
          </div>
        ) : facilityQuery.isLoading ? (
          <div className="h-28 animate-pulse rounded-xl border bg-card" />
        ) : null}

        <div className="space-y-1">
          <h2 className="text-lg font-semibold">지금 필요한 준비물</h2>
          <p className="text-sm text-muted-foreground">
            목표금액은 실제 구매 총액 기준입니다. 후원금은 시설 후원금 전용계좌로 직접 귀속됩니다.
          </p>
        </div>

        {itemsQuery.isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl border bg-card" />
            ))}
          </div>
        ) : itemsQuery.isError ? (
          <EmptyState icon={PackageOpen} title="물품을 불러오지 못했습니다" />
        ) : !itemsQuery.data?.length ? (
          <EmptyState
            icon={PackageOpen}
            title="등록된 후원 물품이 없습니다"
            description="이 시설의 준비물 목표가 곧 올라옵니다."
          />
        ) : (
          <div className="space-y-4">
            {itemsQuery.data.map((item) => (
              <DonationItemCard
                key={item.id}
                item={item}
                onDonate={() => router.push(`/donate/items/${item.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
