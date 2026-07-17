"use client";

import { CircleHelp } from "lucide-react";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/Dialog";

const statusGuide = [
  {
    label: "자격확인",
    variant: "verified" as const,
    description: "시설 정보와 후원 대상 여부를 확인한 표시입니다.",
  },
  {
    label: "모집중",
    variant: "recruiting" as const,
    description: "지금 후원 참여가 가능한 준비물 목표가 있습니다.",
  },
  {
    label: "통합 구매 진행",
    variant: "buying" as const,
    description: "목표 달성 후 시설 단위로 구매를 모아 진행합니다.",
  },
  {
    label: "배송중",
    variant: "shipping" as const,
    description: "구매한 물품이 시설로 전달되는 중입니다.",
  },
  {
    label: "목표달성",
    variant: "locked" as const,
    description: "목표금액에 도달해 추가 후원을 받지 않습니다.",
  },
];

export function DonationGuideDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="shrink-0">
          <CircleHelp className="size-4" />
          안내
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>후원하기 안내</DialogTitle>
          <DialogDescription>
            시설 카드와 준비물 목표에 표시되는 상태의 의미입니다.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5 space-y-5">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">상태 표시</h3>
            <div className="space-y-2">
              {statusGuide.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 sm:grid sm:grid-cols-[8rem_1fr] sm:items-center sm:gap-3"
                >
                  <div className="shrink-0 pt-0.5">
                    <Badge variant={item.variant}>
                      <span className="whitespace-nowrap">
                        {item.label === "자격확인" ? "✓ " : ""}
                        {item.label}
                      </span>
                    </Badge>
                  </div>
                  <p className="min-w-0 text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">시설 유형</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-sm font-medium">아동양육시설</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  보호아동이 생활하는 시설의 준비물 목표입니다.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-sm font-medium">지역아동센터</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  지역 아동 돌봄과 학습 지원에 필요한 준비물 목표입니다.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">후원 방식</h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>시설이 직접 검수해 등록한 준비물 목표에 참여합니다.</li>
              <li>목표금액은 실제 구매 총액 기준으로 표시합니다.</li>
              <li>MVP에서는 아동 개인정보와 시설 이미지를 노출하지 않습니다.</li>
            </ul>
          </section>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button>확인</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
