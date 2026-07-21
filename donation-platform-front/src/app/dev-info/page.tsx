"use client";

import * as React from "react";
import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  ReceiptText,
  RotateCcw,
  Route,
  ShieldCheck,
  Timer,
  Truck,
  Webhook,
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

type DevInfoTab = "development" | "operation" | "payment";

const TABS: readonly TabItem<DevInfoTab>[] = [
  { value: "development", label: "개발 계획", icon: ClipboardList },
  { value: "operation", label: "운영 계획", icon: Route },
  { value: "payment", label: "결제 흐름", icon: CreditCard },
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
  "실결제는 포트원·카카오페이로 연동을 마쳤습니다. 자세한 내용은 결제 흐름 탭을 참고하세요.",
];

// 전체 흐름 — 준비(관리자 CRUD) 2단계 + 이행 루프(물품 상태 전이) 6단계.
// 상태값이 있는 것과 없는 것을 섞어 보여주므로, where 로 어느 화면에서 하는 일인지 구분한다.
const FULL_FLOW: {
  phase: string;
  note: string;
  tone: React.ComponentProps<typeof Badge>["variant"];
  steps: { label: string; where: string; status?: string }[];
}[] = [
  {
    phase: "준비",
    note: "관리자가 등록합니다. 물품 상태값은 아직 없습니다.",
    tone: "muted",
    steps: [
      { label: "시설 등록", where: "Tauri 관리자" },
      { label: "물품 등록", where: "Tauri 관리자" },
    ],
  },
  {
    phase: "이행 루프",
    note: "등록된 물품이 상태를 따라 이동합니다. 후원자 화면에 그대로 보입니다.",
    tone: "recruiting",
    steps: [
      { label: "후원 결제", where: "웹 · 후원자", status: "RECRUITING" },
      { label: "목표 달성 · 자동 잠금", where: "시스템", status: "LOCKED" },
      { label: "통합구매", where: "Tauri 관리자", status: "BUYING" },
      { label: "배송중", where: "판매처 → 시설", status: "SHIPPING" },
      { label: "수령확인", where: "시설", status: "RECEIVED" },
      { label: "영수증", where: "Tauri 관리자", status: "RECEIPTED" },
    ],
  },
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
    guard: "물품당 1건 제약으로 중복구매 차단 · 발주는 수동",
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
  { label: "실결제(PG)", values: ["불필요 — 후원자가 직접 결제", "필수 — 연동 완료"], favors: 1 },
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
    title: "A의 대가 — 공동충당 포기",
    body: "여러 후원자가 금액을 나눠 채우는 모델이 성립하지 않습니다. 물품을 잘게 쪼개 우회할 수는 있지만, 그 순간 목표금액이 필요수량으로 바뀌어 다른 제품이 됩니다.",
  },
  {
    title: "B를 택한 이유",
    body: "소액 다수가 함께 채운다는 점이 이 서비스의 정체성입니다. A의 강점이던 \"결제 없이 지금 시작\"은 실결제 연동이 끝나면서 의미가 사라졌습니다.",
  },
  {
    title: "남은 숙제는 환불",
    body: "A였다면 없었을 문제입니다. 구매 착수 후 개별 환불과 목표 미달 일괄 환불 기준이 아직 미확정입니다.",
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
      { title: "정산 대사 배치", description: "포트원 결제 목록과 우리 DB를 주기적으로 전수 대조합니다." },
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

// ─── 결제 흐름 ──────────────────────────────────────────────────────────────
// 서버 ContributionService 의 initiate → confirm 경로와 1:1 대응한다.

const PAY_PRINCIPLE =
  "프론트가 보내는 \"결제 성공\"은 위조할 수 있다. 서버가 포트원에 직접 조회해 상태와 금액을 대조한 뒤에만 후원을 확정한다.";

const PAY_STEPS: {
  step: string;
  actor: string;
  result: string;
  detail: string;
  variant: React.ComponentProps<typeof Badge>["variant"];
}[] = [
  {
    step: "후원 시작",
    actor: "후원자",
    result: "PENDING",
    detail: "결제 식별자를 발급하고 잔여 금액을 선점한다. 아직 모금액에 반영하지 않는다.",
    variant: "recruiting",
  },
  {
    step: "결제창",
    actor: "카카오페이",
    result: "승인",
    detail: "실제 돈이 나가는 시점. 이 결과를 그대로 믿지 않는다.",
    variant: "shipping",
  },
  {
    step: "서버 검증",
    actor: "서버 → 포트원",
    result: "금액 대조",
    detail: "결제 상태가 PAID 인지, 금액이 우리가 만든 금액과 같은지 확인한다.",
    variant: "buying",
  },
  {
    step: "후원 확정",
    actor: "시스템",
    result: "PAID",
    detail: "모금액에 반영한다. 목표에 도달하면 물품이 LOCKED 로 잠긴다.",
    variant: "verified",
  },
];

// 확정 경로 3중화 — 하나가 끊겨도 다른 경로가 받는다.
const PAY_ROUTES = [
  {
    icon: CreditCard,
    title: "결제창 복귀",
    role: "주경로",
    body: "SDK 응답·3초 폴링·리다이렉트 복귀. 대부분 여기서 끝난다.",
    weakness: "브라우저를 닫으면 끊긴다",
  },
  {
    icon: Webhook,
    title: "웹훅",
    role: "1차 백업",
    body: "포트원이 서버로 직접 통보한다. 서명을 검증하고 시크릿이 없으면 거절한다.",
    weakness: "통보 자체가 유실될 수 있다",
  },
  {
    icon: Timer,
    title: "만료 배치",
    role: "최후 방어선",
    body: "1분마다 만료된 건을 포트원에 다시 물어본다. 실제로 결제됐으면 되살린다.",
    weakness: "확실하지 않으면 만료시키지 않고 보류한다",
  },
];

const PAY_GUARD_COLUMNS = [
  { label: "막는 사고", hint: "무엇이 잘못될 수 있는가" },
  { label: "장치", hint: "어떻게 막는가" },
];

const PAY_GUARD_ROWS = [
  { label: "금액 위조", values: ["후원자가 100원 내고 30만원 참여", "서버가 포트원 조회 금액과 대조"] },
  { label: "중복 반영", values: ["같은 결제가 두 번 확정", "결제 식별자 UNIQUE · 이미 PAID 면 무시"] },
  { label: "목표 초과 모금", values: ["동시 결제로 목표액을 넘김", "잔여 = 목표 − 모금액 − 선점액"] },
  { label: "위조 웹훅", values: ["가짜 결제 통보로 확정", "서명 검증 · 시크릿 없으면 전부 거절"] },
  { label: "결제 유실", values: ["돈은 냈는데 결제 안 한 사람이 됨", "만료 전 포트원 재확인 후 되살림"] },
];

const PAY_STATUS = [
  { code: "PENDING", label: "결제 대기", note: "잔여 금액 선점. 만료 시각이 지나면 선점이 풀린다" },
  { code: "PAID", label: "확정", note: "모금액에 반영된 유일한 상태" },
  { code: "FAILED", label: "실패", note: "금액 불일치 등 — 사람이 확인해야 하는 상태" },
  { code: "CANCELED", label: "취소", note: "후원자가 결제창을 닫아 우리가 그 사실을 알았을 때" },
  { code: "EXPIRED", label: "만료", note: "결제하지 않은 것을 포트원에 확인하고 정리했을 때" },
  { code: "REFUNDED", label: "환불", note: "환불 정책 확정 후 사용" },
];

const PAY_TODO = [
  { title: "정산 대사 배치", description: "포트원 결제 목록과 우리 DB를 주기적으로 전수 대조합니다." },
  { title: "환불·차액 처리", description: "목표 미달 일괄 환불과 실구매액 차액 정산 기준을 정합니다." },
  { title: "기부금영수증", description: "발급 주체와 과세 구분을 세무 검토 후 확정합니다." },
];

export default function DevInfoPage() {
  const [tab, setTab] = useState<DevInfoTab>("development");

  return (
    <RequireAuth>
      <PageShell width="wide" className="py-6">
        <div className="space-y-5">
          <PageHeader
            icon={ClipboardList}
            title="개발 정보"
            description="1차 MVP 구현 범위와 운영 방식 검토 내용을 팀 내부 참고용으로 정리합니다."
          />

          <Tabs items={TABS} value={tab} onValueChange={setTab} idPrefix="dev-info" />

          {tab === "development" ? (
            <TabPanel value="development" idPrefix="dev-info" className="space-y-5">
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

          {tab === "payment" ? (
            <TabPanel value="payment" idPrefix="dev-info" className="space-y-5">
              <Card className="p-5">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">한 줄 원칙</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{PAY_PRINCIPLE}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold tracking-tight">결제 4단계</h2>
                    <Badge variant="verified">실연동 검증 완료</Badge>
                  </div>
                  <ol className="grid gap-3 lg:grid-cols-4">
                    {PAY_STEPS.map((item, index) => (
                      <PayStep key={item.step} index={index} {...item} />
                    ))}
                  </ol>
                </div>
              </Card>

              <Card className="p-5">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">확정 경로 3중화</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      하나가 끊겨도 다음 경로가 받습니다. 순서대로 방어선입니다.
                    </p>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-3">
                    {PAY_ROUTES.map((route) => (
                      <div key={route.title} className="rounded-xl border bg-background p-4">
                        <div className="flex items-center gap-2">
                          <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <route.icon className="size-4" />
                          </span>
                          <h3 className="text-sm font-semibold">{route.title}</h3>
                          <Badge variant="outline" className="ml-auto">
                            {route.role}
                          </Badge>
                        </div>
                        <p className="mt-2.5 text-xs leading-5 text-muted-foreground">{route.body}</p>
                        <p className="mt-2 rounded-lg bg-muted/60 px-2.5 py-1.5 text-xs leading-5 text-muted-foreground">
                          {route.weakness}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">안전장치</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      각 항목은 실제로 일어날 수 있는 사고 하나씩에 대응합니다.
                    </p>
                  </div>
                  <CompareTable
                    caption="결제 안전장치"
                    columns={PAY_GUARD_COLUMNS}
                    rows={PAY_GUARD_ROWS}
                  />
                </div>
              </Card>

              <Card className="p-5">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold tracking-tight">후원 상태값</h2>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {PAY_STATUS.map((item) => (
                      <div
                        key={item.code}
                        className="flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-xl border bg-background p-3"
                      >
                        <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                          {item.code}
                        </code>
                        <span className="text-sm font-semibold">{item.label}</span>
                        <p className="w-full text-xs leading-5 text-muted-foreground">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold tracking-tight">남은 과제</h2>
                    <Badge variant="shipping">진행 전</Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {PAY_TODO.map((item) => (
                      <div key={item.title} className="rounded-xl border bg-background p-3">
                        <h3 className="text-sm font-semibold">{item.title}</h3>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </TabPanel>
          ) : null}

          {tab === "operation" ? (
            <TabPanel value="operation" idPrefix="dev-info" className="space-y-5">
              <Card className="p-5">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight">전체 흐름</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        시설 등록부터 영수증까지 한 물품이 거치는 전 과정입니다.
                      </p>
                    </div>
                    <Badge variant="outline">8단계</Badge>
                  </div>

                  <div className="space-y-4">
                    {FULL_FLOW.map((group) => (
                      <div key={group.phase} className="rounded-xl border bg-background p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={group.tone}>{group.phase}</Badge>
                          <span className="text-xs text-muted-foreground">{group.note}</span>
                        </div>
                        <ol className="mt-3 flex flex-wrap items-stretch gap-1.5">
                          {group.steps.map((step, index) => (
                            <React.Fragment key={step.label}>
                              {index > 0 ? (
                                <li aria-hidden className="flex items-center text-muted-foreground">
                                  →
                                </li>
                              ) : null}
                              <li className="rounded-lg border bg-card px-3 py-2">
                                <p className="text-sm font-medium">{step.label}</p>
                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                  {step.where}
                                </p>
                                {step.status ? (
                                  <code className="mt-1 inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                    {step.status}
                                  </code>
                                ) : null}
                              </li>
                            </React.Fragment>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>
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

              <Card className="p-5">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight">MVP 후보 시나리오</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        실결제 연동으로 B 기준으로 진행 중입니다. A는 검토 기록으로 남깁니다.
                      </p>
                    </div>
                    <Badge variant="verified">시나리오 B 진행</Badge>
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

function PayStep({
  index,
  step,
  actor,
  result,
  detail,
  variant,
}: (typeof PAY_STEPS)[number] & { index: number }) {
  return (
    <li className="rounded-xl border bg-background p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-primary bg-primary/10 text-xs font-bold text-primary">
          {index + 1}
        </span>
        <h3 className="text-sm font-semibold">{step}</h3>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <Badge variant={variant}>{result}</Badge>
        <span className="text-xs text-muted-foreground">{actor}</span>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
    </li>
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
