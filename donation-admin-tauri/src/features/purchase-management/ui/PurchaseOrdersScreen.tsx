import { useEffect, useMemo, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { CheckCircle2, Plus, ShoppingCart, Truck } from "lucide-react";
import { Panel } from "../../../shared/ui/Panel";
import { AdminDataGrid } from "../../../shared/ui/AdminDataGrid";
import { AdminGridHeader } from "../../../shared/ui/AdminGridHeader";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { Button } from "../../../shared/ui/Button";
import { Drawer } from "../../../shared/ui/Drawer";
import { FormField } from "../../../shared/ui/FormField";
import { Input } from "../../../shared/ui/Input";
import { Select } from "../../../shared/ui/Select";
import { DatePicker } from "../../../shared/ui/DatePicker";
import { Textarea } from "../../../shared/ui/Textarea";
import { StatusBadge } from "../../../shared/ui/StatusBadge";
import { ApiError } from "../../../shared/api/client";
import {
  confirmReceived,
  createPurchaseOrder,
  fetchPendingPurchases,
  fetchPurchaseOrders,
  registerShipment,
} from "../../../entities/purchase-order/api/purchaseOrderApi";
import { COURIERS, courierLabel } from "../../../entities/purchase-order/model/courier";
import { uploadImage } from "../../../shared/api/upload";
import type {
  AdminPurchaseOrder,
  PendingPurchaseItem,
} from "../../../entities/purchase-order/model/types";

const won = (n: number) => n.toLocaleString("ko-KR") + "원";
const todayStr = () => new Date().toISOString().slice(0, 10);
const dateOnly = (iso: string | null) => (iso ? iso.slice(0, 10) : "");

type PurchaseOrdersMode = "pending" | "completed";

type PendingPurchaseGridRow = {
  itemId: number;
  itemLabel: string;
  facilityName: string;
  goalAmount: number;
  source: PendingPurchaseItem;
};

type PurchaseOrderGridRow = {
  id: number;
  itemLabel: string;
  facilityName: string;
  vendor: string;
  purchasedAmount: number;
  shippingLabel: string;
  orderedAt: string | null;
  status: AdminPurchaseOrder["item"]["status"];
  source: AdminPurchaseOrder;
};

type PendingFilterKey = "itemLabel" | "facilityName" | "goalAmount";
type CompletedFilterKey =
  | "itemLabel"
  | "vendor"
  | "purchasedAmount"
  | "shippingLabel"
  | "status"
  | "orderedAt";
type RangeFilter = { start: string; end: string };

const itemStatusLabel: Record<AdminPurchaseOrder["item"]["status"], string> = {
  RECRUITING: "모집중",
  LOCKED: "목표달성",
  BUYING: "구매완료",
  SHIPPING: "배송중",
  RECEIVED: "수령완료",
  RECEIPTED: "증빙완료",
};

const itemStatusTone: Record<AdminPurchaseOrder["item"]["status"], "neutral" | "success" | "info" | "warning"> = {
  RECRUITING: "neutral",
  LOCKED: "warning",
  BUYING: "warning",
  SHIPPING: "info",
  RECEIVED: "success",
  RECEIPTED: "success",
};

function toPurchaseOrderGridRow(order: AdminPurchaseOrder): PurchaseOrderGridRow {
  const shippingLabel =
    order.courier && order.trackingNo
      ? `${courierLabel(order.courier)} ${order.trackingNo}`
      : "송장 미등록";

  return {
    id: order.id,
    itemLabel: `${order.item.emoji ? `${order.item.emoji} ` : ""}${order.item.name}`,
    facilityName: order.facility.name,
    vendor: order.vendor,
    purchasedAmount: order.purchasedAmount,
    shippingLabel,
    orderedAt: order.orderedAt,
    status: order.item.status,
    source: order,
  };
}

function toPendingPurchaseGridRow(item: PendingPurchaseItem): PendingPurchaseGridRow {
  return {
    itemId: item.itemId,
    itemLabel: `${item.emoji ? `${item.emoji} ` : ""}${item.name}`,
    facilityName: item.facility.name,
    goalAmount: item.goalAmount,
    source: item,
  };
}

function includes(value: string | number | null | undefined, query?: string) {
  const normalized = query?.trim().toLowerCase();
  if (!normalized) return true;
  return String(value ?? "").toLowerCase().includes(normalized);
}

function isWithinAmountRange(amount: number, range: RangeFilter) {
  if (!range.start && !range.end) return true;

  const min = range.start ? Number(range.start) : Number.NEGATIVE_INFINITY;
  const max = range.end ? Number(range.end) : Number.POSITIVE_INFINITY;

  return amount >= min && amount <= max;
}

function isWithinDateRange(iso: string | null, range: RangeFilter) {
  if (!range.start && !range.end) return true;
  if (!iso) return false;

  const time = new Date(iso).getTime();
  const start = range.start ? new Date(`${range.start}T00:00:00`).getTime() : Number.NEGATIVE_INFINITY;
  const end = range.end ? new Date(`${range.end}T23:59:59.999`).getTime() : Number.POSITIVE_INFINITY;

  return time >= start && time <= end;
}

type Form = {
  vendor: string;
  vendorUrl: string;
  orderedAt: string; // YYYY-MM-DD
  purchasedAmount: string;
  quantity: string;
  evidenceNo: string;
  evidenceFileUrl: string;
  courier: string; // "" = 미선택
  trackingNo: string;
  shipmentImageUrl: string;
  expectedDeliveryAt: string; // YYYY-MM-DD
  note: string;
};

const emptyForm = (goalAmount: number): Form => ({
  vendor: "",
  vendorUrl: "",
  orderedAt: todayStr(),
  purchasedAmount: String(goalAmount),
  quantity: "",
  evidenceNo: "",
  evidenceFileUrl: "",
  courier: "",
  trackingNo: "",
  shipmentImageUrl: "",
  expectedDeliveryAt: "",
  note: "",
});

export function PurchaseOrdersScreen({ token, mode = "pending" }: { token: string; mode?: PurchaseOrdersMode }) {
  const [pending, setPending] = useState<PendingPurchaseItem[]>([]);
  const [orders, setOrders] = useState<AdminPurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [target, setTarget] = useState<PendingPurchaseItem | null>(null);
  const [form, setForm] = useState<Form>(emptyForm(0));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [shipTarget, setShipTarget] = useState<AdminPurchaseOrder | null>(null);
  const [shipForm, setShipForm] = useState({
    courier: COURIERS[0].id,
    trackingNo: "",
    shipmentImageUrl: "",
    expectedDeliveryAt: "",
  });
  const [shipUploading, setShipUploading] = useState(false);
  const [busyItemId, setBusyItemId] = useState<number | null>(null);
  const [pendingFilters, setPendingFilters] = useState<Partial<Record<Exclude<PendingFilterKey, "goalAmount">, string>>>({});
  const [pendingGoalRange, setPendingGoalRange] = useState<RangeFilter>({ start: "", end: "" });
  const [completedFilters, setCompletedFilters] = useState<Partial<Record<Exclude<CompletedFilterKey, "purchasedAmount" | "orderedAt">, string>>>({});
  const [completedAmountRange, setCompletedAmountRange] = useState<RangeFilter>({ start: "", end: "" });
  const [completedOrderedRange, setCompletedOrderedRange] = useState<RangeFilter>({ start: "", end: "" });

  const load = () => {
    setLoading(true);
    Promise.all([fetchPendingPurchases(token), fetchPurchaseOrders(token)])
      .then(([p, o]) => {
        setPending(p);
        setOrders(o);
        setError("");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "통합구매 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [token]);

  const openPurchase = (it: PendingPurchaseItem) => {
    setTarget(it);
    setForm(emptyForm(it.goalAmount));
  };

  const onPickImage = async (
    file: File | undefined,
    apply: (url: string) => void,
    setBusy: (v: boolean) => void,
  ) => {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImage(token, file);
      apply(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "이미지 업로드에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const canSubmit =
    !!form.vendor.trim() &&
    !!form.orderedAt &&
    !!form.purchasedAmount.trim() &&
    !!form.evidenceNo.trim();

  const submit = async () => {
    if (!target) return;
    setSaving(true);
    try {
      const tracking = form.trackingNo.trim();
      await createPurchaseOrder(token, target.itemId, {
        vendor: form.vendor.trim(),
        vendorUrl: form.vendorUrl.trim(),
        orderedAt: form.orderedAt ? new Date(form.orderedAt).toISOString() : null,
        purchasedAmount: Number(form.purchasedAmount) || 0,
        quantity: form.quantity.trim() ? Number(form.quantity) : null,
        evidenceNo: form.evidenceNo.trim(),
        evidenceFileUrl: form.evidenceFileUrl.trim(),
        note: form.note.trim(),
        courier: tracking ? form.courier : "",
        trackingNo: tracking,
        shipmentImageUrl: form.shipmentImageUrl.trim(),
        expectedDeliveryAt: form.expectedDeliveryAt || null,
      });
      setTarget(null);
      load();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "통합구매 실행에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const openShipment = (o: AdminPurchaseOrder) => {
    setShipTarget(o);
    setShipForm({
      courier: o.courier ?? COURIERS[0].id,
      trackingNo: o.trackingNo ?? "",
      shipmentImageUrl: o.shipmentImageUrl ?? "",
      expectedDeliveryAt: dateOnly(o.expectedDeliveryAt),
    });
  };

  const submitShipment = async () => {
    if (!shipTarget) return;
    setSaving(true);
    try {
      await registerShipment(token, shipTarget.id, {
        courier: shipForm.courier,
        trackingNo: shipForm.trackingNo.trim(),
        shipmentImageUrl: shipForm.shipmentImageUrl.trim(),
        expectedDeliveryAt: shipForm.expectedDeliveryAt || null,
      });
      setShipTarget(null);
      load();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "송장 등록에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const receive = async (o: AdminPurchaseOrder) => {
    if (!confirm(`${o.item.name} — 시설 수령확인 처리할까요?`)) return;
    setBusyItemId(o.item.id);
    try {
      await confirmReceived(token, o.item.id);
      load();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "수령확인에 실패했습니다.");
    } finally {
      setBusyItemId(null);
    }
  };

  const pendingRows = useMemo(() => pending.map(toPendingPurchaseGridRow), [pending]);
  const orderRows = useMemo(() => orders.map(toPurchaseOrderGridRow), [orders]);
  const filteredPendingRows = useMemo(
    () =>
      pendingRows.filter(
        (row) =>
          includes(row.itemLabel, pendingFilters.itemLabel) &&
          includes(row.facilityName, pendingFilters.facilityName) &&
          isWithinAmountRange(row.goalAmount, pendingGoalRange),
      ),
    [pendingFilters.facilityName, pendingFilters.itemLabel, pendingGoalRange, pendingRows],
  );
  const filteredOrderRows = useMemo(
    () =>
      orderRows.filter(
        (row) =>
          includes(row.itemLabel, completedFilters.itemLabel) &&
          includes(row.vendor, completedFilters.vendor) &&
          includes(row.shippingLabel, completedFilters.shippingLabel) &&
          includes(itemStatusLabel[row.status], completedFilters.status) &&
          isWithinAmountRange(row.purchasedAmount, completedAmountRange) &&
          isWithinDateRange(row.orderedAt, completedOrderedRange),
      ),
    [
      completedAmountRange,
      completedFilters.itemLabel,
      completedFilters.shippingLabel,
      completedFilters.status,
      completedFilters.vendor,
      completedOrderedRange,
      orderRows,
    ],
  );

  const setPendingTextFilter = (field: PendingFilterKey, value: string) => {
    if (field === "goalAmount") return;
    setPendingFilters((current) => ({ ...current, [field]: value }));
  };

  const setPendingRangeFilter = (field: PendingFilterKey, value: RangeFilter) => {
    if (field === "goalAmount") setPendingGoalRange(value);
  };

  const setCompletedTextFilter = (field: CompletedFilterKey, value: string) => {
    if (field === "purchasedAmount" || field === "orderedAt") return;
    setCompletedFilters((current) => ({ ...current, [field]: value }));
  };

  const setCompletedRangeFilter = (field: CompletedFilterKey, value: RangeFilter) => {
    if (field === "purchasedAmount") setCompletedAmountRange(value);
    if (field === "orderedAt") setCompletedOrderedRange(value);
  };

  const pendingColumnDefs = useMemo<ColDef<PendingPurchaseGridRow>[]>(
    () => [
      {
        field: "itemLabel",
        headerName: "물품",
        flex: 1.25,
        minWidth: 260,
        headerComponent: AdminGridHeader<PendingPurchaseGridRow, PendingFilterKey>,
        headerComponentParams: {
          fieldKey: "itemLabel",
          filterValue: pendingFilters.itemLabel ?? "",
          filterPlaceholder: "물품명 입력",
          onFilterChange: setPendingTextFilter,
        },
        cellClass: "items-center",
        cellRenderer: ({ data }: { data?: PendingPurchaseGridRow }) =>
          data ? (
            <div className="flex h-full min-w-0 items-center">
              <span className="truncate font-bold text-zinc-900">{data.itemLabel}</span>
            </div>
          ) : null,
      },
      {
        field: "facilityName",
        headerName: "시설",
        flex: 1,
        minWidth: 190,
        headerComponent: AdminGridHeader<PendingPurchaseGridRow, PendingFilterKey>,
        headerComponentParams: {
          fieldKey: "facilityName",
          filterValue: pendingFilters.facilityName ?? "",
          filterPlaceholder: "시설명 입력",
          onFilterChange: setPendingTextFilter,
        },
        cellClass: "items-center text-[13px] font-semibold text-zinc-800",
      },
      {
        field: "goalAmount",
        headerName: "목표액",
        width: 160,
        headerComponent: AdminGridHeader<PendingPurchaseGridRow, PendingFilterKey>,
        headerComponentParams: {
          fieldKey: "goalAmount",
          filterVariant: "number-range",
          rangeValue: pendingGoalRange,
          align: "center",
          popoverAlign: "right",
          onRangeFilterChange: setPendingRangeFilter,
        },
        valueFormatter: ({ value }) => won(Number(value || 0)),
        cellClass: "items-center justify-center text-center font-extrabold text-zinc-950",
      },
      {
        headerName: "실행",
        width: 170,
        headerClass: "ag-center-header",
        sortable: false,
        filter: false,
        cellClass: "items-center justify-center",
        cellRenderer: ({ data }: { data?: PendingPurchaseGridRow }) =>
          data ? (
            <div className="flex h-full w-full items-center justify-center">
              <Button size="sm" onClick={() => openPurchase(data.source)}>
                <Plus size={14} /> 통합구매
              </Button>
            </div>
          ) : null,
      },
    ],
    [pendingFilters.facilityName, pendingFilters.itemLabel, pendingGoalRange],
  );

  const orderColumnDefs = useMemo<ColDef<PurchaseOrderGridRow>[]>(
    () => [
      {
        field: "itemLabel",
        headerName: "물품",
        flex: 1.3,
        minWidth: 240,
        headerComponent: AdminGridHeader<PurchaseOrderGridRow, CompletedFilterKey>,
        headerComponentParams: {
          fieldKey: "itemLabel",
          filterValue: completedFilters.itemLabel ?? "",
          filterPlaceholder: "물품명 입력",
          onFilterChange: setCompletedTextFilter,
        },
        cellRenderer: ({ data }: { data?: PurchaseOrderGridRow }) => {
          if (!data) return null;
          return (
            <div className="flex h-full min-w-0 flex-col justify-center">
              <div className="truncate font-bold text-zinc-900">{data.itemLabel}</div>
              <div className="truncate text-[11px] text-zinc-400">{data.facilityName}</div>
            </div>
          );
        },
      },
      {
        field: "vendor",
        headerName: "판매처",
        flex: 0.8,
        minWidth: 150,
        headerComponent: AdminGridHeader<PurchaseOrderGridRow, CompletedFilterKey>,
        headerComponentParams: {
          fieldKey: "vendor",
          filterValue: completedFilters.vendor ?? "",
          filterPlaceholder: "판매처 입력",
          onFilterChange: setCompletedTextFilter,
        },
        cellClass: "items-center text-[13px] font-semibold text-zinc-800",
      },
      {
        field: "purchasedAmount",
        headerName: "실구매액",
        width: 150,
        headerComponent: AdminGridHeader<PurchaseOrderGridRow, CompletedFilterKey>,
        headerComponentParams: {
          fieldKey: "purchasedAmount",
          filterVariant: "number-range",
          rangeValue: completedAmountRange,
          align: "center",
          popoverAlign: "right",
          onRangeFilterChange: setCompletedRangeFilter,
        },
        valueFormatter: ({ value }) => won(Number(value || 0)),
        cellClass: "items-center justify-center text-center font-extrabold text-zinc-950",
      },
      {
        field: "shippingLabel",
        headerName: "배송",
        flex: 1,
        minWidth: 190,
        headerComponent: AdminGridHeader<PurchaseOrderGridRow, CompletedFilterKey>,
        headerComponentParams: {
          fieldKey: "shippingLabel",
          filterValue: completedFilters.shippingLabel ?? "",
          filterPlaceholder: "택배사 또는 송장",
          onFilterChange: setCompletedTextFilter,
        },
        cellRenderer: ({ data }: { data?: PurchaseOrderGridRow }) => {
          if (!data) return null;
          if (!data.source.courier || !data.source.trackingNo) {
            return (
              <div className="flex h-full items-center">
                <span className="text-[13px] text-zinc-400">송장 미등록</span>
              </div>
            );
          }
          return (
            <div className="flex h-full min-w-0 items-center gap-1.5 text-[13px] text-zinc-700">
              <Truck size={13} className="shrink-0 text-zinc-400" />
              <span className="shrink-0">{courierLabel(data.source.courier)}</span>
              <span className="truncate text-zinc-400">{data.source.trackingNo}</span>
            </div>
          );
        },
      },
      {
        field: "status",
        headerName: "상태",
        width: 120,
        headerComponent: AdminGridHeader<PurchaseOrderGridRow, CompletedFilterKey>,
        headerComponentParams: {
          fieldKey: "status",
          filterValue: completedFilters.status ?? "",
          filterPlaceholder: "상태 입력",
          align: "center",
          popoverAlign: "right",
          onFilterChange: setCompletedTextFilter,
        },
        cellClass: "items-center justify-center",
        cellRenderer: ({ data }: { data?: PurchaseOrderGridRow }) =>
          data ? (
            <div className="flex h-full items-center justify-center">
              <StatusBadge tone={itemStatusTone[data.status]}>{itemStatusLabel[data.status]}</StatusBadge>
            </div>
          ) : null,
      },
      {
        field: "orderedAt",
        headerName: "구매일",
        width: 150,
        headerComponent: AdminGridHeader<PurchaseOrderGridRow, CompletedFilterKey>,
        headerComponentParams: {
          fieldKey: "orderedAt",
          filterVariant: "date-range",
          rangeValue: completedOrderedRange,
          align: "center",
          popoverAlign: "right",
          onRangeFilterChange: setCompletedRangeFilter,
        },
        valueFormatter: ({ value }) => dateOnly(value ? String(value) : null) || "-",
        cellClass: "items-center justify-center text-center text-[13px] font-semibold text-zinc-800",
      },
      {
        headerName: "처리",
        width: 210,
        headerClass: "ag-center-header",
        sortable: false,
        filter: false,
        cellClass: "items-center justify-center",
        cellRenderer: ({ data }: { data?: PurchaseOrderGridRow }) => {
          if (!data) return null;
          const order = data.source;
          return (
            <div className="flex h-full w-full items-center justify-center gap-2">
              {order.item.status === "BUYING" && (
                <Button size="sm" variant="outline" onClick={() => openShipment(order)}>
                  <Truck size={14} /> 송장 등록
                </Button>
              )}
              {order.item.status === "SHIPPING" && (
                <>
                  <Button size="sm" variant="outline" onClick={() => openShipment(order)}>
                    송장 수정
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => receive(order)}
                    disabled={busyItemId === order.item.id}
                  >
                    <CheckCircle2 size={14} /> 수령확인
                  </Button>
                </>
              )}
              {(order.item.status === "RECEIVED" || order.item.status === "RECEIPTED") && (
                <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-emerald-600">
                  <CheckCircle2 size={14} /> 수령완료
                </span>
              )}
            </div>
          );
        },
      },
    ],
    [
      busyItemId,
      completedAmountRange,
      completedFilters.itemLabel,
      completedFilters.shippingLabel,
      completedFilters.status,
      completedFilters.vendor,
      completedOrderedRange,
    ],
  );

  const isPendingMode = mode === "pending";

  return (
    <main className="workspace-page space-y-4">
      <Panel className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
              <ShoppingCart size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h1 className="text-[16px] font-extrabold text-zinc-950">
                  {isPendingMode ? "통합 구매 대기" : "통합 구매 완료"}
                </h1>
                <span className="text-[12px] font-semibold text-zinc-400">
                  대기 {pending.length}건 · 완료 {orders.length}건
                </span>
              </div>
              <p className="mt-1 text-[12px] leading-5 text-zinc-500">
                {isPendingMode
                  ? "목표달성 물품을 외부 구매 결과 기록으로 전환합니다."
                  : "완료된 통합구매의 실구매액, 배송, 처리 상태를 관리합니다."}
              </p>
            </div>
          </div>
        </div>
      </Panel>

      {error && <p className="text-[13px] font-semibold text-red-600">{error}</p>}

      {isPendingMode ? (
        <Panel className="p-4">
          <CompactSectionHeader
            title={`구매 대기 · ${pending.length}건`}
            description="목표달성된 물품을 통합구매로 전환합니다."
          />
          {loading ? (
            <p className="text-[13px] text-zinc-500">불러오는 중...</p>
          ) : pending.length === 0 ? (
            <EmptyState
              title="구매 대기 물품이 없습니다."
              description="목표달성된 물품이 여기에 표시됩니다."
            />
          ) : (
            <AdminDataGrid<PendingPurchaseGridRow>
              rowData={filteredPendingRows}
              columnDefs={pendingColumnDefs}
              height={360}
              rowHeight={58}
              defaultColDef={{ filter: false }}
              getRowId={({ data }) => String(data.itemId)}
              overlayNoRowsTemplate="표시할 구매 대기 물품이 없습니다."
            />
          )}
        </Panel>
      ) : (
        <Panel className="p-4">
          <CompactSectionHeader
            title={`통합구매 완료 · ${orders.length}건`}
            description="판매처, 실구매액, 배송 처리 상태를 확인합니다."
          />
          {loading ? null : orders.length === 0 ? (
            <EmptyState title="완료된 통합구매가 없습니다." />
          ) : (
            <AdminDataGrid<PurchaseOrderGridRow>
              rowData={filteredOrderRows}
              columnDefs={orderColumnDefs}
              height={520}
              rowHeight={64}
              defaultColDef={{ filter: false }}
              getRowId={({ data }) => String(data.id)}
              overlayNoRowsTemplate="표시할 통합구매 내역이 없습니다."
            />
          )}
        </Panel>
      )}

      <Drawer
        open={target != null}
        title={target ? `${target.name} · 통합구매` : "통합구매"}
        description="외부에서 구매한 결과를 기록합니다. (구매증빙은 세액공제 영수증이 아닙니다 · F-015)"
        onOpenChange={(open) => {
          if (!open) setTarget(null);
        }}
        footer={
          <>
            <Button size="sm" variant="outline" onClick={() => setTarget(null)}>
              취소
            </Button>
            <Button size="sm" onClick={submit} disabled={saving || uploading || !canSubmit}>
              통합구매 기록
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3">
          <FormField label="판매처 *">
            <Input
              value={form.vendor}
              placeholder="예: OO문구 · 쿠팡"
              onChange={(e) => setForm({ ...form, vendor: e.target.value })}
            />
          </FormField>
          <FormField label="판매처 URL (선택)">
            <Input
              type="url"
              value={form.vendorUrl}
              placeholder="https:// 상품 페이지 링크"
              onChange={(e) => setForm({ ...form, vendorUrl: e.target.value })}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="구매일 *">
              <DatePicker
                value={form.orderedAt}
                onChange={(v) => setForm({ ...form, orderedAt: v })}
              />
            </FormField>
            <FormField label="구매액 *">
              <Input
                type="number"
                value={form.purchasedAmount}
                onChange={(e) => setForm({ ...form, purchasedAmount: e.target.value })}
              />
            </FormField>
          </div>
          <FormField label="구매 수량 (선택)">
            <Input
              type="number"
              value={form.quantity}
              placeholder="예: 30"
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </FormField>
          <FormField label="주문번호 / 영수증번호 *">
            <Input
              value={form.evidenceNo}
              onChange={(e) => setForm({ ...form, evidenceNo: e.target.value })}
            />
          </FormField>
          <ImageField
            label="영수증 첨부 (선택)"
            value={form.evidenceFileUrl}
            uploading={uploading}
            onPick={(f) => onPickImage(f, (url) => setForm((p) => ({ ...p, evidenceFileUrl: url })), setUploading)}
            onClear={() => setForm({ ...form, evidenceFileUrl: "" })}
          />

          <div className="mt-1 border-t border-zinc-100 pt-3">
            <p className="mb-1 text-[12px] font-semibold text-zinc-500">
              송장 (선택) — 구매 시점에 알면 함께 기록, 없으면 나중에 별도 등록
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="택배사 (선택)">
              <Select
                value={form.courier}
                onChange={(e) => setForm({ ...form, courier: e.target.value })}
              >
                <option value="">선택 안 함</option>
                {COURIERS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="송장번호 (선택)">
              <Input
                value={form.trackingNo}
                placeholder="숫자만 입력"
                onChange={(e) => setForm({ ...form, trackingNo: e.target.value })}
              />
            </FormField>
          </div>
          <ImageField
            label="송장 이미지 (선택)"
            value={form.shipmentImageUrl}
            uploading={uploading}
            onPick={(f) => onPickImage(f, (url) => setForm((p) => ({ ...p, shipmentImageUrl: url })), setUploading)}
            onClear={() => setForm({ ...form, shipmentImageUrl: "" })}
          />
          <FormField label="배송 예정일 (선택)">
            <DatePicker
              value={form.expectedDeliveryAt}
              onChange={(v) => setForm({ ...form, expectedDeliveryAt: v })}
            />
          </FormField>

          <FormField label="메모 (선택)">
            <Textarea
              rows={2}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </FormField>
        </div>
      </Drawer>

      <Drawer
        open={shipTarget != null}
        title={shipTarget ? `${shipTarget.item.name} · 송장 등록` : "송장 등록"}
        description="택배사·운송장번호는 1회만 입력합니다. 후원자는 통합조회 딥링크로 배송을 확인합니다. (배송 단계 자동화는 다음 단계)"
        onOpenChange={(open) => {
          if (!open) setShipTarget(null);
        }}
        footer={
          <>
            <Button size="sm" variant="outline" onClick={() => setShipTarget(null)}>
              취소
            </Button>
            <Button
              size="sm"
              onClick={submitShipment}
              disabled={saving || shipUploading || !shipForm.trackingNo.trim()}
            >
              송장 등록
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3">
          <FormField label="택배사">
            <Select
              value={shipForm.courier}
              onChange={(e) => setShipForm({ ...shipForm, courier: e.target.value })}
            >
              {COURIERS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="운송장번호">
            <Input
              value={shipForm.trackingNo}
              placeholder="숫자만 입력"
              onChange={(e) => setShipForm({ ...shipForm, trackingNo: e.target.value })}
            />
          </FormField>
          <ImageField
            label="송장 이미지 (선택)"
            value={shipForm.shipmentImageUrl}
            uploading={shipUploading}
            onPick={(f) =>
              onPickImage(f, (url) => setShipForm((p) => ({ ...p, shipmentImageUrl: url })), setShipUploading)
            }
            onClear={() => setShipForm({ ...shipForm, shipmentImageUrl: "" })}
          />
          <FormField label="배송 예정일 (선택)">
            <DatePicker
              value={shipForm.expectedDeliveryAt}
              onChange={(v) => setShipForm({ ...shipForm, expectedDeliveryAt: v })}
            />
          </FormField>
        </div>
      </Drawer>
    </main>
  );
}

function CompactSectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[14px] font-extrabold text-zinc-950">{title}</h2>
        {description && <p className="mt-1 text-[12px] leading-5 text-zinc-500">{description}</p>}
      </div>
    </div>
  );
}

function ImageField({
  label,
  value,
  uploading,
  onPick,
  onClear,
}: {
  label: string;
  value: string;
  uploading: boolean;
  onPick: (file: File | undefined) => void;
  onClear: () => void;
}) {
  return (
    <FormField label={label}>
      <div className="space-y-2">
        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => onPick(e.target.files?.[0])}
          className="block w-full text-[13px] text-zinc-600 file:mr-3 file:rounded-lg file:border file:border-zinc-300 file:bg-white file:px-3 file:py-1.5 file:text-[13px] file:font-semibold file:text-zinc-700 hover:file:bg-zinc-50 disabled:opacity-50"
        />
        {uploading && <p className="text-[12px] text-zinc-500">업로드 중...</p>}
        {value && !uploading && (
          <div className="flex items-center gap-2">
            <img
              src={value}
              alt="미리보기"
              className="h-14 w-14 rounded-lg border border-zinc-200 object-cover"
            />
            <button
              type="button"
              onClick={onClear}
              className="text-[12px] font-semibold text-red-600 hover:underline"
            >
              제거
            </button>
          </div>
        )}
      </div>
    </FormField>
  );
}
