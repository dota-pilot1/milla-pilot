"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  ClipboardList,
  Compass,
  HandCoins,
  Info,
  LockKeyhole,
  ReceiptText,
  RotateCcw,
  Route,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { RequireAuth } from "@/widgets/guards/RequireAuth";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageShell } from "@/shared/ui/PageShell";
import { Tabs, TabPanel, type TabItem } from "@/shared/ui/Tabs";
import { CompareTable } from "@/shared/ui/CompareTable";
import { buttonVariants } from "@/shared/ui/Button";

type IntroTab = "overview" | "development" | "operation";

const TABS: readonly TabItem<IntroTab>[] = [
  { value: "overview", label: "개요", icon: Compass },
  { value: "development", label: "개발 계획", icon: ClipboardList },
  { value: "operation", label: "운영 계획", icon: Route },
];

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

const PRINCIPLES = [
  "아동 실명, 얼굴, 생활공간 등 식별 가능한 정보는 노출하지 않습니다.",
  "목표금액은 추상 모금액이 아니라 실제 구매 총액 기준으로 표시합니다.",
  "구매증빙과 세액공제 기부금영수증은 구분해서 안내합니다.",
  "실결제는 전문가 검토와 운영 정책 확정 뒤 별도 단계에서 도입합니다.",
];

// 1차 MVP 이행 루프 — 서버 ItemStatus 전이와 1:1 대응 (기획 §5·§8)
const MVP_STAGES: {
  status: string;
  label: string;
  actor: string;
  description: string;
  variant: React.ComponentProps<typeof Badge>["variant"];
  guard?: string;
}[] = [
  {
    status: "RECRUITING",
    label: "모집중",
    actor: "후원자",
    description: "시설이 올린 품목에 여러 후원자가 금액을 나눠 참여해 목표금액을 채웁니다.",
    variant: "recruiting",
  },
  {
    status: "LOCKED",
    label: "목표달성",
    actor: "시스템",
    description: "목표금액 도달 시 자동으로 잠기고 추가 참여를 차단합니다.",
    variant: "locked",
    guard: "동시 참여 시 목표액 초과 방지 (step3 정합성·동시성 처리)",
  },
  {
    status: "BUYING",
    label: "통합구매",
    actor: "운영자 · Tauri",
    description: "판매처, 실구매액, 구매증빙을 한 번만 기록합니다.",
    variant: "buying",
    guard: "1차 MVP는 실결제 없이 구매를 기록만 함 · 물품당 1건 제약으로 중복구매 차단",
  },
  {
    status: "SHIPPING",
    label: "배송중",
    actor: "판매처 → 시설",
    description: "택배사·송장번호·예상 도착일·배송 사진을 등록해 후원자 화면에 노출합니다.",
    variant: "shipping",
    guard: "택배사 API 연동이 아닌 송장 딥링크 기반",
  },
  {
    status: "RECEIVED",
    label: "수령확인",
    actor: "시설",
    description: "시설이 실제 수령을 확인하면 해당 물품이 완료 처리됩니다.",
    variant: "verified",
  },
  {
    status: "RECEIPTED",
    label: "영수증",
    actor: "운영자",
    description: "구매·배송·수령 증빙을 묶어 후원자 타임라인에 최종 반영합니다.",
    variant: "muted",
    guard: "구매증빙과 세액공제 기부금영수증은 별개",
  },
];

// MVP 후보 시나리오 — 아직 채택 전. 둘 중 하나를 고르기 위한 비교 자료.
const SCENARIOS = [
  {
    key: "A",
    title: "후원자 직접구매형",
    summary: "후원자가 직접 구매해 플랫폼 물류센터로 보내고, 관리자가 검수 후 시설로 전달합니다.",
    steps: [
      "후원자가 필요 물품을 확인하고 쿠팡 등에서 직접 구매",
      "배송지를 플랫폼 물류센터로 지정하고 영수증·송장을 첨부",
      "관리자가 입고 검수 후 승인 처리",
      "물류센터에서 시설로 발송",
      "시설 수령확인 → 증빙 정리",
    ],
  },
  {
    key: "B",
    title: "관리자 통합구매형",
    summary: "후원자는 금액만 참여하고, 목표 달성 후 관리자가 대신 구매해 시설로 직배송합니다.",
    steps: [
      "후원자가 품목별로 금액을 나눠 참여",
      "목표금액 도달 시 자동 잠금",
      "관리자가 통합구매 1회 실행, 영수증 첨부",
      "판매처에서 시설로 직배송, 송장 등록",
      "시설 수령확인 → 증빙 정리",
    ],
  },
] as const;

const SCENARIO_COLUMNS = [
  { label: "시나리오 A", hint: "후원자 직접구매형" },
  { label: "시나리오 B", hint: "관리자 통합구매형" },
];

const SCENARIO_ROWS = [
  { label: "실결제(PG)", values: ["불필요 — 후원자가 직접 결제", "필수 — 도입 전까지 리허설"], favors: 0 },
  { label: "후원금 취급", values: ["플랫폼이 자금을 만지지 않음", "정산 구조 설계 필요"], favors: 0 },
  { label: "환불", values: ["구매처에서 직접 취소·반품", "공동 후원 환불 기준 필요"], favors: 0 },
  { label: "물류센터", values: ["필수 — 집하·검수 공간", "불필요 — 판매처가 시설로 직배송"], favors: 1 },
  { label: "배송비", values: ["2회 — 구매처→센터→시설", "1회 — 구매처→시설"], favors: 1 },
  {
    label: "증빙 단계",
    values: ["4단 — 영수증·입고검수·출고·수령", "3단 — 구매증빙·송장·수령"],
    favors: 0,
  },
  { label: "후원 참여 방식", values: ["물품 단위로 직접 구매", "원하는 금액만 입력"], favors: 1 },
  { label: "공동충당", values: ["성립 어려움 — 물품 1개당 1인", "유지 — 여러 명이 소액 분담"], favors: 1 },
  { label: "기부금영수증", values: ["현물 평가액 산정 필요", "현금 기준이라 단순"], favors: 1 },
  { label: "현재 구현 상태", values: ["후원 모델 재설계 필요", "이미 구현 완료"], favors: 1 },
];

const ANALYSIS_POINTS = [
  {
    title: "두 안의 차이는 결국 하나",
    body: "돈이 플랫폼을 거치느냐입니다. A는 자금을 만지지 않는 대신 물류가 생기고, B는 물류가 없는 대신 결제·환불·정산이 전부 따라옵니다. 결제 복잡도와 물류 복잡도의 맞교환입니다.",
  },
  {
    title: "A의 강점 — 지금 바로 실서비스",
    body: "B는 PG를 붙이기 전까지 가상 리허설을 벗어나지 못합니다. A는 결제가 필요 없어 검토 관문을 기다리지 않고 실제 후원을 받을 수 있습니다.",
  },
  {
    title: "A의 강점 — 환불 문제 소멸",
    body: "공동 후원 환불(구매 착수 후 개별 환불, 목표 미달 일괄 환불)은 현재 가장 까다로운 미해결 과제인데, A에서는 이 문제가 발생하지 않습니다.",
  },
  {
    title: "A의 대가 — 공동충당 포기",
    body: "여러 후원자가 금액을 나눠 채우는 모델이 성립하지 않습니다. 물품을 잘게 쪼개 우회할 수는 있지만, 그 순간 목표금액이 필요수량으로 바뀌어 다른 제품이 됩니다.",
  },
  {
    title: "판단 기준",
    body: "소액 다수가 함께 채운다는 점이 이 서비스의 정체성이면 B, 지금 당장 실제로 굴러가는 것이 더 급하면 A입니다.",
  },
];

const FUTURE_PLAN: {
  group: string;
  tone: React.ComponentProps<typeof Badge>["variant"];
  note: string;
  items: { title: string; description: string }[];
}[] = [
  {
    group: "실서비스 전 필수",
    tone: "buying",
    note: "본체 기능은 아니지만 실제 운영을 시작하려면 반드시 있어야 합니다.",
    items: [
      { title: "실결제(PG) 도입", description: "PG 선정과 후원 상태 확장(결제·취소·환불)이 선행되어야 합니다." },
      { title: "취소·환불 정합성", description: "구매 착수 이후 개별 환불과 목표 미달 마감 시 일괄 환불 기준을 확정합니다." },
      { title: "관리자 권한 세분화", description: "운영 역할별 접근 범위를 나누고 감사 로그를 남깁니다." },
    ],
  },
  {
    group: "검토 중",
    tone: "shipping",
    note: "운영 방식이 확정되지 않아 구현 범위에 아직 넣지 않았습니다.",
    items: [
      { title: "현물 후원 접수·보관", description: "후원자가 물품을 직접 보내는 경로와 집하·검수 방식을 검토하고 있습니다." },
      { title: "기부금영수증 처리", description: "현금과 현물의 발급 근거와 평가 기준을 각각 정리해야 합니다." },
      { title: "차액 처리", description: "목표금액과 실구매액 차이를 어떻게 정산할지 정해야 합니다." },
    ],
  },
  {
    group: "파일럿 이후",
    tone: "muted",
    note: "없어도 이행 루프는 동작합니다. 1차 MVP 검증 뒤 선택적으로 붙입니다.",
    items: [
      { title: "실시간 배송 추적", description: "택배사 API를 붙여 배송 이벤트를 자동 동기화합니다." },
      { title: "단계 알림", description: "목표달성·구매·배송·수령 이벤트를 후원자에게 알립니다." },
      { title: "통계 대시보드 · 펀딩 캠페인", description: "운영 지표와 캠페인 단위 모금을 확장합니다." },
      { title: "커뮤니티 · 명예 홍보관", description: "후원자 참여 콘텐츠 영역을 추가합니다." },
    ],
  },
];

export default function ProjectIntroPage() {
  const [tab, setTab] = React.useState<IntroTab>("overview");

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

          <Tabs items={TABS} value={tab} onValueChange={setTab} idPrefix="intro" />

          {tab === "overview" ? (
            <TabPanel value="overview" idPrefix="intro" className="space-y-5">
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

              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {MVP_FLOW.map((item) => (
                  <IntroStepCard key={item.title} {...item} />
                ))}
              </section>
            </TabPanel>
          ) : null}

          {tab === "development" ? (
            <TabPanel value="development" idPrefix="intro" className="space-y-5">
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
                    {NEXT_STEPS.map((item) => (
                      <IntroRow key={item.title} {...item} />
                    ))}
                  </div>
                </div>
              </Card>
            </TabPanel>
          ) : null}

          {tab === "operation" ? (
            <TabPanel value="operation" idPrefix="intro" className="space-y-5">
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

              <Card className="p-5">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight">MVP 후보 시나리오</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        1차 MVP 운영 방식으로 검토 중인 두 안입니다. 아직 확정되지 않았습니다.
                      </p>
                    </div>
                    <Badge variant="shipping">검토 중 · 미확정</Badge>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    {SCENARIOS.map((scenario) => (
                      <div key={scenario.key} className="rounded-xl border bg-background p-4">
                        <div className="flex items-center gap-2">
                          <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                            {scenario.key}
                          </span>
                          <h3 className="text-sm font-semibold">{scenario.title}</h3>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {scenario.summary}
                        </p>
                        <ol className="mt-3 space-y-1.5">
                          {scenario.steps.map((step, index) => (
                            <li key={step} className="flex gap-2 text-xs leading-5 text-muted-foreground">
                              <span className="font-semibold text-foreground">{index + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>

                  <CompareTable
                    caption="MVP 후보 시나리오 비교"
                    columns={SCENARIO_COLUMNS}
                    rows={SCENARIO_ROWS}
                  />
                  <p className="text-xs text-muted-foreground">
                    굵게 표시된 쪽이 해당 항목에서 유리한 안입니다.
                  </p>
                </div>
              </Card>

              <Card className="p-5">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight">검토 의견</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        두 안을 비교한 분석입니다. 결정이 아니라 판단 근거입니다.
                      </p>
                    </div>
                    <Badge variant="outline">참고</Badge>
                  </div>
                  <ul className="space-y-3">
                    {ANALYSIS_POINTS.map((point) => (
                      <li key={point.title} className="rounded-xl border bg-background p-3">
                        <h3 className="text-sm font-semibold">{point.title}</h3>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{point.body}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              <Card className="p-5">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight">
                        시나리오 B 이행 루프
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        현재 구현되어 있는 흐름입니다. 각 단계는 물품 상태값과 1:1로 대응합니다.
                      </p>
                    </div>
                    <Badge variant="muted">현재 구현</Badge>
                  </div>
                  <ol>
                    {MVP_STAGES.map((stage, index) => (
                      <FlowStage
                        key={stage.status}
                        index={index}
                        isLast={index === MVP_STAGES.length - 1}
                        {...stage}
                      />
                    ))}
                  </ol>
                </div>
              </Card>

              <Card className="p-5">
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">이후 계획</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      1차 MVP 루프가 닫힌 뒤 단계적으로 붙일 범위입니다.
                    </p>
                  </div>
                  {FUTURE_PLAN.map((group) => (
                    <div key={group.group} className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={group.tone}>{group.group}</Badge>
                        <span className="text-xs text-muted-foreground">{group.note}</span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {group.items.map((item) => (
                          <div key={item.title} className="rounded-xl border bg-background p-3">
                            <h3 className="text-sm font-semibold">{item.title}</h3>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabPanel>
          ) : null}
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

function FlowStage({
  index,
  isLast,
  status,
  label,
  actor,
  description,
  variant,
  guard,
}: (typeof MVP_STAGES)[number] & { index: number; isLast: boolean }) {
  return (
    <li className="flex gap-3">
      {/* 단계 번호 + 연결선 */}
      <div className="flex flex-col items-center">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary bg-primary/10 text-xs font-bold text-primary">
          {index + 1}
        </span>
        {!isLast ? <span className="w-0.5 flex-1 bg-border" aria-hidden /> : null}
      </div>

      <div className={cn("min-w-0 flex-1", isLast ? "pb-0" : "pb-5")}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={variant}>{label}</Badge>
          <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {status}
          </code>
          <span className="text-xs text-muted-foreground">{actor}</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        {guard ? (
          <p className="mt-2 flex gap-1.5 rounded-lg bg-muted/60 px-2.5 py-1.5 text-xs leading-5 text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
            <span>{guard}</span>
          </p>
        ) : null}
      </div>
    </li>
  );
}

function IntroRow({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border bg-background p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
