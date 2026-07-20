"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarClock, PackageOpen } from "lucide-react";
import { Badge } from "@/shared/ui/Badge";
import { Progress } from "@/shared/ui/Progress";
import { StatusTimeline } from "@/shared/ui/StatusTimeline";
import { EmptyState } from "@/shared/ui/EmptyState";
import { PageShell } from "@/shared/ui/PageShell";
import { formatKRW, pctOf } from "@/shared/lib/format";
import { useClientNow } from "@/shared/lib/useClientNow";
import { facilityApi } from "@/entities/facility/api/facilityApi";
import { donationItemApi } from "@/entities/donation-item/api/donationItemApi";
import {
  ITEM_CATEGORY_LABEL,
  ITEM_STATUS_LABEL,
  ITEM_STATUS_VARIANT,
} from "@/entities/donation-item/model/types";
import { DonationUsageNotice } from "@/entities/donation-item/ui/DonationUsageNotice";
import { contributionApi } from "@/entities/contribution/api/contributionApi";
import { ContributionSummaryCard } from "@/entities/contribution/ui/ContributionSummaryCard";
import { FacilityInlineSummary } from "@/entities/facility/ui/FacilityInlineSummary";
import { purchaseOrderApi } from "@/entities/purchase-order/api/purchaseOrderApi";
import { PurchaseStatusCard } from "@/entities/purchase-order/ui/PurchaseStatusCard";
import { DonatePanel } from "@/features/donate/ui/DonatePanel";

function DonationItemDetail() {
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));
  const valid = Number.isFinite(id) && id > 0;

  const itemQuery = useQuery({
    queryKey: ["donation-item", id],
    queryFn: () => donationItemApi.getById(id),
    enabled: valid,
  });
  const item = itemQuery.data;

  const facilityQuery = useQuery({
    queryKey: ["facility", item?.facilityId],
    queryFn: () => facilityApi.getById(item!.facilityId),
    enabled: !!item,
  });
  const facility = facilityQuery.data;

  const purchased =
    !!item && item.status !== "RECRUITING" && item.status !== "LOCKED";
  const purchaseQuery = useQuery({
    queryKey: ["purchase-order", id],
    queryFn: () => purchaseOrderApi.getByItem(id),
    enabled: valid && purchased,
  });
  const purchaseOrder = purchaseQuery.data;

  const summaryQuery = useQuery({
    queryKey: ["contributions", "item-summary", id],
    queryFn: () => contributionApi.getItemSummary(id),
    enabled: valid,
  });
  const summary = summaryQuery.data;

  const backHref = item ? `/donate/facility?id=${item.facilityId}` : "/donate";
  const pct = item ? pctOf(item.raisedAmount, item.goalAmount) : 0;
  const full = item ? item.raisedAmount >= item.goalAmount : false;
  // 마감까지 남은 일수 — 마감일이 없거나 이미 지났으면 표시하지 않는다
  const now = useClientNow();
  const dday = (() => {
    if (!item?.deadline || now === null) return null;
    const end = new Date(`${item.deadline}T23:59:59`).getTime();
    const days = Math.ceil((end - now) / 86_400_000);
    return days >= 0 ? days : null;
  })();

  return (
    <PageShell>
      <div className="space-y-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> {facility ? facility.name : "돌아가기"}
        </Link>

        {itemQuery.isLoading ? (
          <div className="h-64 animate-pulse rounded-xl border bg-card" />
        ) : itemQuery.isError || !item ? (
          <EmptyState icon={PackageOpen} title="물품을 찾을 수 없습니다" />
        ) : (
          <div className="grid gap-5 md:grid-cols-[1.5fr_1fr] md:items-start">
            <div className="space-y-6">
              {/* 대표 영역 — 제목이 캔버스 위에 홀로 뜨지 않도록 진행 상황과 한 카드로 묶는다 */}
              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-muted text-3xl">
                    {item.emoji || "📦"}
                  </span>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight">{item.name}</h1>
                      {full ? <Badge variant="locked">목표달성</Badge> : null}
                      {item.status === "BUYING" || item.status === "SHIPPING" ? (
                        <Badge variant={ITEM_STATUS_VARIANT[item.status]}>
                          {ITEM_STATUS_LABEL[item.status]}
                        </Badge>
                      ) : null}
                    </div>
                    {/* 시설명은 breadcrumb·시설 카드에 이미 있어 여기서는 뺀다 */}
                    <p className="text-sm text-muted-foreground">
                      {ITEM_CATEGORY_LABEL[item.category]}
                      {item.note ? ` · ${item.note}` : ""}
                    </p>
                  </div>
                </div>

                {/* 누구에게 가는가 — 후원 판단의 근거라 접지 않고 맥락으로 붙인다 */}
                {facility ? (
                  <div className="mt-5 border-t pt-4">
                    <FacilityInlineSummary facility={facility} />
                  </div>
                ) : null}

                <div className="mt-4 border-t pt-4">
                  <div className="flex items-baseline justify-between gap-3">
                    {/* 퍼센트만으로는 규모가 안 보인다 — 실제 금액을 함께 */}
                    <p className="text-xl font-bold tracking-tight">
                      {formatKRW(item.raisedAmount)}
                      <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                        / {formatKRW(item.goalAmount)}
                      </span>
                    </p>
                    <span className="flex items-baseline gap-3">
                      {dday !== null && !full ? (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarClock className="size-3.5" />
                          {dday > 0 ? `마감까지 ${dday}일` : "오늘 마감"}
                        </span>
                      ) : null}
                      <span className="text-xl font-bold text-primary">{pct}%</span>
                    </span>
                  </div>
                  <div className="mt-3">
                    <Progress value={pct} complete={full} />
                  </div>
                </div>
              </div>

              {item.reason ? (
                /* 라벨은 캡션, 본문은 읽는 글이라 한 단계 크게 */
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                  <p className="text-xs font-medium text-muted-foreground">필요한 이유</p>
                  <p className="mt-2 text-base leading-relaxed">{item.reason}</p>
                </div>
              ) : null}

              <div className="rounded-xl border bg-card p-5 shadow-sm">
                <p className="mb-4 text-sm font-semibold">후원 진행 단계</p>
                <StatusTimeline status={item.status} />
              </div>

              {purchaseOrder ? <PurchaseStatusCard order={purchaseOrder} /> : null}

              {summary ? <ContributionSummaryCard summary={summary} /> : null}
            </div>

            {/* "어떻게 후원하나" 묶음 — 스크롤해도 따라오도록 고정 */}
            <div className="space-y-5 md:sticky md:top-6">
              <DonatePanel item={item} />
              <DonationUsageNotice />
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}

export default function DonationItemDetailPage() {
  return (
    <Suspense fallback={<PageShell />}>
      <DonationItemDetail />
    </Suspense>
  );
}
