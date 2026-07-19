import { useEffect, useState } from "react";
import { Pencil, Plus, ReceiptText, Trash2 } from "lucide-react";
import { Button } from "../../../shared/ui/Button";
import {
  DataTable,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
} from "../../../shared/ui/DataTable";
import { Drawer } from "../../../shared/ui/Drawer";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { FormField } from "../../../shared/ui/FormField";
import { Input } from "../../../shared/ui/Input";
import { Panel, PanelHeader } from "../../../shared/ui/Panel";
import { Select } from "../../../shared/ui/Select";
import { StatusBadge } from "../../../shared/ui/StatusBadge";
import { Textarea } from "../../../shared/ui/Textarea";
import { ApiError } from "../../../shared/api/client";
import {
  createDonationItem,
  deleteDonationItem,
  fetchFacilityItems,
  updateDonationItem,
} from "../api/donationItemApi";
import type { Facility } from "../../../entities/facility/model/types";
import {
  ITEM_CATEGORY_LABEL,
  ITEM_STATUS_LABEL,
  type DonationItem,
  type ItemCategory,
  type ItemStatus,
} from "../../../entities/donation-item/model/types";
import { ContributionLedgerDrawer } from "../../contribution-ledger/ui/ContributionLedgerDrawer";

type ItemForm = {
  name: string;
  category: ItemCategory;
  note: string;
  reason: string;
  emoji: string;
  goalAmount: string;
  raisedAmount: string;
  targetQuantity: string;
  status: ItemStatus;
  deadline: string;
  displayOrder: string;
};

const emptyForm: ItemForm = {
  name: "",
  category: "LEARNING",
  note: "",
  reason: "",
  emoji: "",
  goalAmount: "0",
  raisedAmount: "0",
  targetQuantity: "",
  status: "RECRUITING",
  deadline: "",
  displayOrder: "0",
};

const won = (n: number) => n.toLocaleString("ko-KR") + "원";
const pct = (a: number, g: number) => (g > 0 ? Math.min(100, Math.round((a / g) * 100)) : 0);

const itemStatusTone: Record<ItemStatus, "success" | "warning" | "info" | "neutral"> = {
  RECRUITING: "success",
  LOCKED: "neutral",
  BUYING: "warning",
  SHIPPING: "info",
  RECEIVED: "info",
  RECEIPTED: "success",
};

type DonationItemPanelProps = {
  token: string;
  facility: Facility;
  embedded?: boolean;
};

export function DonationItemPanel({ token, facility, embedded = false }: DonationItemPanelProps) {
  const [items, setItems] = useState<DonationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ItemForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [ledgerItem, setLedgerItem] = useState<DonationItem | null>(null);

  const load = () => {
    setLoading(true);
    fetchFacilityItems(facility.id)
      .then((data) => {
        setItems(data);
        setError("");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "물품을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setFormOpen(false);
    load();
    // 시설이 바뀌면 물품 목록을 다시 로드한다.
  }, [facility.id]);

  const openCreate = () => {
    setForm({ ...emptyForm, displayOrder: String(items.length) });
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (it: DonationItem) => {
    setForm({
      name: it.name,
      category: it.category,
      note: it.note ?? "",
      reason: it.reason ?? "",
      emoji: it.emoji ?? "",
      goalAmount: String(it.goalAmount),
      raisedAmount: String(it.raisedAmount),
      targetQuantity: it.targetQuantity == null ? "" : String(it.targetQuantity),
      status: it.status,
      deadline: it.deadline ?? "",
      displayOrder: String(it.displayOrder),
    });
    setEditingId(it.id);
    setFormOpen(true);
  };

  const submit = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category,
        note: form.note.trim(),
        reason: form.reason.trim(),
        emoji: form.emoji.trim(),
        goalAmount: Number(form.goalAmount) || 0,
        raisedAmount: Number(form.raisedAmount) || 0,
        targetQuantity: form.targetQuantity === "" ? null : Number(form.targetQuantity),
        status: form.status,
        deadline: form.deadline === "" ? null : form.deadline,
        displayOrder: Number(form.displayOrder) || 0,
      };
      if (editingId == null) {
        await createDonationItem(token, { facilityId: facility.id, ...payload });
      } else {
        await updateDonationItem(token, editingId, payload);
      }
      setFormOpen(false);
      load();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "물품 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (it: DonationItem) => {
    if (!confirm(`'${it.name}' 물품을 삭제할까요?`)) return;
    try {
      await deleteDonationItem(token, it.id);
      load();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "물품 삭제에 실패했습니다.");
    }
  };

  const content = (
    <>
        <PanelHeader
          title={embedded ? `물품 목록 · ${items.length}종` : `${facility.name} · 후원 물품`}
          description={
            embedded
              ? "선택한 시설의 준비물 목표를 관리합니다."
              : `이 시설의 준비물 목표를 관리합니다. 총 ${items.length}종`
          }
          action={
            <Button size="sm" onClick={openCreate}>
              <Plus size={15} /> 물품 추가
            </Button>
          }
        />

        {error && <p className="text-[13px] font-semibold text-red-600">{error}</p>}
        {loading ? (
          <p className="text-[13px] text-zinc-500">불러오는 중...</p>
        ) : items.length === 0 ? (
          <EmptyState
            title="등록된 물품이 없습니다."
            description="물품 추가로 이 시설의 후원 목표를 등록하세요."
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus size={15} /> 물품 추가
              </Button>
            }
          />
        ) : (
          <DataTable>
            <DataTableHead>
              <tr>
                <DataTableHeaderCell>물품</DataTableHeaderCell>
                <DataTableHeaderCell>카테고리</DataTableHeaderCell>
                <DataTableHeaderCell className="text-right">진행률</DataTableHeaderCell>
                <DataTableHeaderCell>상태</DataTableHeaderCell>
                <DataTableHeaderCell className="text-right">관리</DataTableHeaderCell>
              </tr>
            </DataTableHead>
            <tbody>
              {items.map((it) => (
                <DataTableRow key={it.id}>
                  <DataTableCell>
                    <div className="font-bold text-zinc-900">
                      {it.emoji} {it.name}
                    </div>
                    <div className="text-[11px] text-zinc-400">{it.note}</div>
                  </DataTableCell>
                  <DataTableCell>{ITEM_CATEGORY_LABEL[it.category]}</DataTableCell>
                  <DataTableCell className="text-right">
                    <div className="font-bold text-zinc-900">{pct(it.raisedAmount, it.goalAmount)}%</div>
                    <div className="text-[11px] text-zinc-400">
                      {won(it.raisedAmount)} / {won(it.goalAmount)}
                    </div>
                  </DataTableCell>
                  <DataTableCell>
                    <StatusBadge tone={itemStatusTone[it.status]}>
                      {ITEM_STATUS_LABEL[it.status]}
                    </StatusBadge>
                  </DataTableCell>
                  <DataTableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        title="후원 내역"
                        onClick={() => setLedgerItem(it)}
                      >
                        <ReceiptText size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(it)}>
                        <Pencil size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(it)}>
                        <Trash2 size={14} className="text-red-600" />
                      </Button>
                    </div>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </tbody>
          </DataTable>
        )}
    </>
  );

  return (
    <>
      {embedded ? <div>{content}</div> : <Panel className="mt-4">{content}</Panel>}

      <Drawer
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingId == null ? "물품 추가" : "물품 수정"}
        description={`${facility.name}의 후원 물품 정보를 관리합니다.`}
        footer={
          <>
            <Button size="sm" variant="outline" onClick={() => setFormOpen(false)}>
              취소
            </Button>
            <Button size="sm" onClick={submit} disabled={saving || !form.name.trim()}>
              {editingId == null ? "추가" : "저장"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <FormField label="물품명">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </FormField>
          <FormField label="카테고리">
            <Select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as ItemCategory })}
            >
              {Object.entries(ITEM_CATEGORY_LABEL).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="상태">
            <Select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ItemStatus })}
            >
              {Object.entries(ITEM_STATUS_LABEL).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="수량 메모 (예: 6종·30권)">
            <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </FormField>
          <FormField label="이모지">
            <Input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} />
          </FormField>
          <FormField label="목표금액(원)">
            <Input type="number" value={form.goalAmount} onChange={(e) => setForm({ ...form, goalAmount: e.target.value })} />
          </FormField>
          <FormField label="모인금액(원) · 표시용">
            <Input type="number" value={form.raisedAmount} onChange={(e) => setForm({ ...form, raisedAmount: e.target.value })} />
          </FormField>
          <FormField label="목표수량">
            <Input type="number" value={form.targetQuantity} onChange={(e) => setForm({ ...form, targetQuantity: e.target.value })} />
          </FormField>
          <FormField label="마감일">
            <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </FormField>
          <FormField label="필요한 이유">
            <Textarea
              rows={4}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </FormField>
        </div>
      </Drawer>

      <ContributionLedgerDrawer
        token={token}
        item={ledgerItem}
        onClose={() => setLedgerItem(null)}
      />
    </>
  );
}
