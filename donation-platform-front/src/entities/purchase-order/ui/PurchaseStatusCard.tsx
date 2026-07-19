import { CheckCircle2, ExternalLink, ReceiptText, Store, Truck } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { formatKRW } from "@/shared/lib/format";
import type { PurchaseOrder } from "../model/types";
import { courierLabel, trackingUrl } from "../model/courier";

const dateFmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("ko-KR") : "—";

/**
 * 후원자에게 보여주는 통합구매 현황.
 * 목표달성 후 운영자가 통합구매를 실행하면 판매처·실구매액·증빙이 채워진다.
 */
export function PurchaseStatusCard({
  order,
  compact = false,
}: {
  order: PurchaseOrder;
  compact?: boolean;
}) {
  return (
    <div className={cn("rounded-xl border bg-card shadow-sm", compact ? "p-4" : "p-5")}>
      <div className={cn("flex items-center gap-2", compact ? "mb-3" : "mb-4")}>
        <CheckCircle2 className="size-4 text-primary" />
        <p className="text-sm font-medium">통합구매 현황</p>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div className="col-span-2 flex items-center gap-2">
          <Store className="size-4 shrink-0 text-muted-foreground" />
          <dt className="text-muted-foreground">판매처</dt>
          <dd className="ml-auto font-medium">
            {order.vendorUrl ? (
              <a
                href={order.vendorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                {order.vendor} <ExternalLink className="size-3.5" />
              </a>
            ) : (
              order.vendor
            )}
          </dd>
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <dt className="text-muted-foreground">실구매액</dt>
          <dd className="ml-auto font-semibold text-primary">
            {formatKRW(order.purchasedAmount)}
            {order.quantity ? (
              <span className="ml-1 font-normal text-muted-foreground">· {order.quantity}개</span>
            ) : null}
          </dd>
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <ReceiptText className="size-4 shrink-0 text-muted-foreground" />
          <dt className="text-muted-foreground">구매 증빙</dt>
          <dd className="ml-auto font-medium">{order.evidenceNo || "—"}</dd>
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <dt className="text-muted-foreground">구매일</dt>
          <dd className="ml-auto">{dateFmt(order.orderedAt ?? order.createdAt)}</dd>
        </div>
      </dl>

      {order.evidenceFileUrl ? (
        <a
          href={order.evidenceFileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-3 rounded-lg border bg-muted/40 p-2.5 text-sm transition-colors hover:bg-muted"
        >
          <img
            src={order.evidenceFileUrl}
            alt="구매 증빙"
            className="size-12 shrink-0 rounded-md border object-cover"
          />
          <span className="font-medium">증빙 이미지 (영수증/송장)</span>
          <ExternalLink className="ml-auto size-3.5 text-muted-foreground" />
        </a>
      ) : null}

      {order.courier && order.trackingNo ? (
        <div className="mt-4 space-y-1.5">
          <a
            href={trackingUrl(order.courier, order.trackingNo)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2.5 text-sm transition-colors hover:bg-muted"
          >
            <Truck className="size-4 shrink-0 text-primary" />
            <span className="font-medium">{courierLabel(order.courier)}</span>
            <span className="text-muted-foreground">{order.trackingNo}</span>
            <span className="ml-auto inline-flex items-center gap-1 font-medium text-primary">
              배송조회 <ExternalLink className="size-3.5" />
            </span>
          </a>
          {order.expectedDeliveryAt ? (
            <p className="px-1 text-xs text-muted-foreground">
              배송 예정일 · {dateFmt(order.expectedDeliveryAt)}
            </p>
          ) : null}
        </div>
      ) : null}

      {!compact ? (
        <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">
          구매 증빙은 실제 물품 구매 내역이며, 세액공제용 기부금영수증이 아닙니다.
        </p>
      ) : null}
    </div>
  );
}
