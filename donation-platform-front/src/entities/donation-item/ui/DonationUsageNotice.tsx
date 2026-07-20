"use client";

import { FileText, PackageCheck, Wallet } from "lucide-react";

const ITEMS = [
  {
    icon: Wallet,
    title: "목표가 채워지면 바로 구매합니다",
    body: "모인 후원금으로 해당 물품을 구입해 시설로 직접 배송합니다. 목표에 못 미치면 구매하지 않습니다.",
  },
  {
    icon: FileText,
    title: "구매 영수증을 공개합니다",
    body: "실제 구매 금액과 영수증을 그대로 공개합니다. 목표액과 실구매액이 다를 수 있습니다.",
  },
  {
    icon: PackageCheck,
    title: "배송 송장까지 확인할 수 있습니다",
    body: "운송장 번호로 전달 과정을 추적하고, 시설이 수령을 확인하면 알려드립니다.",
  },
];

/** 후원금이 어떻게 쓰이는지 — 후원 판단에 필요한 신뢰 정보 */
export function DonationUsageNotice() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-sm font-semibold">후원금은 이렇게 쓰입니다</p>
      <ul className="mt-4 space-y-4">
        {ITEMS.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex gap-3">
            <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">{title}</p>
              <p className="text-sm text-muted-foreground">{body}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t pt-4 text-xs text-muted-foreground">
        잔액이 발생할 경우 해당 시설의 다른 필요 물품에 사용되며, 사용 내역은 공개됩니다.
      </p>
    </div>
  );
}
