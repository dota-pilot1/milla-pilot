"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@tanstack/react-store";
import { toast } from "sonner";
import { Button } from "@/shared/ui/Button";
import { AmountInput } from "@/shared/ui/AmountInput";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { formatKRW } from "@/shared/lib/format";
import { authStore } from "@/entities/user/model/authStore";
import { contributionApi } from "@/entities/contribution/api/contributionApi";
import type { DonationItem } from "@/entities/donation-item/model/types";

const PRESETS = [10000, 30000, 50000];

export function DonatePanel({ item }: { item: DonationItem }) {
  const [amount, setAmount] = useState(() =>
    Math.min(30000, Math.max(0, item.goalAmount - item.raisedAmount)),
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const router = useRouter();
  const qc = useQueryClient();
  const { status } = useStore(authStore);

  const remain = Math.max(0, item.goalAmount - item.raisedAmount);
  const full = item.raisedAmount >= item.goalAmount;
  const canDonate = item.status === "RECRUITING" && !full;
  const exceeds = amount > remain;
  const amountOptions = [
    ...PRESETS.map((value) => ({ label: `${value / 10000}만원`, value })),
    { label: "남은 금액 모두", value: remain },
  ];

  const mutation = useMutation({
    mutationFn: () => contributionApi.create({ donationItemId: item.id, amount }),
    onSuccess: () => {
      setConfirmOpen(false);
      toast.success("후원이 기록됐어요", {
        description: "사전등록 단계 — 실제 결제는 전문가 검토 후 열립니다.",
      });
      qc.invalidateQueries({ queryKey: ["donation-item", item.id] });
      qc.invalidateQueries({ queryKey: ["facility", item.facilityId, "items"] });
      qc.invalidateQueries({ queryKey: ["contributions", "me"] });
    },
    onError: (e: unknown) => {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "잠시 후 다시 시도해 주세요.";
      toast.error("후원하지 못했어요", { description: msg });
    },
  });

  const onDonate = () => {
    if (status !== "authenticated") {
      toast.info("로그인이 필요해요", { description: "로그인 후 후원에 참여할 수 있어요." });
      router.push("/login");
      return;
    }
    if (amount <= 0) return;
    setConfirmOpen(true);
  };

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
          <div className="mt-2 grid grid-cols-2 gap-2">
            {amountOptions.map((option) => (
              <Button
                key={`${option.label}-${option.value}`}
                variant={amount === option.value ? "default" : "outline"}
                size="sm"
                className="whitespace-nowrap"
                disabled={option.value <= 0 || option.value > remain}
                onClick={() => setAmount(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
          <div className="mt-2">
            <AmountInput value={amount} onChange={setAmount} aria-label="직접 입력 금액" />
          </div>
          <Button
            className="mt-4 w-full"
            onClick={onDonate}
            disabled={mutation.isPending || amount <= 0 || exceeds}
          >
            {mutation.isPending
              ? "처리 중..."
              : exceeds
                ? "남은 금액 초과"
                : `${formatKRW(amount)} 후원하기`}
          </Button>
          {exceeds ? (
            <p className="mt-2 text-xs text-destructive">
              남은 금액 {formatKRW(remain)}까지 후원할 수 있어요.
            </p>
          ) : null}
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

      <ConfirmDialog
        open={confirmOpen}
        title="후원하시겠어요?"
        description={`${item.name}\n${formatKRW(amount)}을 후원 기록합니다.\n\n사전등록 단계 — 실제 결제는 열리지 않습니다.`}
        confirmText="후원 기록"
        loading={mutation.isPending}
        onConfirm={() => mutation.mutate()}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
