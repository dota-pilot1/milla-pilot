import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Database,
  GitCompare,
  HandCoins,
  LayoutGrid,
  LockKeyhole,
  PackageCheck,
  Server,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { Panel, PanelHeader } from "../../../shared/ui/Panel";
import { Tabs, type TabItem } from "../../../shared/ui/Tabs";
import { CompareTable } from "../../../shared/ui/CompareTable";
import { API_BASE_URL, SERVER_ROOT_PATH } from "../../../shared/config/server";
import { fetchAllContributions } from "../../../entities/contribution/api/contributionApi";
import {
  fetchPendingPurchases,
  fetchPurchaseOrders,
} from "../../../entities/purchase-order/api/purchaseOrderApi";
import type { AdminLedgerRow } from "../../../entities/contribution/model/types";
import type {
  AdminPurchaseOrder,
  PendingPurchaseItem,
} from "../../../entities/purchase-order/model/types";
import type { UserSummary } from "../../../entities/user/model/types";

type DashboardTab = "status" | "policy" | "scenario" | "system";

const TABS: readonly TabItem<DashboardTab>[] = [
  { value: "status", label: "운영 현황", icon: Activity },
  { value: "policy", label: "운영 기준", icon: ShieldCheck },
  { value: "scenario", label: "MVP 시나리오", icon: GitCompare },
  { value: "system", label: "시스템 정보", icon: Server },
];

// MVP 후보 시나리오 — 아직 채택 전. 웹 소개 페이지와 같은 내용을 운영자용으로 보여준다.
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
  { label: "증빙 단계", values: ["4단 — 영수증·입고검수·출고·수령", "3단 — 구매증빙·송장·수령"], favors: 0 },
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

const won = (value: number) => `${value.toLocaleString("ko-KR")}원`;

export function DashboardScreen({
  token,
  user,
  menuError,
  onNavigate,
}: {
  token: string;
  user: UserSummary;
  menuError?: string;
  onNavigate?: (menuCode: string) => void;
}) {
  const [tab, setTab] = useState<DashboardTab>("status");
  const [pending, setPending] = useState<PendingPurchaseItem[]>([]);
  const [orders, setOrders] = useState<AdminPurchaseOrder[]>([]);
  const [ledger, setLedger] = useState<AdminLedgerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    let alive = true;
    setLoading(true);
    setError("");

    Promise.all([
      fetchPendingPurchases(token),
      fetchPurchaseOrders(token),
      fetchAllContributions(token),
    ])
      .then(([pendingRes, ordersRes, ledgerRes]) => {
        if (!alive) return;
        setPending(pendingRes);
        setOrders(ordersRes);
        setLedger(ledgerRes);
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "운영 현황을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [token]);

  const stats = useMemo(() => {
    const shipping = orders.filter((o) => o.item.status === "SHIPPING").length;
    const awaitingShipment = orders.filter(
      (o) => o.item.status === "BUYING" && !o.shippedAt,
    ).length;
    const done = orders.filter(
      (o) => o.item.status === "RECEIVED" || o.item.status === "RECEIPTED",
    ).length;
    const total = ledger.reduce((sum, row) => sum + row.amount, 0);
    const donors = new Set(ledger.map((row) => row.donor.id)).size;
    return { shipping, awaitingShipment, done, total, donors };
  }, [orders, ledger]);

  return (
    <main className="workspace-page">
      <section className="workspace-hero dense">
        <div className="workspace-hero-mark">
          <LayoutGrid size={26} />
        </div>
        <div className="workspace-hero-copy">
          <p className="eyebrow">DonationPlatform Admin</p>
          <h1>대시보드</h1>
          <p>운영 현황</p>
        </div>
      </section>

      <Tabs items={TABS} value={tab} onValueChange={setTab} className="mt-2 mb-1" />

      {tab === "status" && (
        <div className="flex flex-col gap-5">
          {error && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              icon={ShoppingCart}
              label="구매 대기"
              value={pending.length}
              unit="건"
              hint="목표 달성 후 통합구매 미실행"
              loading={loading}
              onClick={onNavigate ? () => onNavigate("ADMIN_PURCHASE_PENDING") : undefined}
            />
            <StatCard
              icon={Truck}
              label="배송 등록 대기"
              value={stats.awaitingShipment}
              unit="건"
              hint="구매 완료·송장 미등록"
              loading={loading}
              onClick={onNavigate ? () => onNavigate("ADMIN_PURCHASE_COMPLETED") : undefined}
            />
            <StatCard
              icon={Truck}
              label="배송중"
              value={stats.shipping}
              unit="건"
              hint="시설 수령 확인 대기"
              loading={loading}
            />
            <StatCard
              icon={PackageCheck}
              label="수령 완료"
              value={stats.done}
              unit="건"
              hint="수령확인·영수증 단계"
              loading={loading}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <StatCard icon={HandCoins} label="누적 후원액" value={won(stats.total)} loading={loading} />
            <StatCard icon={HandCoins} label="후원 건수" value={ledger.length} unit="건" loading={loading} />
            <StatCard icon={HandCoins} label="참여 후원자" value={stats.donors} unit="명" loading={loading} />
          </div>

          <Panel>
            <PanelHeader
              title="구매 대기 물품"
              description="목표금액이 채워져 통합구매를 기다리는 물품입니다."
            />
            {loading ? (
              <p className="text-[13px] text-zinc-500">불러오는 중…</p>
            ) : pending.length === 0 ? (
              <p className="text-[13px] text-zinc-500">구매 대기 중인 물품이 없습니다.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {pending.slice(0, 6).map((item) => (
                  <li
                    key={item.itemId}
                    className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="text-[16px]">{item.emoji ?? "📦"}</span>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-bold text-zinc-900">{item.name}</p>
                        <p className="truncate text-[12px] text-zinc-500">{item.facility.name}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-[13px] font-bold text-emerald-700">
                      {won(item.raisedAmount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {pending.length > 6 && (
              <p className="mt-3 text-[12px] text-zinc-500">
                외 {pending.length - 6}건 — 구매·배송 메뉴에서 전체를 확인하세요.
              </p>
            )}
          </Panel>
        </div>
      )}

      {tab === "policy" && (
        <div className="flex flex-col gap-5">
          <Panel>
            <PanelHeader title="MVP 운영 범위" description="1차 MVP에서 이 콘솔이 담당하는 범위입니다." />
            <div className="admin-detail-grid">
              <div>
                <span>후원 모델</span>
                <strong>품목별 공동충당</strong>
              </div>
              <div>
                <span>목표 잠금</span>
                <strong>목표 달성 후 추가 참여 차단</strong>
              </div>
              <div>
                <span>통합구매</span>
                <strong>대기·완료·배송 흐름 관리</strong>
              </div>
              <div>
                <span>운영 권한</span>
                <strong>{user.role.name}</strong>
              </div>
            </div>
          </Panel>

          <section className="starter-grid">
            <article className="starter-panel">
              <HandCoins size={20} />
              <strong>후원 투명성</strong>
              <span>
                후원자는 결제 없이 참여 기록을 남기고, 내 후원·배송 화면에서 물품 진행 단계를 확인합니다.
              </span>
            </article>
            <article className="starter-panel">
              <LockKeyhole size={20} />
              <strong>목표 달성 기준</strong>
              <span>시설 물품 목표액이 충족되면 모집을 잠그고 통합구매 대기 대상으로 전환합니다.</span>
            </article>
            <article className="starter-panel">
              <ShoppingCart size={20} />
              <strong>구매·배송 추적</strong>
              <span>
                관리자는 실구매액, 판매처, 송장, 수령 확인을 기록하고 후원자 웹에는 관리 기능 없이
                공개합니다.
              </span>
            </article>
          </section>
        </div>
      )}

      {tab === "scenario" && (
        <div className="flex flex-col gap-5">
          <Panel>
            <PanelHeader
              title="MVP 후보 시나리오"
              description="1차 MVP 운영 방식으로 검토 중인 두 안입니다. 아직 확정되지 않았습니다."
              action={
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                  검토 중 · 미확정
                </span>
              }
            />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {SCENARIOS.map((scenario) => (
                <div key={scenario.key} className="rounded-xl border border-zinc-200 p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-md bg-emerald-50 text-[11px] font-extrabold text-emerald-700">
                      {scenario.key}
                    </span>
                    <h3 className="text-[13px] font-extrabold text-zinc-900">{scenario.title}</h3>
                  </div>
                  <p className="mt-2 text-[12px] leading-5 text-zinc-600">{scenario.summary}</p>
                  <ol className="mt-3 flex flex-col gap-1.5">
                    {scenario.steps.map((step, index) => (
                      <li key={step} className="flex gap-2 text-[11px] leading-4 text-zinc-500">
                        <span className="font-bold text-zinc-800">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
            <CompareTable className="mt-5" columns={SCENARIO_COLUMNS} rows={SCENARIO_ROWS} />
            <p className="mt-2 text-[11px] text-zinc-500">
              굵게 표시된 쪽이 해당 항목에서 유리한 안입니다.
            </p>
          </Panel>

          <Panel>
            <PanelHeader
              title="검토 의견"
              description="두 안을 비교한 분석입니다. 결정이 아니라 판단 근거입니다."
            />
            <ul className="flex flex-col gap-3">
              {ANALYSIS_POINTS.map((point) => (
                <li key={point.title} className="rounded-xl border border-zinc-200 p-3">
                  <h3 className="text-[13px] font-extrabold text-zinc-900">{point.title}</h3>
                  <p className="mt-1 text-[12px] leading-5 text-zinc-600">{point.body}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}

      {tab === "system" && (
        <section className="starter-grid">
          <article className="starter-panel">
            <ShieldCheck size={20} />
            <strong>MVP 운영 콘솔</strong>
            <span>
              시설, 물품, 후원 원장, 통합구매, 배송, 계정 권한을 관리자 전용 Tauri 앱에서 처리합니다.
            </span>
          </article>
          <article className="starter-panel">
            <Database size={20} />
            <strong>DB 메뉴 기반</strong>
            <span>사이드바와 접근 범위는 `/api/menus` 응답을 역할 기준으로 필터링해 표시합니다.</span>
            {menuError && <small className="error-text">{menuError}</small>}
          </article>
          <article className="starter-panel">
            <Server size={20} />
            <strong>서버 연결</strong>
            <span>{API_BASE_URL}</span>
            <small>{SERVER_ROOT_PATH}</small>
          </article>
        </section>
      )}
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  hint,
  loading,
  onClick,
}: {
  icon: typeof Activity;
  label: string;
  value: number | string;
  unit?: string;
  hint?: string;
  loading?: boolean;
  onClick?: () => void;
}) {
  const body = (
    <>
      <div className="flex items-center gap-2 text-zinc-500">
        <Icon size={16} />
        <span className="text-[12px] font-semibold">{label}</span>
      </div>
      <p className="mt-3 text-[22px] font-extrabold leading-none text-zinc-900">
        {loading ? "—" : value}
        {!loading && unit && <span className="ml-1 text-[13px] font-bold text-zinc-500">{unit}</span>}
      </p>
      {hint && <p className="mt-2 text-[11px] leading-4 text-zinc-500">{hint}</p>}
    </>
  );

  const className = "rounded-2xl border border-zinc-200 bg-white p-4 text-left";

  if (!onClick) return <div className={className}>{body}</div>;

  return (
    <button type="button" onClick={onClick} className={`${className} transition-colors hover:border-emerald-400`}>
      {body}
    </button>
  );
}
