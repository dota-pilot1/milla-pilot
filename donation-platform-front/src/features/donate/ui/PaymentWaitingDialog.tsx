"use client";

import { Loader2, Smartphone } from "lucide-react";
import { Button } from "@/shared/ui/Button";

type Props = {
  open: boolean;
  /** "결제를 완료했어요" — 폴링을 기다리지 않고 즉시 확인한다 */
  onCheckNow: () => void;
  checking: boolean;
  onCancel: () => void;
};

/**
 * 결제 진행 중 안내.
 *
 * <p>QR·휴대폰 결제에서는 카카오페이가 "결제를 마친 뒤 PC화면에서 확인해주세요"라고 안내한다.
 * 그런데 정작 PC에 아무 안내가 없으면 사용자는 무엇을 기다리는지 알 수 없다.
 * 대기 상태를 명시하고, 직접 확인할 수단도 함께 준다.
 */
export function PaymentWaitingDialog({ open, onCheckNow, checking, onCancel }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40" aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-waiting-title"
        className="relative w-full max-w-sm rounded-2xl border bg-card p-6 shadow-lg"
      >
        <div className="flex flex-col items-center text-center">
          <Smartphone className="size-10 text-muted-foreground" />
          <h2 id="payment-waiting-title" className="mt-3 text-lg font-semibold">
            결제를 진행해 주세요
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            카카오페이 결제창에서 결제를 마치면 자동으로 확인됩니다.
            <br />
            휴대폰으로 결제하신 경우 결제 후 이 창으로 돌아와 주세요.
          </p>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border bg-muted/40 p-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          결제 확인 중…
        </div>

        <div className="mt-5 space-y-2">
          <Button className="w-full" onClick={onCheckNow} disabled={checking}>
            {checking ? "확인하는 중…" : "결제를 완료했어요"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={onCancel} disabled={checking}>
            취소
          </Button>
        </div>
      </div>
    </div>
  );
}
