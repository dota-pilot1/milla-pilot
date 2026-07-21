import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { Progress } from "@/shared/ui/Progress";
import { Button } from "@/shared/ui/Button";
import { formatKRW, pctOf } from "@/shared/lib/format";
import {
  ITEM_STATUS_LABEL,
  ITEM_STATUS_VARIANT,
  type DonationItem,
} from "../model/types";

export interface DonationItemCardProps {
  item: DonationItem;
  onDonate?: (item: DonationItem) => void;
}

/** 카드용 짧은 상태 라벨 — 배지 폭을 통일해 시선 정리. */
const CARD_STATUS_LABEL: Partial<Record<DonationItem["status"], string>> = {
  BUYING: "구매중",
  SHIPPING: "배송중",
  RECEIVED: "수령완료",
  RECEIPTED: "영수증",
};

/** 우측 상단 단일 상태 배지 — 운영 상태(구매/배송…) 우선, 없으면 목표달성/모집중. */
function statusBadge(item: DonationItem, full: boolean) {
  const operational =
    item.status !== "RECRUITING" && item.status !== "LOCKED";
  if (operational) {
    return {
      label: CARD_STATUS_LABEL[item.status] ?? ITEM_STATUS_LABEL[item.status],
      variant: ITEM_STATUS_VARIANT[item.status],
    };
  }
  return full
    ? { label: ITEM_STATUS_LABEL.LOCKED, variant: ITEM_STATUS_VARIANT.LOCKED }
    : { label: ITEM_STATUS_LABEL.RECRUITING, variant: ITEM_STATUS_VARIANT.RECRUITING };
}

export function DonationItemCard({ item, onDonate }: DonationItemCardProps) {
  const pct = pctOf(item.raisedAmount, item.goalAmount);
  const full = item.raisedAmount >= item.goalAmount;
  const canDonate = item.status === "RECRUITING" && !full;
  const badge = statusBadge(item, full);

  return (
    <Card
      onClick={() => onDonate?.(item)}
      className="flex h-full cursor-pointer flex-col p-5 transition-all hover:border-primary/40 hover:bg-muted/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-3xl ring-1 ring-primary/10">
          {item.emoji || "📦"}
        </span>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>

      <div className="mt-3">
        <h3 className="font-semibold leading-tight">{item.name}</h3>
        {item.note ? (
          <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
        ) : null}
      </div>

      <div className="mt-4">
        <div className="mb-2.5 flex items-baseline justify-between gap-3">
          <p className="min-w-0 truncate">
            <b className="text-base font-bold tracking-tight">{formatKRW(item.raisedAmount)}</b>
            <span className="text-sm text-muted-foreground">
              {" / "}
              {formatKRW(item.goalAmount)}
            </span>
          </p>
          <span className="shrink-0 text-base font-bold text-primary">{pct}%</span>
        </div>
        <Progress value={pct} complete={full} />

        {canDonate ? (
          <Button
            size="sm"
            className="mt-4 w-full"
            onClick={(e) => {
              e.stopPropagation();
              onDonate?.(item);
            }}
          >
            후원하기
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
