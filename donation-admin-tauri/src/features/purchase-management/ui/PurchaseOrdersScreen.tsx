import { useEffect, useState } from "react";
import { CheckCircle2, Plus, ShoppingCart, Truck } from "lucide-react";
import { Panel } from "../../../shared/ui/Panel";
import {
  DataTable,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "../../../shared/ui/DataTable";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { Button } from "../../../shared/ui/Button";
import { Drawer } from "../../../shared/ui/Drawer";
import { FormField } from "../../../shared/ui/FormField";
import { Input } from "../../../shared/ui/Input";
import { Select } from "../../../shared/ui/Select";
import { DatePicker } from "../../../shared/ui/DatePicker";
import { Textarea } from "../../../shared/ui/Textarea";
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

export function PurchaseOrdersScreen({ token }: { token: string }) {
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
                <h1 className="text-[16px] font-extrabold text-zinc-950">통합 구매</h1>
                <span className="text-[12px] font-semibold text-zinc-400">
                  대기 {pending.length}건 · 완료 {orders.length}건
                </span>
              </div>
              <p className="mt-1 text-[12px] leading-5 text-zinc-500">
                목표달성 물품의 외부 구매 결과, 실구매액, 증빙을 한 흐름으로 기록합니다.
              </p>
            </div>
          </div>
        </div>
      </Panel>

      {error && <p className="text-[13px] font-semibold text-red-600">{error}</p>}

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
          <DataTable>
            <DataTableHead>
              <tr>
                <DataTableHeaderCell>물품</DataTableHeaderCell>
                <DataTableHeaderCell>시설</DataTableHeaderCell>
                <DataTableHeaderCell className="text-right">목표액</DataTableHeaderCell>
                <DataTableHeaderCell className="text-right">실행</DataTableHeaderCell>
              </tr>
            </DataTableHead>
            <tbody>
              {pending.map((it) => (
                <DataTableRow key={it.itemId}>
                  <DataTableCell>
                    <div className="font-bold text-zinc-900">
                      {it.emoji} {it.name}
                    </div>
                  </DataTableCell>
                  <DataTableCell>{it.facility.name}</DataTableCell>
                  <DataTableCell className="text-right font-bold text-zinc-900">
                    {won(it.goalAmount)}
                  </DataTableCell>
                  <DataTableCell>
                    <div className="flex justify-end">
                      <Button size="sm" onClick={() => openPurchase(it)}>
                        <Plus size={14} /> 통합구매
                      </Button>
                    </div>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </tbody>
          </DataTable>
        )}
      </Panel>

      <Panel className="p-4">
        <CompactSectionHeader
          title={`통합구매 완료 · ${orders.length}건`}
          description="판매처, 실구매액, 배송 처리 상태를 확인합니다."
        />
        {loading ? null : orders.length === 0 ? (
          <EmptyState title="완료된 통합구매가 없습니다." />
        ) : (
          <DataTable>
            <DataTableHead>
              <tr>
                <DataTableHeaderCell>물품</DataTableHeaderCell>
                <DataTableHeaderCell>판매처</DataTableHeaderCell>
                <DataTableHeaderCell className="text-right">실구매액</DataTableHeaderCell>
                <DataTableHeaderCell>배송</DataTableHeaderCell>
                <DataTableHeaderCell className="text-right">처리</DataTableHeaderCell>
              </tr>
            </DataTableHead>
            <tbody>
              {orders.map((o) => (
                <DataTableRow key={o.id}>
                  <DataTableCell>
                    <div className="font-medium text-zinc-900">
                      {o.item.emoji} {o.item.name}
                    </div>
                    <div className="text-[11px] text-zinc-400">{o.facility.name}</div>
                  </DataTableCell>
                  <DataTableCell>{o.vendor}</DataTableCell>
                  <DataTableCell className="text-right font-bold text-zinc-900">
                    {won(o.purchasedAmount)}
                  </DataTableCell>
                  <DataTableCell>
                    {o.courier && o.trackingNo ? (
                      <div className="flex items-center gap-1.5 text-[13px] text-zinc-700">
                        <Truck size={13} className="text-zinc-400" />
                        <span>{courierLabel(o.courier)}</span>
                        <span className="text-zinc-400">{o.trackingNo}</span>
                      </div>
                    ) : (
                      <span className="text-[13px] text-zinc-400">송장 미등록</span>
                    )}
                  </DataTableCell>
                  <DataTableCell>
                    <div className="flex justify-end gap-2">
                      {o.item.status === "BUYING" && (
                        <Button size="sm" variant="outline" onClick={() => openShipment(o)}>
                          <Truck size={14} /> 송장 등록
                        </Button>
                      )}
                      {o.item.status === "SHIPPING" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => openShipment(o)}>
                            송장 수정
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => receive(o)}
                            disabled={busyItemId === o.item.id}
                          >
                            <CheckCircle2 size={14} /> 수령확인
                          </Button>
                        </>
                      )}
                      {(o.item.status === "RECEIVED" || o.item.status === "RECEIPTED") && (
                        <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-emerald-600">
                          <CheckCircle2 size={14} /> 수령완료
                        </span>
                      )}
                    </div>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </tbody>
          </DataTable>
        )}
      </Panel>

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
