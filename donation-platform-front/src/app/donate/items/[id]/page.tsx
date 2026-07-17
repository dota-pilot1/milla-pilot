"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, PackageOpen } from "lucide-react";
import { Badge } from "@/shared/ui/Badge";
import { Progress } from "@/shared/ui/Progress";
import { EmptyState } from "@/shared/ui/EmptyState";
import { pctOf } from "@/shared/lib/format";
import { facilityApi } from "@/entities/facility/api/facilityApi";
import { donationItemApi } from "@/entities/donation-item/api/donationItemApi";
import {
  ITEM_CATEGORY_LABEL,
  ITEM_STATUS_LABEL,
  ITEM_STATUS_VARIANT,
} from "@/entities/donation-item/model/types";
import { DonatePanel } from "@/features/donate/ui/DonatePanel";

export default function DonationItemDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const valid = Number.isFinite(id);

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

  const backHref = item ? `/donate/facilities/${item.facilityId}` : "/donate";
  const pct = item ? pctOf(item.raisedAmount, item.goalAmount) : 0;
  const full = item ? item.raisedAmount >= item.goalAmount : false;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
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
          <div className="grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-start">
            <div className="space-y-5">
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
                  <p className="text-sm text-muted-foreground">
                    {facility ? `${facility.name} · ` : ""}
                    {ITEM_CATEGORY_LABEL[item.category]}
                    {item.note ? ` · ${item.note}` : ""}
                  </p>
                </div>
              </div>

              {item.reason ? (
                <div className="rounded-xl border bg-muted/40 p-5">
                  <p className="text-sm font-semibold">필요한 이유</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
                </div>
              ) : null}

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium">진행 상황</span>
                  <span className="font-bold text-primary">{pct}%</span>
                </div>
                <Progress value={pct} complete={full} />
              </div>
            </div>

            <DonatePanel item={item} />
          </div>
        )}
      </div>
    </main>
  );
}
