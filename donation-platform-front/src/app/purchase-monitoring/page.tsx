"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ExternalLink,
  PackageCheck,
  ReceiptText,
  Search,
  ShoppingCart,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { purchaseOrderApi } from "@/entities/purchase-order/api/purchaseOrderApi";
import type {
  PublicPurchaseMonitoring,
  PublicPurchasePhase,
} from "@/entities/purchase-order/model/types";
import { courierLabel, trackingUrl } from "@/entities/purchase-order/model/courier";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";
import { Chip } from "@/shared/ui/Chip";
import { EmptyState } from "@/shared/ui/EmptyState";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageShell } from "@/shared/ui/PageShell";
import { TextInput } from "@/shared/ui/TextInput";
import { cn } from "@/shared/lib/utils";
import { formatKRW } from "@/shared/lib/format";
import { useDebouncedValue } from "@/shared/lib/useDebouncedValue";

const PHASE_LABEL: Record<PublicPurchasePhase, string> = {
  PENDING_PURCHASE: "통합구매 대기",
  PURCHASE_COMPLETED: "구매 완료",
  SHIPPING: "배송중",
  RECEIVED: "수령확인",
};

const PHASE_FILTERS: Array<{ value: "ALL" | PublicPurchasePhase; label: string }> = [
  { value: "ALL", label: "전체" },
  { value: "PENDING_PURCHASE", label: "대기" },
  { value: "PURCHASE_COMPLETED", label: "구매 완료" },
  { value: "SHIPPING", label: "배송중" },
  { value: "RECEIVED", label: "수령확인" },
];

export default function PurchaseMonitoringPage() {
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<"ALL" | PublicPurchasePhase>("ALL");
  const debouncedQuery = useDebouncedValue(query, 250).trim().toLowerCase();

  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["purchase-monitoring", "public"],
    queryFn: purchaseOrderApi.getPublicMonitoring,
  });

  const filtered = useMemo(() => {
    return data.filter((order) => {
      const matchesPhase = phase === "ALL" || order.phase === phase;
      const haystack = [
        order.item.name,
        order.facility.name,
        order.vendor ?? "",
        order.courier ? courierLabel(order.courier) : "",
        order.trackingNo ?? "",
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !debouncedQuery || haystack.includes(debouncedQuery);
      return matchesPhase && matchesQuery;
    });
  }, [data, debouncedQuery, phase]);

  const summary = useMemo(() => {
    const pendingCount = data.filter((order) => order.phase === "PENDING_PURCHASE").length;
    const purchasedCount = data.filter((order) => order.purchaseOrderId !== null).length;
    const totalAmount = data.reduce((sum, order) => sum + (order.purchasedAmount ?? 0), 0);
    const shippingCount = data.filter((order) => order.phase === "SHIPPING").length;
    const receivedCount = data.filter((order) => order.phase === "RECEIVED").length;
    return { pendingCount, purchasedCount, totalAmount, shippingCount, receivedCount };
  }, [data]);

  return (
    <PageShell width="wide" className="py-6">
      <div className="space-y-5">
        <PageHeader
          icon={ShoppingCart}
          title="통합구매 현황"
          description="목표 달성 이후 통합구매 대기, 구매 완료, 배송, 수령확인 흐름을 공개 정보로 확인합니다."
          className="items-center"
        />

        {isLoading ? (
          <PurchaseMonitoringSkeleton />
        ) : isError ? (
          <EmptyState icon={ShoppingCart} title="통합구매 현황을 불러오지 못했습니다" />
        ) : data.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="아직 통합구매 내역이 없습니다"
            description="목표 달성 후 구매가 진행되면 이곳에 현황이 표시됩니다."
          />
        ) : (
          <>
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard icon={PackageCheck} label="구매 대기" value={`${summary.pendingCount}건`} />
              <MetricCard icon={ShoppingCart} label="구매 완료" value={`${summary.purchasedCount}건`} />
              <MetricCard icon={ReceiptText} label="누적 실구매액" value={formatKRW(summary.totalAmount)} />
              <MetricCard
                icon={Truck}
                label="배송·수령"
                value={`${summary.shippingCount}건 / ${summary.receivedCount}건`}
              />
            </section>

            <Card className="overflow-hidden">
              <div className="border-b p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative min-w-0 flex-1 lg:max-w-md">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <TextInput
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="물품, 시설, 판매처, 송장 검색"
                      className="h-9 pl-9"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PHASE_FILTERS.map((filter) => (
                      <Chip
                        key={filter.value}
                        active={phase === filter.value}
                        onClick={() => setPhase(filter.value)}
                        className="h-8 px-3 text-xs"
                      >
                        {filter.label}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="p-6">
                  <EmptyState icon={Search} title="조건에 맞는 내역이 없습니다" />
                </div>
              ) : (
                <div className="divide-y">
                  {filtered.map((order) => (
                    <PurchaseOrderRow
                      key={`${order.itemId}-${order.purchaseOrderId ?? "pending"}`}
                      order={order}
                    />
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </PageShell>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-lg font-bold tracking-tight">{value}</p>
      </div>
    </Card>
  );
}

function PurchaseOrderRow({ order }: { order: PublicPurchaseMonitoring }) {
  const hasTracking = Boolean(order.courier && order.trackingNo);
  const date = order.orderedAt
    ? new Date(order.orderedAt).toLocaleDateString("ko-KR")
    : "구매 대기";
  const amount = order.purchasedAmount ?? order.item.goalAmount;

  return (
    <article className="grid gap-3 p-4 md:grid-cols-[minmax(18rem,1.5fr)_minmax(10rem,0.8fr)_minmax(12rem,0.9fr)_minmax(9rem,0.7fr)] md:items-center">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-lg">
            {order.item.emoji ?? <PackageCheck className="size-5 text-muted-foreground" />}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{order.item.name}</p>
            <p className="truncate text-xs text-muted-foreground">{order.facility.name}</p>
          </div>
        </div>
      </div>

      <div className="min-w-0 text-sm">
        <p className="truncate font-medium">{order.vendor ?? "구매처 대기"}</p>
        {order.vendorUrl ? (
          <Link
            href={order.vendorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-1 truncate text-xs text-muted-foreground hover:text-foreground"
          >
            판매처 보기
            <ExternalLink className="size-3" />
          </Link>
        ) : (
          <p className="text-xs text-muted-foreground">
            {order.purchaseOrderId ? "판매처 링크 없음" : "목표달성 후 구매 준비"}
          </p>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={phaseVariant(order.phase)}>
            {PHASE_LABEL[order.phase]}
          </Badge>
          <span className="text-sm font-semibold">{formatKRW(amount)}</span>
          {order.quantity ? (
            <span className="text-xs text-muted-foreground">{order.quantity}개</span>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{date}</p>
      </div>

      <div className="min-w-0 text-sm md:text-right">
        {hasTracking ? (
          <Link
            href={trackingUrl(order.courier!, order.trackingNo!)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium hover:text-primary"
          >
            {courierLabel(order.courier)}
            <ExternalLink className="size-3.5" />
          </Link>
        ) : (
          <span className="text-muted-foreground">
            {order.phase === "PENDING_PURCHASE" ? "구매 대기" : "송장 미등록"}
          </span>
        )}
        {order.expectedDeliveryAt ? (
          <p className="mt-1 text-xs text-muted-foreground">
            예정 {new Date(order.expectedDeliveryAt).toLocaleDateString("ko-KR")}
          </p>
        ) : null}
      </div>

      {(order.evidenceNo || order.evidenceFileUrl || order.shipmentImageUrl) ? (
        <div className={cn("md:col-span-4", "flex flex-wrap gap-2 border-t pt-3 text-xs text-muted-foreground")}>
          {order.evidenceNo ? <span>증빙번호 {order.evidenceNo}</span> : null}
          {order.evidenceFileUrl ? (
            <Link href={order.evidenceFileUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              구매 증빙 보기
            </Link>
          ) : null}
          {order.shipmentImageUrl ? (
            <Link href={order.shipmentImageUrl} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              배송 증빙 보기
            </Link>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function phaseVariant(phase: PublicPurchasePhase): "locked" | "buying" | "shipping" | "verified" {
  if (phase === "PENDING_PURCHASE") return "locked";
  if (phase === "PURCHASE_COMPLETED") return "buying";
  if (phase === "SHIPPING") return "shipping";
  return "verified";
}

function PurchaseMonitoringSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-xl border bg-card" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl border bg-card" />
    </div>
  );
}
