"use client";

import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  HandCoins,
  Info,
  LockKeyhole,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { RequireAuth } from "@/widgets/guards/RequireAuth";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageShell } from "@/shared/ui/PageShell";
import { buttonVariants } from "@/shared/ui/Button";

const MVP_FLOW = [
  {
    icon: HandCoins,
    title: "품목별 공동 후원",
    description: "시설이 필요한 물품과 목표금액을 올리면 여러 후원자가 금액을 나눠 채웁니다.",
  },
  {
    icon: LockKeyhole,
    title: "목표 달성 잠금",
    description: "목표금액에 도달하면 추가 참여를 막고 통합구매 대기 단계로 넘어갑니다.",
  },
  {
    icon: ShoppingCart,
    title: "통합구매 기록",
    description: "운영자가 판매처, 실구매액, 구매증빙을 기록하고 같은 물품의 중복구매를 막습니다.",
  },
  {
    icon: Truck,
    title: "배송·수령 확인",
    description: "송장 정보와 시설 수령확인을 연결해 후원자가 진행 흐름을 확인합니다.",
  },
];

const CURRENT_SCOPE = [
  "시설·물품 공개 조회",
  "결제 없는 후원 참여 기록",
  "목표 달성 시 자동 잠금",
  "내 후원·배송 타임라인",
  "통합구매 대기·완료·배송 현황",
  "Tauri 관리자 운영 콘솔",
];

const PRINCIPLES = [
  "아동 실명, 얼굴, 생활공간 등 식별 가능한 정보는 노출하지 않습니다.",
  "목표금액은 추상 모금액이 아니라 실제 구매 총액 기준으로 표시합니다.",
  "구매증빙과 세액공제 기부금영수증은 구분해서 안내합니다.",
  "실결제는 전문가 검토와 운영 정책 확정 뒤 별도 단계에서 도입합니다.",
];

const NEXT_STEPS = [
  {
    icon: ReceiptText,
    title: "영수증 발급 단계",
    description: "수령확인 이후 구매·배송·수령 증빙을 묶어 후원자 화면에 정리합니다.",
  },
  {
    icon: Truck,
    title: "배송 자동 추적",
    description: "현재는 송장 딥링크 중심이며, 이후 배송 이벤트 동기화로 확장합니다.",
  },
  {
    icon: RotateCcw,
    title: "차액·환불 정책",
    description: "목표액과 실구매액 차이, 취소·환불 정합성은 결제 도입 전 확정합니다.",
  },
  {
    icon: Bell,
    title: "단계 알림",
    description: "목표달성, 구매, 배송, 수령 이벤트를 후원자에게 알려주는 기능을 붙입니다.",
  },
];

export default function ProjectIntroPage() {
  return (
    <RequireAuth>
      <PageShell width="wide" className="py-6">
        <div className="space-y-5">
          <PageHeader
            icon={Info}
            title="프로젝트 소개"
            description="시설별 필요 물품 후원을 기록하고, 목표 달성 이후 구매·배송·수령 흐름을 공개해 이행 과정을 확인하는 MVP입니다."
            actions={
              <div className="flex items-center gap-2">
                <Link href="/dashboard" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  현황 보기
                </Link>
                <Link href="/donate" className={buttonVariants({ size: "sm" })}>
                  후원하러 가기
                </Link>
              </div>
            }
          />

          <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <Card className="p-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="muted">1차 MVP</Badge>
                  <Badge variant="verified">가상 리허설</Badge>
                </div>
                <h2 className="text-xl font-semibold tracking-tight">지금 검증하는 것</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  이 단계의 목표는 실제 결제 시스템을 먼저 붙이는 것이 아니라, 시설이 필요한 물품을 공개하고
                  후원 참여 기록이 목표금액을 채우며, 목표 달성 후 구매와 배송 정보가 후원자에게 다시 보이는
                  운영 루프를 검증하는 것입니다.
                </p>
              </div>
            </Card>

            <Card className="p-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-primary" />
                  <h2 className="text-lg font-semibold tracking-tight">운영 기준</h2>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {PRINCIPLES.map((text) => (
                    <li key={text} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MVP_FLOW.map((item) => (
              <IntroStepCard key={item.title} {...item} />
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="p-5">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">현재 구현 범위</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    지금 화면에서 실제로 확인 가능한 기능입니다.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CURRENT_SCOPE.map((item) => (
                    <Badge key={item} variant="outline" className="h-7">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">이후 발전 계획</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    MVP 검증 뒤 정책·회계·운영 기준을 확정하면서 붙일 기능입니다.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {NEXT_STEPS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex gap-3 rounded-xl border bg-background p-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold">{item.title}</h3>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </section>
        </div>
      </PageShell>
    </RequireAuth>
  );
}

function IntroStepCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Card className="p-5">
      <span className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </Card>
  );
}
