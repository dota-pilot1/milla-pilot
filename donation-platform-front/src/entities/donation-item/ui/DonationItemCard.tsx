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

export function DonationItemCard({ item, onDonate }: DonationItemCardProps) {
  const pct = pctOf(item.raisedAmount, item.goalAmount);
  const full = item.raisedAmount >= item.goalAmount;
  const canDonate = item.status === "RECRUITING" && !full;

  return (
    <Card className="p-5">
      <div className="grid gap-4 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:grid-rows-[auto_auto] sm:items-center">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl sm:row-span-2">
          {item.emoji || "📦"}
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{item.name}</h3>
            {full ? <Badge variant="locked">목표달성</Badge> : null}
            {/* 목표달성(LOCKED)은 full 배지로 이미 표시 — 구매/배송 등 운영 상태만 추가 */}
            {item.status === "BUYING" || item.status === "SHIPPING" ? (
              <Badge variant={ITEM_STATUS_VARIANT[item.status]}>
                {ITEM_STATUS_LABEL[item.status]}
              </Badge>
            ) : null}
          </div>
          {item.note ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{item.note}</p>
          ) : null}
        </div>

        <span className="hidden text-right text-sm font-bold text-primary sm:block">
          {pct}%
        </span>

        <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <Progress value={pct} complete={full} />
          <span className="text-sm text-muted-foreground sm:text-right">
            <b className="text-foreground">{formatKRW(item.raisedAmount)}</b> /{" "}
            {formatKRW(item.goalAmount)}
          </span>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
          <span className="text-sm font-bold text-primary sm:hidden">{pct}%</span>
          {canDonate ? (
            <Button size="sm" onClick={() => onDonate?.(item)}>
              후원하기
            </Button>
          ) : (
            <Button size="sm" variant="secondary" disabled>
              {full ? "목표달성" : ITEM_STATUS_LABEL[item.status]}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
