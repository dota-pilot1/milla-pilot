"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { Progress } from "@/shared/ui/Progress";
import { StatusTimeline } from "@/shared/ui/StatusTimeline";
import { cn } from "@/shared/lib/utils";
import { formatKRW, pctOf } from "@/shared/lib/format";
import type { MyContribution } from "@/entities/contribution/model/types";

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
  myTotal: number;
  contributions: MyContribution[];
};

// 같은 물품에 대한 여러 후원을 물품 단위로 합산한다.
function groupByItem(rows: MyContribution[]): ItemGroup[] {
  const map = new Map<number, ItemGroup>();
  for (const c of rows) {
    const g = map.get(c.item.id) ?? { item: c.item, myTotal: 0, contributions: [] };
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
          "space-y-6 border-t bg-muted/20 px-5 py-5 transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none",
          expanded ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
        )}
      >
        {groupByItem(rows).map((ig) => {
          const pct = pctOf(ig.item.raisedAmount, ig.item.goalAmount);
          const full = ig.item.raisedAmount >= ig.item.goalAmount;
          const count = ig.contributions.length;
          return (
            <div key={ig.item.id} className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background text-xl shadow-sm">
                  {ig.item.emoji || "📦"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{ig.item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    나의 후원 <b className="text-foreground">{formatKRW(ig.myTotal)}</b>
                    {count > 1 ? ` · ${count}건` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={pct} complete={full} className="flex-1" />
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatKRW(ig.item.raisedAmount)} / {formatKRW(ig.item.goalAmount)}
                </span>
              </div>
              <StatusTimeline status={ig.item.status} />
              {count > 1 ? (
                <ul className="space-y-1 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  {ig.contributions.map((c) => (
                    <li key={c.contributionId} className="flex items-center justify-between">
                      <span>{new Date(c.createdAt).toLocaleDateString("ko-KR")}</span>
                      <span className="font-medium text-foreground">{formatKRW(c.myAmount)}</span>
                    </li>
                  ))}
                </ul>
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
                "flex w-full items-center gap-3 p-5 text-left transition-colors hover:bg-muted/40",
                expanded && "bg-muted/35",
              )}
              onClick={() => setOpenId(expanded ? null : g.facility.id)}
              aria-expanded={expanded}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-base font-bold text-primary">
                {g.facility.avatarInitial || g.facility.name.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{g.facility.name}</p>
                <p className="text-xs text-muted-foreground">
                  내 후원 {formatKRW(g.myTotal)} · 물품{" "}
                  {new Set(g.rows.map((r) => r.item.id)).size}개 · 후원 {g.rows.length}건
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
