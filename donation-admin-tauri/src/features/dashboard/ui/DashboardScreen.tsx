import { useEffect, useMemo, useState } from "react";
import { HandCoins, LayoutGrid, PackageCheck, ShoppingCart, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Panel, PanelHeader } from "../../../shared/ui/Panel";
import { API_BASE_URL } from "../../../shared/config/server";
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

const won = (value: number) => `${value.toLocaleString("ko-KR")}원`;

/**
 * MVP 대시보드 — 운영 지표와 구매 대기 목록만 남긴다.
 * 운영 기준·시나리오 비교는 웹 소개 페이지 내용의 사본이라 두지 않는다(git 히스토리에 있음).
 */
export function DashboardScreen({
  token,
  menuError,
  onNavigate,
}: {
  token: string;
  user: UserSummary;
  menuError?: string;
  onNavigate?: (menuCode: string) => void;
}) {
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

      <div className="mt-6 flex flex-col gap-6">
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
            <ul className="flex flex-col gap-2.5">
              {pending.slice(0, 6).map((item) => (
                <li
                  key={item.itemId}
                  className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 px-4 py-3.5 transition-colors hover:border-emerald-300 hover:bg-emerald-50/40"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[20px]">
                      {item.emoji ?? "📦"}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold text-zinc-900">{item.name}</p>
                      <p className="truncate text-[13px] text-zinc-500">{item.facility.name}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[15px] font-extrabold tracking-tight text-emerald-700">
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

        <footer className="flex flex-col gap-1 px-1 text-[12px] text-zinc-400">
          <span>서버 연결 · {API_BASE_URL}</span>
          {menuError && <span className="text-rose-600">{menuError}</span>}
        </footer>
      </div>
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
  icon: LucideIcon;
  label: string;
  value: number | string;
  unit?: string;
  hint?: string;
  loading?: boolean;
  onClick?: () => void;
}) {
  const body = (
    <>
      <div className="flex items-center gap-2.5">
        {/* 웹 프론트 KPI 카드와 같은 컬러 아이콘 배지 — 밋밋한 아이콘보다 친화적 */}
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Icon size={18} />
        </span>
        <span className="text-[13px] font-semibold text-zinc-500">{label}</span>
      </div>
      <p className="mt-3.5 text-[28px] font-extrabold leading-none tracking-tight text-zinc-900">
        {loading ? "—" : value}
        {!loading && unit && <span className="ml-1 text-[14px] font-bold text-zinc-500">{unit}</span>}
      </p>
      {hint && <p className="mt-2.5 text-[12px] leading-4 text-zinc-500">{hint}</p>}
    </>
  );

  const className = "rounded-2xl border border-zinc-200 bg-white p-5 text-left";

  if (!onClick) return <div className={className}>{body}</div>;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${className} transition-all hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md`}
    >
      {body}
    </button>
  );
}
