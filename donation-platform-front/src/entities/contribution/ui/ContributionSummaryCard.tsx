"use client";

import { Users } from "lucide-react";
import { formatKRW } from "@/shared/lib/format";
import { useClientNow } from "@/shared/lib/useClientNow";
import type { ItemContributionSummary } from "../model/types";

function relativeTime(iso: string, now: number) {
  const diffMs = now - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "방금";
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  return `${Math.floor(hour / 24)}일 전`;
}

/** 물품별 참여 현황 — 후원자 수와 최근 참여. 이름은 서버에서 마스킹되어 온다. */
export function ContributionSummaryCard({ summary }: { summary: ItemContributionSummary }) {
  const now = useClientNow();

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Users className="size-4 text-muted-foreground" />
        <p className="text-sm font-semibold">
          {summary.donorCount > 0
            ? `${summary.donorCount}명이 함께하고 있어요`
            : "첫 번째 후원자가 되어주세요"}
        </p>
      </div>

      {summary.recent.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {summary.recent.map((row, i) => (
            <li
              key={`${row.donorName}-${row.createdAt}-${i}`}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground">{row.donorName}</span>
              <span className="flex items-center gap-3">
                <span className="font-medium">{formatKRW(row.amount)}</span>
                {now !== null ? (
                  <span className="text-xs text-muted-foreground">
                    {relativeTime(row.createdAt, now)}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          이 물품에 참여하면 목표 달성까지의 첫 걸음이 시작됩니다.
        </p>
      )}
    </div>
  );
}
