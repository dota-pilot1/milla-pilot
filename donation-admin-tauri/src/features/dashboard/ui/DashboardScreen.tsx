import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Database,
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

type DashboardTab = "status" | "policy" | "system";

const TABS: readonly TabItem<DashboardTab>[] = [
  { value: "status", label: "운영 현황", icon: Activity },
  { value: "policy", label: "운영 기준", icon: ShieldCheck },
  { value: "system", label: "시스템 정보", icon: Server },
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

      <Tabs items={TABS} value={tab} onValueChange={setTab} className="mt-1" />

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
