"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { Progress } from "@/shared/ui/Progress";
import { StatusTimeline } from "@/shared/ui/StatusTimeline";
import { cn } from "@/shared/lib/utils";
import { formatKRW, pctOf } from "@/shared/lib/format";
import type { MyContribution } from "@/entities/contribution/model/types";
import {
  ITEM_STATUS_LABEL,
  ITEM_STATUS_VARIANT,
} from "@/entities/donation-item/model/types";
import { PurchaseStatusCard } from "@/entities/purchase-order/ui/PurchaseStatusCard";

type Group = {
  facility: MyContribution["facility"];
  rows: MyContribution[];
  myTotal: number;
};

function groupByFacility(list: MyContribution[]): Group[] {
  const map = new Map<number, Group>();
  for (const c of list) {
    const g = map.get(c.facility.id) ?? { facility: c.facility, rows: [], myTotal: 0 };
    g.rows.push(c);
    g.myTotal += c.myAmount;
    map.set(c.facility.id, g);
  }
  return [...map.values()];
}

type ItemGroup = {
  item: MyContribution["item"];
  purchaseOrder: MyContribution["purchaseOrder"];
  myTotal: number;
  contributions: MyContribution[];
};

// 같은 물품에 대한 여러 후원을 물품 단위로 합산한다.
function groupByItem(rows: MyContribution[]): ItemGroup[] {
  const map = new Map<number, ItemGroup>();
  for (const c of rows) {
    const g = map.get(c.item.id) ?? {
      item: c.item,
      purchaseOrder: c.purchaseOrder,
      myTotal: 0,
      contributions: [],
    };
    if (!g.purchaseOrder && c.purchaseOrder) {
      g.purchaseOrder = c.purchaseOrder;
    }
    g.myTotal += c.myAmount;
    g.contributions.push(c);
    map.set(c.item.id, g);
  }
  return [...map.values()];
}

function DonationRowsPanel({
  expanded,
  rows,
}: {
  expanded: boolean;
  rows: MyContribution[];
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(expanded);
  const [maxHeight, setMaxHeight] = useState(expanded ? "none" : "0px");

  useLayoutEffect(() => {
    if (expanded) setShouldRender(true);
  }, [expanded]);

  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner || !shouldRender) return;

    if (expanded) {
      setMaxHeight(`${inner.scrollHeight}px`);
      const timer = window.setTimeout(() => setMaxHeight("none"), 240);
      return () => window.clearTimeout(timer);
    }

    setMaxHeight(`${inner.scrollHeight}px`);
    const frame = window.requestAnimationFrame(() => setMaxHeight("0px"));
    return () => window.cancelAnimationFrame(frame);
  }, [expanded, shouldRender, rows]);

  if (!shouldRender) return null;

  return (
    <div
      className="overflow-hidden transition-[max-height] duration-200 ease-out motion-reduce:transition-none"
      style={{ maxHeight }}
      onTransitionEnd={() => {
        if (!expanded) setShouldRender(false);
      }}
    >
      <div
        ref={innerRef}
        className={cn(
          "space-y-5 border-t bg-muted/30 p-5 transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none",
          expanded ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
        )}
      >
        {groupByItem(rows).map((ig) => {
          const pct = pctOf(ig.item.raisedAmount, ig.item.goalAmount);
          const full = ig.item.raisedAmount >= ig.item.goalAmount;
          const count = ig.contributions.length;
          return (
            <div
              key={ig.item.id}
              className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl ring-1 ring-primary/10">
                  {ig.item.emoji || "📦"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-tight">{ig.item.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    나의 후원 <b className="text-foreground">{formatKRW(ig.myTotal)}</b>
                    {count > 1 ? ` · ${count}건` : ""}
                  </p>
                </div>
                <Badge variant={ITEM_STATUS_VARIANT[ig.item.status]} className="shrink-0">
                  {ITEM_STATUS_LABEL[ig.item.status]}
                </Badge>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">달성률</span>
                  <span className="font-bold text-primary">{pct}%</span>
                </div>
                <Progress value={pct} complete={full} />
                <p className="mt-2 text-sm text-muted-foreground">
                  <b className="text-foreground">{formatKRW(ig.item.raisedAmount)}</b> /{" "}
                  {formatKRW(ig.item.goalAmount)}
                </p>
              </div>

              <StatusTimeline status={ig.item.status} compact />

              {ig.purchaseOrder ? (
                <PurchaseStatusCard
                  order={ig.purchaseOrder}
                  compact
                  className="border-dashed bg-muted/40 shadow-none"
                />
              ) : null}

              {count > 1 ? (
                <div className="rounded-xl border border-dashed bg-muted/30 px-4 py-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    나의 후원 {count}건
                  </p>
                  <ul className="mt-1 divide-y text-sm">
                    {ig.contributions.map((c) => (
                      <li
                        key={c.contributionId}
                        className="flex items-center justify-between py-2.5"
                      >
                        <span className="text-muted-foreground">
                          {new Date(c.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                        <span className="font-medium">{formatKRW(c.myAmount)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MyDonationsList({ contributions }: { contributions: MyContribution[] }) {
  const groups = groupByFacility(contributions);
  const [openId, setOpenId] = useState<number | null>(groups[0]?.facility.id ?? null);

  return (
    <div className="space-y-4">
      {groups.map((g) => {
        const expanded = openId === g.facility.id;
        return (
          <Card
            key={g.facility.id}
            className={cn(
              "overflow-hidden transition-colors",
              expanded && "border-primary/25",
            )}
          >
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-muted/30",
                expanded && "bg-muted/25",
              )}
              onClick={() => setOpenId(expanded ? null : g.facility.id)}
              aria-expanded={expanded}
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-base font-bold text-primary ring-1 ring-primary/10">
                {g.facility.avatarInitial || g.facility.name.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{g.facility.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  물품 {new Set(g.rows.map((r) => r.item.id)).size}개 · 후원 {g.rows.length}건
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-muted-foreground">내 후원</p>
                <p className="text-lg font-bold leading-tight text-primary">
                  {formatKRW(g.myTotal)}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "size-5 shrink-0 text-muted-foreground transition-transform",
                  expanded && "rotate-180",
                )}
              />
            </button>

            <DonationRowsPanel expanded={expanded} rows={g.rows} />
          </Card>
        );
      })}
    </div>
  );
}
