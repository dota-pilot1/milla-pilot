"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/Button";
import { TextInput } from "@/shared/ui/TextInput";
import { formatKRW } from "@/shared/lib/format";
import type { DonationItem } from "@/entities/donation-item/model/types";

const PRESETS = [10000, 30000, 50000];

export function DonatePanel({ item }: { item: DonationItem }) {
  const [amount, setAmount] = useState(30000);
  const remain = Math.max(0, item.goalAmount - item.raisedAmount);
  const full = item.raisedAmount >= item.goalAmount;
  const canDonate = item.status === "RECRUITING" && !full;

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">모인 금액</span>
        <span className="text-lg font-bold text-primary">{formatKRW(item.raisedAmount)}</span>
      </div>
      <div className="mt-1 flex items-baseline justify-between text-sm text-muted-foreground">
        <span>목표 / 남은</span>
        <span>
          {formatKRW(item.goalAmount)} · 남은 {formatKRW(remain)}
        </span>
      </div>

      {canDonate ? (
        <>
          <p className="mt-5 text-sm font-medium">후원 금액 선택</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset}
                variant={amount === preset ? "default" : "outline"}
                size="sm"
                onClick={() => setAmount(preset)}
              >
                {preset / 10000}만원
              </Button>
            ))}
          </div>
          <div className="mt-2">
            <TextInput
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              aria-label="직접 입력 금액"
            />
          </div>
          <Button
            className="mt-4 w-full"
            onClick={() =>
              toast.info("사전등록 단계입니다", {
                description: "실제 결제는 전문가 사전 검토 후 열립니다.",
              })
            }
          >
            {formatKRW(amount)} 후원하기
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            사전등록 단계에서는 실제 결제가 열리지 않습니다. 후원금은 시설 후원금 전용계좌로 직접
            귀속되며, 구매증빙과 세액공제 영수증은 구분해 안내됩니다.
          </p>
        </>
      ) : (
        <Button className="mt-5 w-full" variant="secondary" disabled>
          {full ? "목표 달성" : "후원 마감"}
        </Button>
      )}
    </div>
  );
}
