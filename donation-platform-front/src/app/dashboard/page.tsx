"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  HandCoins,
  LayoutDashboard,
  Package,
  Building2,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { RequireAuth } from "@/widgets/guards/RequireAuth";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { buttonVariants } from "@/shared/ui/Button";
import { facilityApi } from "@/entities/facility/api/facilityApi";
import { donationItemApi } from "@/entities/donation-item/api/donationItemApi";
import type { Facility } from "@/entities/facility/model/types";
import { FacilityFundingList } from "@/entities/facility/ui/FacilityFundingList";
import type { DonationItem } from "@/entities/donation-item/model/types";
import {
  ITEM_STATUS_LABEL,
  ITEM_STATUS_VARIANT,
  type ItemStatus,
} from "@/entities/donation-item/model/types";
import { formatKRW, pctOf } from "@/shared/lib/format";

const STATUS_ORDER: ItemStatus[] = [
  "RECRUITING",
  "LOCKED",
  "BUYING",
  "SHIPPING",
  "RECEIVED",
  "RECEIPTED",
];

// 대충 v1: 전용 통계 API가 아직 없어 클라이언트에서 시설+물품을 합산한다.
// 기획 확정 후 백엔드 집계 엔드포인트(예: GET /api/stats/overview)로 교체 예정.
async function fetchOverview() {
  const facilities = await facilityApi.getAll();
  const itemsByFacility = await Promise.all(
    facilities.map((f) => donationItemApi.getByFacility(f.id)),
  );
  return { facilities, items: itemsByFacility.flat() };
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}

function DashboardInner() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: fetchOverview,
  });

  return (
    <PageShell width="wide">
      <div className="space-y-8">
        <PageHeader
          icon={LayoutDashboard}
          title="대시보드"
          description="참여 시설과 필요한 물품, 후원 진행 흐름을 한눈에 확인합니다."
          actions={
            <Link href="/donate" className={buttonVariants({ size: "sm" })}>
              후원하러 가기
            </Link>
          }
        />

        {isLoading ? (
          <DashboardSkeleton />
        ) : isError ? (
          <EmptyState
            icon={LayoutDashboard}
            title="현황을 불러오지 못했습니다"
          />
        ) : !data?.facilities.length ? (
          <EmptyState icon={Building2} title="등록된 시설이 없어요" />
        ) : (
          <Overview facilities={data.facilities} items={data.items} />
        )}
      </div>
    </PageShell>
  );
}

function Overview({
  facilities,
  items,
}: {
  facilities: Facility[];
  items: DonationItem[];
}) {
  const totalGoal = items.reduce((s, it) => s + it.goalAmount, 0);
  const totalRaised = items.reduce((s, it) => s + it.raisedAmount, 0);

  const statusCounts = items.reduce<Record<string, number>>((acc, it) => {
    acc[it.status] = (acc[it.status] ?? 0) + 1;
    return acc;
  }, {});

  const perFacility = facilities
    .map((f) => {
      const own = items.filter((it) => it.facilityId === f.id);
      return {
        facility: f,
        itemCount: own.length,
        goal: own.reduce((s, it) => s + it.goalAmount, 0),
        raised: own.reduce((s, it) => s + it.raisedAmount, 0),
      };
    })
    .sort((a, b) => b.raised - a.raised);

  return (
    <div className="space-y-8">
      {/* 요약 블록 — 지표와 진행 상태는 한 덩어리로 묶는다 */}
      <div className="space-y-4">
        {/* 요약 지표 — 자연 접힘: 2열 → 4열 */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={HandCoins}
            label="총 모금액"
            value={formatKRW(totalRaised)}
          />
          <StatCard
            icon={Target}
            label="전체 진행률"
            value={`${pctOf(totalRaised, totalGoal)}%`}
            sub={`목표 ${formatKRW(totalGoal)}`}
          />
          <StatCard
            icon={Building2}
            label="참여 시설"
            value={`${facilities.length}곳`}
          />
          <StatCard
            icon={Package}
            label="등록 물품"
            value={`${items.length}종`}
          />
        </div>

        {/* 물품 진행 상태 분포 */}
        <Card className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            물품 진행 상태
          </h2>
          {items.length ? (
            <div className="flex flex-wrap gap-2">
              {STATUS_ORDER.filter((s) => statusCounts[s]).map((s) => (
                <Badge
                  key={s}
                  variant={ITEM_STATUS_VARIANT[s]}
                  className="gap-1.5"
                >
                  {ITEM_STATUS_LABEL[s]}
                  <span className="font-bold">{statusCounts[s]}</span>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              등록된 물품이 없습니다.
            </p>
          )}
        </Card>
      </div>

      {/* 시설별 현황 */}
      <FacilityFundingList rows={perFacility} />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-lg font-bold tracking-tight">{value}</p>
        {sub ? (
          <p className="truncate text-xs text-muted-foreground">{sub}</p>
        ) : null}
      </div>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl border bg-card"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl border bg-card" />
    </div>
  );
}
