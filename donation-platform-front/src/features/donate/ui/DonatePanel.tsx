"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as PortOne from "@portone/browser-sdk/v2";
import { useStore } from "@tanstack/react-store";
import { toast } from "sonner";
import { Button } from "@/shared/ui/Button";
import { AmountInput } from "@/shared/ui/AmountInput";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { DonationSuccessDialog } from "./DonationSuccessDialog";
import { PaymentWaitingDialog } from "./PaymentWaitingDialog";
import { formatKRW } from "@/shared/lib/format";
import { authStore } from "@/entities/user/model/authStore";
import {
  contributionApi,
  type ConfirmedContribution,
} from "@/entities/contribution/api/contributionApi";
import type { DonationItem } from "@/entities/donation-item/model/types";

const PRESETS = [10000, 30000, 50000];

/** 결제 확정 폴링 — 3초 간격, 최대 5분 */
const POLL_INTERVAL_MS = 3_000;
const POLL_MAX_ATTEMPTS = 100;

/**
 * 서버 확정이 성공할 때까지 주기적으로 시도한다.
 *
 * 결제창 SDK 가 결과를 돌려주지 않는 상황(사용자가 팝업을 직접 닫음, QR 결제 후
 * 원래 창이 콜백을 못 받음 등)에서도 결제가 실제로 승인됐다면 이 경로로 확정된다.
 * 서버 확정은 멱등이라 SDK 응답과 겹쳐도 두 번 반영되지 않는다.
 */
async function pollUntilConfirmed(paymentId: string) {
  for (let i = 0; i < POLL_MAX_ATTEMPTS; i += 1) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    try {
      return await contributionApi.confirmPayment(paymentId);
    } catch {
      // 아직 승인 전 — 계속 기다린다
    }
  }
  throw new Error("결제 확인 시간이 초과됐어요. 결제가 완료됐다면 잠시 후 새로고침해 주세요.");
}

export function DonatePanel({ item }: { item: DonationItem }) {
  const [amount, setAmount] = useState(() =>
    Math.min(30000, Math.max(0, item.goalAmount - item.raisedAmount)),
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  // 결제 완료 화면 — 확정된 후원 정보를 담아 띄운다
  const [succeeded, setSucceeded] = useState<ConfirmedContribution | null>(null);
  // 결제 진행 중인 건 — 대기 화면과 "결제를 완료했어요" 즉시 확인에 쓴다
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null);
  const [checkingNow, setCheckingNow] = useState(false);
  const router = useRouter();
  const qc = useQueryClient();
  const { status } = useStore(authStore);

  const remain = Math.max(0, item.goalAmount - item.raisedAmount);
  const full = item.raisedAmount >= item.goalAmount;
  const canDonate = item.status === "RECRUITING" && !full;

  // 후원 후 남은 금액이 줄면 선택 금액을 맞춰 내린다.
  // 그대로 두면 방금 후원한 사람에게 "남은 금액 초과"가 떠서 다시 후원할 수 없다.
  useEffect(() => {
    const left = Math.max(0, item.goalAmount - item.raisedAmount);
    setAmount((prev) => (prev > left ? left : prev));
  }, [item.goalAmount, item.raisedAmount]);

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["donation-item", item.id] });
    qc.invalidateQueries({ queryKey: ["facility", item.facilityId, "items"] });
    qc.invalidateQueries({ queryKey: ["contributions", "me"] });
    qc.invalidateQueries({ queryKey: ["contributions", "item-summary", item.id] });
  }, [qc, item.id, item.facilityId]);

  /**
   * 리다이렉트 방식 복귀 처리.
   *
   * 모바일이나 일부 결제수단은 결제창을 새 페이지로 열고 `redirectUrl` 로 되돌아온다.
   * 이때 `requestPayment` 프로미스는 끝나지 않으므로, URL 파라미터를 보고 확정을 이어가야 한다.
   * 이 처리가 없으면 결제는 됐는데 후원이 PENDING 으로 남아 15분 뒤 만료된다.
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get("paymentId");
    if (!paymentId) return;

    const code = params.get("code");
    const message = params.get("message");

    // 파라미터를 지워 새로고침 시 재처리되지 않게 한다
    params.delete("paymentId");
    params.delete("code");
    params.delete("message");
    params.delete("pgCode");
    params.delete("pgMessage");
    params.delete("transactionType");
    const rest = params.toString();
    window.history.replaceState({}, "", window.location.pathname + (rest ? `?${rest}` : ""));

    if (code) {
      contributionApi.cancelPayment(paymentId, message ?? code).catch(() => undefined);
      toast.error("결제가 완료되지 않았어요", { description: message ?? undefined });
      return;
    }

    contributionApi
      .confirmPayment(paymentId)
      .then((c) => {
        setSucceeded(c);
        invalidate();
      })
      .catch((e: unknown) => {
        const msg =
          (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "잠시 후 다시 시도해 주세요.";
        toast.error("결제 확인에 실패했어요", { description: msg });
      });
  }, [invalidate]);
  const exceeds = amount > remain;
  const amountOptions = [
    ...PRESETS.map((value) => ({ label: `${value / 10000}만원`, value })),
    { label: "남은 금액 모두", value: remain },
  ];

  const mutation = useMutation({
    // ① 결제 대기 생성 → ② 포트원 결제창 → ③ 서버 확정(금액 대조)
    mutationFn: async () => {
      // 결제창을 띄우기 전에 확인 다이얼로그를 닫는다.
      // 열린 채로 두면 포커스 트랩·오버레이가 포트원 결제 UI 위를 덮어 조작이 막힌다.
      setConfirmOpen(false);

      const init = await contributionApi.initiatePayment({
        donationItemId: item.id,
        amount,
      });

      setPendingPaymentId(init.paymentId);

      const sdk = PortOne.requestPayment({
        storeId: init.storeId,
        channelKey: init.channelKey,
        paymentId: init.paymentId,
        orderName: init.orderName,
        totalAmount: init.amount,
        currency: "CURRENCY_KRW",
        payMethod: "EASY_PAY",
        // 모바일 등 리다이렉트 방식 대비
        redirectUrl: `${window.location.origin}/donate/item/?id=${item.id}`,
      });

      // SDK 가 결과를 돌려주지 않는 경우(팝업 수동 종료, QR 결제 등)가 있어
      // 서버 확정 폴링을 함께 돌린다. 서버는 포트원에 직접 조회하므로 승인되는 순간 잡힌다.
      const result = await Promise.race([
        sdk.then((r) => ({ kind: "sdk" as const, r })),
        pollUntilConfirmed(init.paymentId).then((c) => ({ kind: "confirmed" as const, c })),
      ]);

      if (result.kind === "confirmed") return result.c;

      const paid = result.r;
      // code 가 있으면 실패·이탈 — 선점을 즉시 풀어준다
      if (paid?.code !== undefined) {
        await contributionApi
          .cancelPayment(init.paymentId, paid.message ?? paid.code)
          .catch(() => undefined);
        throw new Error(paid.message ?? "결제가 완료되지 않았어요.");
      }

      return contributionApi.confirmPayment(init.paymentId);
    },
    onSuccess: (c) => {
      setPendingPaymentId(null);
      setSucceeded(c);
      invalidate();
    },
    onError: (e: unknown) => {
      setPendingPaymentId(null);
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (e as Error)?.message ??
        "잠시 후 다시 시도해 주세요.";
      toast.error("후원하지 못했어요", { description: msg });
    },
  });

  /** 폴링을 기다리지 않고 지금 바로 확인한다 */
  const checkNow = async () => {
    if (!pendingPaymentId) return;
    setCheckingNow(true);
    try {
      const c = await contributionApi.confirmPayment(pendingPaymentId);
      setPendingPaymentId(null);
      setSucceeded(c);
      invalidate();
    } catch {
      toast.info("아직 결제가 확인되지 않았어요", {
        description: "결제를 마치셨다면 잠시 후 자동으로 반영됩니다.",
      });
    } finally {
      setCheckingNow(false);
    }
  };

  /** 결제를 포기 — 선점을 즉시 풀어 다른 후원자가 쓸 수 있게 한다 */
  const cancelPending = () => {
    if (pendingPaymentId) {
      contributionApi.cancelPayment(pendingPaymentId, "사용자 취소").catch(() => undefined);
    }
    setPendingPaymentId(null);
  };

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
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">모인 금액</span>
        {/* 금액은 이 카드의 주인공 — 본문보다 확실히 크게 */}
        <span className="text-2xl font-bold tracking-tight text-primary">
          {formatKRW(item.raisedAmount)}
        </span>
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
            variant="cta"
            size="lg"
            className="mt-4 w-full text-base font-semibold"
            onClick={onDonate}
            disabled={mutation.isPending || amount <= 0 || exceeds}
          >
            {mutation.isPending
              ? "결제 진행 중..."
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
            후원금은 지정하신 물품 구입에 사용되며, 잔액이 발생할 경우 해당 시설의 다른 필요 물품에
            사용됩니다. 구매 영수증과 배송 송장은 전달 완료 시 공개됩니다.
          </p>
        </>
      ) : (
        <Button className="mt-5 w-full" variant="secondary" disabled>
          {full ? "목표 달성" : "후원 마감"}
        </Button>
      )}

      <PaymentWaitingDialog
        open={pendingPaymentId !== null && succeeded === null}
        checking={checkingNow}
        onCheckNow={checkNow}
        onCancel={cancelPending}
      />

      <DonationSuccessDialog
        open={succeeded !== null}
        itemName={item.name}
        amount={succeeded?.amount ?? 0}
        // invalidate 로 이미 이번 후원이 반영된 값이다. 여기서 또 더하면 이중 집계가 된다.
        raisedAmount={item.raisedAmount}
        goalAmount={item.goalAmount}
        receiptUrl={succeeded?.receiptUrl}
        onClose={() => setSucceeded(null)}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="후원하시겠어요?"
        description={`${item.name}\n${formatKRW(amount)}을 후원합니다.\n\n카카오페이 결제창이 열립니다.`}
        confirmText="결제하기"
        loading={mutation.isPending}
        onConfirm={() => mutation.mutate()}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
