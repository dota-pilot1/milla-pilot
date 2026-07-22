"use client";

import * as React from "react";
import { useState } from "react";
import {
  Boxes,
  ClipboardCheck,
  ClipboardList,
  Folder,
  ExternalLink,
  Gift,
  GitBranch,
  Globe,
  ListChecks,
  Package,
  ShieldCheck,
  Tag,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { RequireAuth } from "@/widgets/guards/RequireAuth";
import { ProjectTaskManager } from "@/features/project-task/ui/ProjectTaskManager";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageShell } from "@/shared/ui/PageShell";
import { Tabs, TabPanel, type TabItem } from "@/shared/ui/Tabs";

type DevInfoTab = "development" | "resources" | "todo";

const TABS: readonly TabItem<DevInfoTab>[] = [
  { value: "development", label: "개발 계획", icon: ClipboardList },
  { value: "resources", label: "저장소 · 배포", icon: GitBranch },
  { value: "todo", label: "할 일", icon: ListChecks },
];

// ─── 개발 계획 ──────────────────────────────────────────────────────────────

const CONTEXT_POINTS = [
  "후원자는 시설에 직접 현금을 보내는 것이 아니라, 시설이 필요로 하는 물품에 후원한다.",
  "시설은 필요한 물품을 등록하거나 선택하고, 후원자는 해당 물품 후원 의사를 남긴다.",
  "플랫폼 관리자는 확정된 물품을 대신 구매하고 배송·증빙 흐름을 관리한다.",
  "자사몰·도매몰은 이때 \"판매 사업\"이 아니라 \"후원 물품 조달처\" 역할을 한다.",
  "운영자가 모든 상품을 직접 팔고 관리하는 구조가 아니라, 필요한 물품만 제한적으로 다루면 된다.",
  "핵심은 상품 수를 늘리는 것이 아니라, 시설 후원에 자주 쓰이는 품목을 표준화하는 것이다.",
];

const BURDEN_PRINCIPLES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Package,
    title: "후원 전용 품목만 운영",
    description:
      "생활용품·식료품·학용품·위생용품 등 시설 후원에 반복적으로 필요한 품목 중심. 무한 상품 등록을 금지하고 SKU를 작고 관리 가능한 범위로 유지합니다.",
  },
  {
    icon: ClipboardCheck,
    title: "시설이 직접 상품을 고르는 구조",
    description:
      "운영자가 매번 물품을 대신 선정하지 않습니다. 시설 관리자가 필요한 물품을 선택·요청하면 플랫폼은 승인·정리·노출만 담당합니다.",
  },
  {
    icon: Boxes,
    title: "도매몰은 백엔드 공급망으로 사용",
    description:
      "후원자에게 도매몰을 직접 노출하지 않습니다. 도매가·공급 가능 여부를 기준으로 후원 물품을 구성하고, 실제 구매처는 도매몰·쿠팡·네이버·제휴 공급사 등 유연하게 사용합니다.",
  },
  {
    icon: Gift,
    title: "자사몰은 '판매몰'이 아니라 '후원 물품 카탈로그'",
    description:
      "가격 비교 쇼핑몰이 아닙니다. 시설별 필요 물품과 후원 목표를 보여주는 구조이며, 상품 상세도 \"왜 필요한가 / 어디에 쓰이는가 / 목표 금액\" 중심입니다.",
  },
  {
    icon: Truck,
    title: "배송·증빙은 주문 단위로 관리",
    description:
      "플랫폼 관리자가 구매를 진행합니다. 구매 영수증, 배송 상태, 수령 확인, 사진 증빙을 묶어서 관리하고 반복 업무는 상태값으로 자동화합니다.",
  },
];

const WORKFLOW_STAGES: {
  label: string;
  actor: string;
  description: string;
  detail?: string;
  variant: React.ComponentProps<typeof Badge>["variant"];
}[] = [
  {
    label: "시설 요청",
    actor: "시설",
    description: "시설이 필요한 물품을 요청합니다. 자유 입력하거나 미리 등록된 표준 품목에서 선택합니다.",
    detail: "예: 쌀 20kg · 세제 · 아동용 양말 · 학용품 세트 · 기저귀 · 생필품 꾸러미",
    variant: "muted",
  },
  {
    label: "운영자 검토",
    actor: "운영자",
    description: "요청된 물품이 적절한지 확인합니다.",
    detail: "아동 개인정보 노출 여부 · 후원 목적 적합성 · 가격 적정성 · 반복 수요 여부 · 공급 가능 여부",
    variant: "muted",
  },
  {
    label: "후원 상품화",
    actor: "운영자",
    description:
      "검토된 요청을 후원자가 참여할 수 있는 \"후원 물품\"으로 전환합니다. 상품을 파는 게 아니라 시설의 필요를 후원 가능한 단위로 바꾸는 것입니다.",
    detail: "예: 햇살아동양육시설 생필품 꾸러미 · 푸른숲 지역아동센터 학용품 세트",
    variant: "recruiting",
  },
  {
    label: "후원 참여",
    actor: "후원자",
    description: "후원자는 필요한 물품을 확인하고 참여 의사를 남깁니다. 자체 사이트 결제는 붙이지 않습니다.",
    detail: "예: 후원 희망 물품 선택 · 후원자 정보 확인 · 관리자 구매 진행 대상 확정",
    variant: "recruiting",
  },
  {
    label: "구매 실행",
    actor: "플랫폼 관리자",
    description: "플랫폼 관리자가 물품을 구매합니다. 구매처는 고정하지 않습니다.",
    detail: "도매몰 · 자사몰 재고 · 쿠팡/네이버 등 외부몰 · 제휴 공급사 발주 · 시설 직접 구매 후 증빙 제출",
    variant: "buying",
  },
  {
    label: "배송·수령·증빙",
    actor: "판매처 → 시설",
    description: "구매 후 상태를 관리합니다. 후원자에게는 \"내 돈이 어디에 쓰였는지\", 운영자에게는 업무 상태를 보여줍니다.",
    detail: "모집중 → 구매 진행 → 배송중 → 수령 확인 → 증빙 완료",
    variant: "shipping",
  },
];

const CONCLUSION =
  "자사몰·도매몰을 붙이는 목적은 쇼핑몰을 운영하려는 것이 아니라, 시설의 필요 물품을 표준화하고 플랫폼 관리자의 구매·배송·증빙 과정을 관리하기 위한 것이다. 이 서비스의 본질은 커머스가 아니라 \"시설 후원 물품 구매대행 + 투명 증빙 플랫폼\"으로 정의하는 것이 가장 맞다.";

// ─── 저장소 · 배포 ──────────────────────────────────────────────────────────

const REPO_URL = "https://github.com/dota-pilot1/milla-pilot";
const DEPLOY_URL = "https://dxline-tallent.com";
const WEB_RELEASE_URL = "https://github.com/dota-pilot1/milla-pilot/releases/tag/v0.1.0";

const TAURI_RELEASES: {
  app: string;
  version: string;
  status: string;
  statusVariant: React.ComponentProps<typeof Badge>["variant"];
  releaseUrl: string;
  updaterUrl: string;
  note: string;
}[] = [
  {
    app: "Donation Admin",
    version: "v0.1.12",
    status: "정식 릴리즈",
    statusVariant: "verified",
    releaseUrl: "https://github.com/dota-pilot1/donation-admin-tauri/releases/latest",
    updaterUrl: "https://github.com/dota-pilot1/donation-admin-tauri/releases/latest/download/latest.json",
    note: "운영 관리자 데스크탑 앱. 별도 릴리즈 저장소에서 업데이트 artifact를 제공합니다.",
  },
  {
    app: "Milla Dev Task",
    version: "0.1.11",
    status: "릴리즈 없음",
    statusVariant: "shipping",
    releaseUrl: "https://github.com/dota-pilot1/milla-dev-task-tauri/releases/latest",
    updaterUrl: "https://github.com/dota-pilot1/milla-dev-task-tauri/releases/latest/download/latest.json",
    note: "개발 태스크 관리 앱. updater endpoint는 잡혀 있지만 아직 공개 릴리즈가 없습니다.",
  },
];

const INFRA_ROWS = [
  { label: "도메인", value: "dxline-tallent.com (Route 53)" },
  { label: "CloudFront", value: "E11NF3HMOB52NI — /api/* → EC2, * → S3" },
  { label: "프론트 S3", value: "beauty-book-hair-front (인계받은 인프라, 내용물은 milla)" },
  { label: "EC2", value: "13.209.195.64 (ap-northeast-2)" },
  { label: "백엔드 포트", value: "4301 — Nginx :80 → 127.0.0.1:4301" },
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
            description="1차 MVP 구현 방향과 저장소·배포·할 일을 팀 내부 참고용으로 정리합니다."
          />

          <Tabs items={TABS} value={tab} onValueChange={setTab} idPrefix="dev-info" />

          {tab === "development" ? (
            <TabPanel value="development" idPrefix="dev-info" className="space-y-5">
              <Card className="p-5">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">
                      자사몰·도매몰은 &quot;운영 부담&quot;이 아니라 &quot;후원 흐름의 자동화 장치&quot;다
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      이 플랫폼의 핵심은 쇼핑몰을 새로 운영하는 것이 아니라, 후원 물품 선정부터 구매,
                      배송, 증빙까지의 흐름을 구조화하는 것입니다. 자사몰·도매몰은 판매 채널이 아니라 시설별
                      필요 물품을 표준화하고, 플랫폼 관리자가 실제 물품 구매를 실행하도록 연결하는
                      공급 인터페이스입니다.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold tracking-tight">이전 논의 요약</h2>
                  <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                    {CONTEXT_POINTS.map((text) => (
                      <li key={text} className="flex gap-2">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              <Card className="p-5">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">운영 부담을 줄이는 핵심 전제</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      자사몰·도매몰을 일반 쇼핑몰처럼 만들면 부담이 커집니다. 아래처럼 설계하면 운영 부담은
                      크게 줄어듭니다.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {BURDEN_PRINCIPLES.map((item) => (
                      <IntroRow key={item.title} {...item} />
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">
                      새로운 방법론 — 구매대행 워크플로우
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      자사몰·도매몰을 운영하는 게 아니라, 시설 후원 물품의 구매대행 워크플로우를 만듭니다.
                    </p>
                  </div>
                  <ol>
                    {WORKFLOW_STAGES.map((stage, index) => (
                      <WorkflowStage
                        key={stage.label}
                        index={index}
                        isLast={index === WORKFLOW_STAGES.length - 1}
                        {...stage}
                      />
                    ))}
                  </ol>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex gap-3">
                  <ClipboardCheck className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">한 줄 결론</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{CONCLUSION}</p>
                  </div>
                </div>
              </Card>
            </TabPanel>
          ) : null}

          {tab === "resources" ? (
            <TabPanel value="resources" idPrefix="dev-info" className="space-y-5">
              <Card className="p-5">
                <div className="flex gap-3">
                  <Folder className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold tracking-tight">Repository</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Spring(DDD) 공유 백엔드 + donation-admin-tauri(관리·CRUD) + donation-platform-front(웹) 모노레포입니다.
                    </p>
                    <a
                      href={REPO_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm font-medium text-primary hover:bg-muted"
                    >
                      <GitBranch className="size-4" />
                      {REPO_URL.replace("https://", "")}
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex gap-3">
                  <Globe className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold tracking-tight">배포 주소</h2>
                      <Badge variant="verified">운영중</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      프론트·API 공개 주소입니다. GitHub Actions가 main 브랜치를 자동 배포합니다.
                    </p>
                    <a
                      href={DEPLOY_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm font-medium text-primary hover:bg-muted"
                    >
                      <Globe className="size-4" />
                      {DEPLOY_URL.replace("https://", "")}
                    </a>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {INFRA_ROWS.map((row) => (
                        <div key={row.label} className="rounded-xl border bg-background p-3">
                          <p className="text-xs font-semibold text-muted-foreground">{row.label}</p>
                          <p className="mt-1 text-sm">{row.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex gap-3">
                  <Tag className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold tracking-tight">릴리즈</h2>
                      <Badge variant="verified">v0.1.0</Badge>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      웹·백엔드는 main 커밋 배포 후 GitHub Release로 기록합니다. Tauri 앱은 데스크탑
                      업데이트용 별도 릴리즈 주소를 함께 확인합니다 —{" "}
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        docs-for-프로젝트 문서1/배포 관련/데스크탑 앱 릴리스 방법 (Tauri).md
                      </code>{" "}
                      참고.
                    </p>

                    <a
                      href={WEB_RELEASE_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm font-medium text-primary hover:bg-muted"
                    >
                      <Tag className="size-4" />
                      milla-pilot v0.1.0
                      <ExternalLink className="size-3.5" />
                    </a>

                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      {TAURI_RELEASES.map((release) => (
                        <div key={release.app} className="rounded-xl border bg-background p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold">{release.app}</h3>
                            <Badge variant={release.statusVariant}>{release.status}</Badge>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            현재 앱 버전 {release.version} · {release.note}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <a
                              href={release.releaseUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-muted"
                            >
                              최신 릴리즈
                              <ExternalLink className="size-3.5" />
                            </a>
                            <a
                              href={release.updaterUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-muted"
                            >
                              latest.json
                              <ExternalLink className="size-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </TabPanel>
          ) : null}

          {tab === "todo" ? (
            <TabPanel value="todo" idPrefix="dev-info" className="space-y-5">
              <Card className="p-5">
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">남은 할 일</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      1차 MVP 루프가 닫힌 뒤 단계적으로 붙일 범위를 서버에 저장해 관리합니다.
                    </p>
                  </div>
                  <ProjectTaskManager />
                </div>
              </Card>
            </TabPanel>
          ) : null}
        </div>
      </PageShell>
    </RequireAuth>
  );
}

function WorkflowStage({
  index,
  isLast,
  label,
  actor,
  description,
  detail,
  variant,
}: (typeof WORKFLOW_STAGES)[number] & { index: number; isLast: boolean }) {
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary bg-primary/10 text-xs font-bold text-primary">
          {index + 1}
        </span>
        {!isLast ? <span className="w-0.5 flex-1 bg-border" aria-hidden /> : null}
      </div>

      <div className={cn("min-w-0 flex-1", isLast ? "pb-0" : "pb-5")}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={variant}>{label}</Badge>
          <span className="text-xs text-muted-foreground">{actor}</span>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        {detail ? (
          <p className="mt-2 rounded-lg bg-muted/60 px-2.5 py-1.5 text-xs leading-5 text-muted-foreground">
            {detail}
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
