"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, PackageOpen } from "lucide-react";
import { Badge } from "@/shared/ui/Badge";
import { EmptyState } from "@/shared/ui/EmptyState";
import { PageShell } from "@/shared/ui/PageShell";
import { Progress } from "@/shared/ui/Progress";
import { formatKRW, pctOf } from "@/shared/lib/format";
import { facilityApi } from "@/entities/facility/api/facilityApi";
import {
  FACILITY_STATUS_LABEL,
  FACILITY_STATUS_VARIANT,
  FACILITY_TYPE_LABEL,
} from "@/entities/facility/model/types";
import { donationItemApi } from "@/entities/donation-item/api/donationItemApi";
import { DonationItemCard } from "@/entities/donation-item/ui/DonationItemCard";
import type { DonationItem } from "@/entities/donation-item/model/types";

/** 시설 레벨 집계 — 후원금 합계·전체 달성률·상태 분포. 백엔드 변경 없이 물품 목록에서 계산. */
const STATUS_BUCKETS = [
  { key: "recruiting", label: "모집" },
  { key: "locked", label: "목표달성" },
  { key: "buying", label: "구매" },
  { key: "shipping", label: "배송" },
  { key: "done", label: "완료" },
] as const;

function bucketOf(item: DonationItem): (typeof STATUS_BUCKETS)[number]["key"] {
  if (item.status === "BUYING") return "buying";
  if (item.status === "SHIPPING") return "shipping";
  if (item.status === "RECEIVED" || item.status === "RECEIPTED") return "done";
  if (item.status === "LOCKED" || item.raisedAmount >= item.goalAmount) return "locked";
  return "recruiting";
}

function summarize(items: DonationItem[]) {
  const raised = items.reduce((s, it) => s + it.raisedAmount, 0);
  const goal = items.reduce((s, it) => s + it.goalAmount, 0);
  const counts = new Map<string, number>();
  items.forEach((it) => {
    const k = bucketOf(it);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  });
  const distribution = STATUS_BUCKETS.map((b) => ({ ...b, count: counts.get(b.key) ?? 0 })).filter(
    (b) => b.count > 0,
  );
  return { raised, goal, pct: pctOf(raised, goal), count: items.length, distribution };
}

function FacilityDonate() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = Number(searchParams.get("id"));
  const valid = Number.isFinite(id) && id > 0;

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
  const items = itemsQuery.data ?? [];
  const stats = summarize(items);

  return (
    <PageShell>
      <div className="space-y-6">
        <Link
          href="/donate"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> 시설 목록으로
        </Link>

        {facility ? (
          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
                {facility.avatarInitial || facility.name.charAt(0)}
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">선택한 시설</p>
                  <h1 className="text-2xl font-semibold tracking-tight">{facility.name}</h1>
                </div>
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

            {items.length > 0 ? (
              <>
                <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-6">
                  <div>
                    <p className="text-xs text-muted-foreground">모인 후원금</p>
                    <p className="mt-1 text-2xl font-bold tracking-tight">
                      {formatKRW(stats.raised)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">후원 물품</p>
                    <p className="mt-1 text-2xl font-bold tracking-tight">{stats.count}개</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">전체 달성률</p>
                    <p className="mt-1 text-2xl font-bold tracking-tight text-primary">
                      {stats.pct}%
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <Progress value={stats.pct} />
                  <p className="mt-2.5 text-sm text-muted-foreground">
                    목표 {formatKRW(stats.goal)} 중 {formatKRW(stats.raised)} 모임
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {stats.distribution.map((b) => (
                    <span
                      key={b.key}
                      className="inline-flex items-center gap-1 rounded-full border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      {b.label}
                      <b className="text-foreground">{b.count}</b>
                    </span>
                  ))}
                </div>
              </>
            ) : null}
          </section>
        ) : facilityQuery.isLoading ? (
          <div className="h-48 animate-pulse rounded-2xl border bg-card" />
        ) : null}

        <div className="space-y-1">
          <h2 className="text-lg font-semibold">
            후원 물품
            {items.length ? (
              <span className="ml-1.5 text-muted-foreground">({items.length})</span>
            ) : null}
          </h2>
          <p className="text-sm text-muted-foreground">
            목표금액은 실제 구매 총액 기준입니다. 후원금은 시설 후원금 전용계좌로 직접 귀속됩니다.
          </p>
        </div>

        {itemsQuery.isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl border bg-card" />
            ))}
          </div>
        ) : itemsQuery.isError ? (
          <EmptyState icon={PackageOpen} title="물품을 불러오지 못했습니다" />
        ) : !items.length ? (
          <EmptyState
            icon={PackageOpen}
            title="등록된 후원 물품이 없습니다"
            description="이 시설의 준비물 목표가 곧 올라옵니다."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {items.map((item) => (
              <DonationItemCard
                key={item.id}
                item={item}
                onDonate={() => router.push(`/donate/item?id=${item.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

export default function FacilityDonatePage() {
  return (
    <Suspense fallback={<PageShell />}>
      <FacilityDonate />
    </Suspense>
  );
}
