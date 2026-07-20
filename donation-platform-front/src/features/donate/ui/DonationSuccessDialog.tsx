"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Progress } from "@/shared/ui/Progress";
import { formatKRW, pctOf } from "@/shared/lib/format";

type Props = {
  open: boolean;
  itemName: string;
  amount: number;
  /** 이번 후원이 반영된 뒤의 모금액 */
  raisedAmount: number;
  goalAmount: number;
  receiptUrl?: string | null;
  onClose: () => void;
};

/**
 * 결제 완료 화면.
 *
 * <p>기부는 결제 직후가 가장 마음이 큰 순간이라, 토스트로 흘려보내지 않고
 * "얼마가 어디에 쓰이는지 · 목표까지 얼마 남았는지 · 증빙은 어떻게 보는지"를 한 번에 보여준다.
 */
export function DonationSuccessDialog({
  open,
  itemName,
  amount,
  raisedAmount,
  goalAmount,
  receiptUrl,
  onClose,
}: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => closeRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const remain = Math.max(0, goalAmount - raisedAmount);
  const pct = pctOf(raisedAmount, goalAmount);
  const reached = remain === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-success-title"
        className="relative w-full max-w-sm rounded-2xl border bg-card p-6 shadow-lg"
      >
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="size-12 text-primary" />
          <h2 id="donation-success-title" className="mt-3 text-lg font-semibold">
            후원해 주셔서 고맙습니다
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{itemName}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-primary">
            {formatKRW(amount)}
          </p>
        </div>

        <div className="mt-6 rounded-xl border bg-muted/40 p-4">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium">
              {reached ? "목표를 채웠어요" : `목표까지 ${formatKRW(remain)}`}
            </span>
            <span className="font-bold text-primary">{pct}%</span>
          </div>
          <div className="mt-2">
            <Progress value={pct} complete={reached} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {reached
              ? "곧 구매를 진행하고, 영수증과 배송 송장을 공개해 드릴게요."
              : "목표가 채워지면 바로 알려드릴게요. 구매 영수증과 배송 송장도 공개됩니다."}
          </p>
        </div>

        <div className="mt-5 space-y-2">
          {receiptUrl ? (
            <Button variant="outline" className="w-full" asChild>
              <a href={receiptUrl} target="_blank" rel="noopener noreferrer">
                결제 영수증 보기 <ExternalLink className="size-4" />
              </a>
            </Button>
          ) : null}
          <Button variant="outline" className="w-full" asChild>
            <Link href="/my-donations">내 후원 내역</Link>
          </Button>
          <Button ref={closeRef} className="w-full" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}
