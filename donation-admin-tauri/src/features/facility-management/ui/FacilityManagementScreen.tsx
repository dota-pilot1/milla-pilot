import { useEffect, useState } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Building2, CheckCircle2, GripVertical, PackageOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "../../../shared/ui/Button";
import { Checkbox } from "../../../shared/ui/Checkbox";
import {
  DataTable,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
} from "../../../shared/ui/DataTable";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { FormField } from "../../../shared/ui/FormField";
import { FormSection } from "../../../shared/ui/FormSection";
import { Input } from "../../../shared/ui/Input";
import { Panel, PanelHeader } from "../../../shared/ui/Panel";
import { Select } from "../../../shared/ui/Select";
import { StatusBadge } from "../../../shared/ui/StatusBadge";
import { Textarea } from "../../../shared/ui/Textarea";
import { ApiError } from "../../../shared/api/client";
import {
  createFacility,
  deleteFacility,
  fetchFacilities,
  updateFacility,
} from "../api/facilityApi";
import {
  FACILITY_STATUS_LABEL,
  FACILITY_TYPE_LABEL,
  type Facility,
  type FacilityStatus,
  type FacilityType,
  type UpdateFacilityInput,
} from "../../../entities/facility/model/types";
import { DonationItemPanel } from "../../donation-item-management/ui/DonationItemPanel";
import { cn } from "../../../shared/lib/cn";

type FacilityForm = {
  code: string;
  name: string;
  region: string;
  type: FacilityType;
  description: string;
  status: FacilityStatus;
  verified: boolean;
  avatarInitial: string;
  displayOrder: string;
};

const emptyForm: FacilityForm = {
  code: "",
  name: "",
  region: "",
  type: "ORPHANAGE",
  description: "",
  status: "RECRUITING",
  verified: true,
  avatarInitial: "",
  displayOrder: "0",
};

const facilityStatusTone: Record<FacilityStatus, "success" | "warning" | "info"> = {
  RECRUITING: "success",
  BUYING: "warning",
  SHIPPING: "info",
};

const toUpdateInput = (facility: Facility, displayOrder = facility.displayOrder): UpdateFacilityInput => ({
  name: facility.name,
  region: facility.region ?? "",
  type: facility.type,
  description: facility.description ?? "",
  status: facility.status,
  verified: facility.verified,
  avatarInitial: facility.avatarInitial ?? "",
  displayOrder,
});

export function FacilityManagementScreen({ token }: { token: string }) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Facility | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FacilityForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const load = () => {
    setLoading(true);
    fetchFacilities()
      .then((data) => {
        setFacilities(data);
        setError("");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "시설을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm({ ...emptyForm, displayOrder: String(facilities.length) });
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (f: Facility) => {
    setForm({
      code: f.code,
      name: f.name,
      region: f.region ?? "",
      type: f.type,
      description: f.description ?? "",
      status: f.status,
      verified: f.verified,
      avatarInitial: f.avatarInitial ?? "",
      displayOrder: String(f.displayOrder),
    });
    setEditingId(f.id);
    setFormOpen(true);
  };

  const submit = async () => {
    setSaving(true);
    try {
      const base = {
        name: form.name.trim(),
        region: form.region.trim(),
        type: form.type,
        description: form.description.trim(),
        status: form.status,
        verified: form.verified,
        avatarInitial: form.avatarInitial.trim(),
        displayOrder: Number(form.displayOrder) || 0,
      };
      if (editingId == null) {
        await createFacility(token, { code: form.code.trim(), ...base });
      } else {
        await updateFacility(token, editingId, base);
      }
      setFormOpen(false);
      load();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "시설 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (f: Facility) => {
    if (!confirm(`'${f.name}' 시설과 소속 물품을 모두 삭제할까요?`)) return;
    try {
      await deleteFacility(token, f.id);
      if (selected?.id === f.id) setSelected(null);
      load();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "시설 삭제에 실패했습니다.");
    }
  };

  const reorder = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id || ordering) return;

    const oldIndex = facilities.findIndex((facility) => facility.id === active.id);
    const newIndex = facilities.findIndex((facility) => facility.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const previous = facilities;
    const next = arrayMove(facilities, oldIndex, newIndex).map((facility, index) => ({
      ...facility,
      displayOrder: index,
    }));

    setFacilities(next);
    setOrdering(true);
    try {
      const changed = next.filter((facility, index) => previous[index]?.id !== facility.id || previous[index]?.displayOrder !== facility.displayOrder);
      await Promise.all(changed.map((facility) => updateFacility(token, facility.id, toUpdateInput(facility))));
    } catch (e) {
      setFacilities(previous);
      alert(e instanceof ApiError ? e.message : "시설 순서 저장에 실패했습니다.");
    } finally {
      setOrdering(false);
    }
  };

  return (
    <main className="workspace-page space-y-5">
      <section className="workspace-hero">
        <div className="workspace-hero-mark">
          <Building2 size={26} />
        </div>
        <p className="eyebrow">DonationPlatform Admin</p>
        <h1>시설 관리</h1>
        <p>후원 대상 시설과 시설별 후원 물품을 등록·수정·삭제합니다. 시설을 선택하면 물품을 관리할 수 있어요.</p>
      </section>

      <Panel>
        <PanelHeader
          title={`시설 목록 · ${facilities.length}곳`}
          action={
            <Button size="sm" onClick={openCreate}>
              <Plus size={15} /> 시설 추가
            </Button>
          }
        />

        {formOpen && (
          <FormSection>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="코드 (slug)">
                <Input
                  value={form.code}
                  disabled={editingId != null}
                  placeholder="haetsal"
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </FormField>
              <FormField label="시설명">
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </FormField>
              <FormField label="지역">
                <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
              </FormField>
              <FormField label="유형">
                <Select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as FacilityType })}
                >
                  {Object.entries(FACILITY_TYPE_LABEL).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="상태">
                <Select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as FacilityStatus })}
                >
                  {Object.entries(FACILITY_STATUS_LABEL).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="카드 이니셜">
                <Input maxLength={4} value={form.avatarInitial} onChange={(e) => setForm({ ...form, avatarInitial: e.target.value })} />
              </FormField>
              <FormField label="소개 (아동 개인정보 미포함)" className="md:col-span-2">
                <Textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </FormField>
              <label className="flex items-center gap-2 text-[13px] text-zinc-700">
                <Checkbox
                  checked={form.verified}
                  onChange={(e) => setForm({ ...form, verified: e.target.checked })}
                />
                자격확인 완료
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button size="sm" onClick={submit} disabled={saving || !form.name.trim() || (editingId == null && !form.code.trim())}>
                {editingId == null ? "추가" : "저장"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setFormOpen(false)}>
                취소
              </Button>
            </div>
          </FormSection>
        )}

        {error && <p className="text-[13px] font-semibold text-red-600">{error}</p>}
        {loading ? (
          <p className="text-[13px] text-zinc-500">불러오는 중...</p>
        ) : facilities.length === 0 ? (
          <EmptyState
            title="등록된 시설이 없습니다."
            description="시설 추가로 후원 대상 시설을 먼저 등록하세요."
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus size={15} /> 시설 추가
              </Button>
            }
          />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorder}>
            <SortableContext items={facilities.map((facility) => facility.id)} strategy={verticalListSortingStrategy}>
              <DataTable>
                <DataTableHead>
                  <tr>
                    <DataTableHeaderCell>시설</DataTableHeaderCell>
                    <DataTableHeaderCell>지역 · 유형</DataTableHeaderCell>
                    <DataTableHeaderCell>상태</DataTableHeaderCell>
                    <DataTableHeaderCell className="text-right">관리</DataTableHeaderCell>
                  </tr>
                </DataTableHead>
                <tbody className={ordering ? "opacity-70" : undefined}>
                  {facilities.map((f) => (
                    <SortableFacilityRow
                      key={f.id}
                      facility={f}
                      selected={selected?.id === f.id}
                      onSelect={() => setSelected(f)}
                      onEdit={() => openEdit(f)}
                      onRemove={() => remove(f)}
                    />
                  ))}
                </tbody>
              </DataTable>
            </SortableContext>
          </DndContext>
        )}
      </Panel>

      {selected && <DonationItemPanel token={token} facility={selected} />}
    </main>
  );
}

type SortableFacilityRowProps = {
  facility: Facility;
  selected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onRemove: () => void;
};

function SortableFacilityRow({ facility, selected, onSelect, onEdit, onRemove }: SortableFacilityRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: facility.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-pointer border-t border-zinc-100 transition-colors",
        selected && "bg-zinc-50",
        isDragging && "relative z-10 bg-white shadow-lg",
      )}
      onClick={onSelect}
    >
      <DataTableCell>
        <div className="flex items-center gap-2 font-bold text-zinc-900">
          <button
            type="button"
            className={cn(
              "-ml-1 grid h-7 w-5 shrink-0 cursor-grab place-items-center rounded-md text-zinc-300 transition-colors",
              "hover:bg-zinc-100 hover:text-zinc-600 focus-visible:bg-zinc-100 focus-visible:text-zinc-700 focus-visible:outline-none",
              isDragging && "cursor-grabbing bg-zinc-100 text-zinc-700",
            )}
            aria-label={`${facility.name} 순서 변경`}
            onClick={(e) => e.stopPropagation()}
            {...attributes}
            {...listeners}
          >
            <GripVertical size={14} />
          </button>
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
            {facility.avatarInitial || facility.name.charAt(0)}
          </span>
          {facility.name}
          {facility.verified && <CheckCircle2 size={14} className="text-sky-600" />}
        </div>
      </DataTableCell>
      <DataTableCell>
        {facility.region} · {FACILITY_TYPE_LABEL[facility.type]}
      </DataTableCell>
      <DataTableCell>
        <StatusBadge tone={facilityStatusTone[facility.status]}>
          {FACILITY_STATUS_LABEL[facility.status]}
        </StatusBadge>
      </DataTableCell>
      <DataTableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={onSelect}>
            <PackageOpen size={14} /> 물품
          </Button>
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Pencil size={14} />
          </Button>
          <Button size="sm" variant="ghost" onClick={onRemove}>
            <Trash2 size={14} className="text-red-600" />
          </Button>
        </div>
      </DataTableCell>
    </tr>
  );
}
