import { useEffect, useMemo, useState } from "react";
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
import {
  Building2,
  CheckCircle2,
  EllipsisVertical,
  GripVertical,
  PackageOpen,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "../../../shared/ui/Button";
import { Checkbox } from "../../../shared/ui/Checkbox";
import {
  DataTable,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
} from "../../../shared/ui/DataTable";
import { Drawer } from "../../../shared/ui/Drawer";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { FormField } from "../../../shared/ui/FormField";
import { Input } from "../../../shared/ui/Input";
import { Panel, PanelHeader } from "../../../shared/ui/Panel";
import { SearchInput } from "../../../shared/ui/SearchInput";
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
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FacilityStatus | "ALL">("ALL");
  const [typeFilter, setTypeFilter] = useState<FacilityType | "ALL">("ALL");
  const [verifiedFilter, setVerifiedFilter] = useState<"ALL" | "VERIFIED" | "UNVERIFIED">("ALL");
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

  const statusCounts = useMemo(
    () =>
      Object.keys(FACILITY_STATUS_LABEL).reduce(
        (acc, status) => ({
          ...acc,
          [status]: facilities.filter((facility) => facility.status === status).length,
        }),
        {} as Record<FacilityStatus, number>,
      ),
    [facilities],
  );

  const visibleFacilities = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return facilities.filter((facility) => {
      if (statusFilter !== "ALL" && facility.status !== statusFilter) return false;
      if (typeFilter !== "ALL" && facility.type !== typeFilter) return false;
      if (verifiedFilter === "VERIFIED" && !facility.verified) return false;
      if (verifiedFilter === "UNVERIFIED" && facility.verified) return false;
      if (keyword) {
        const haystack = [
          facility.name,
          facility.code,
          facility.region ?? "",
          FACILITY_TYPE_LABEL[facility.type],
          FACILITY_STATUS_LABEL[facility.status],
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }
      return true;
    });
  }, [facilities, query, statusFilter, typeFilter, verifiedFilter]);

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setVerifiedFilter("ALL");
  };

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
      <section className="workspace-hero dense">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="workspace-hero-mark">
            <Building2 size={22} />
          </div>
          <div className="workspace-hero-copy">
            <p className="eyebrow">DonationPlatform Admin</p>
            <h1>시설 관리</h1>
            <p>후원 대상 시설과 시설별 후원 물품을 등록·수정·삭제합니다. 시설을 선택하면 물품을 관리할 수 있어요.</p>
          </div>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 xl:max-w-[520px] xl:grid-cols-4">
          <FacilityMetric label="전체" value={`${facilities.length}곳`} />
          <FacilityMetric label="모집중" value={`${statusCounts.RECRUITING ?? 0}곳`} tone="success" />
          <FacilityMetric label="구매중" value={`${statusCounts.BUYING ?? 0}곳`} tone="warning" />
          <FacilityMetric label="배송중" value={`${statusCounts.SHIPPING ?? 0}곳`} tone="info" />
        </div>
      </section>

      <Panel>
        <PanelHeader
          title={`시설 목록 · ${visibleFacilities.length}곳`}
          description={`전체 ${facilities.length}곳 중 현재 조건에 맞는 시설입니다.`}
          action={
            <Button size="sm" onClick={openCreate}>
              <Plus size={15} /> 시설 추가
            </Button>
          }
        />

        <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(260px,1fr)_160px_170px_170px_auto]">
          <SearchInput
            value={query}
            placeholder="시설명·코드·지역 검색"
            onChange={(e) => setQuery(e.target.value)}
            onClear={() => setQuery("")}
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as FacilityStatus | "ALL")}
            className="h-10 text-[13px] font-semibold"
          >
            <option value="ALL">전체 상태</option>
            {Object.entries(FACILITY_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as FacilityType | "ALL")}
            className="h-10 text-[13px] font-semibold"
          >
            <option value="ALL">전체 유형</option>
            {Object.entries(FACILITY_TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value as "ALL" | "VERIFIED" | "UNVERIFIED")}
            className="h-10 text-[13px] font-semibold"
          >
            <option value="ALL">자격 전체</option>
            <option value="VERIFIED">자격확인</option>
            <option value="UNVERIFIED">미확인</option>
          </Select>
          <Button size="sm" variant="outline" className="h-10 px-3" onClick={clearFilters}>
            초기화
          </Button>
        </div>

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
        ) : visibleFacilities.length === 0 ? (
          <EmptyState
            title="조건에 맞는 시설이 없습니다."
            description="검색어나 필터를 조정해 다시 확인하세요."
            action={
              <Button size="sm" variant="outline" onClick={clearFilters}>
                필터 초기화
              </Button>
            }
          />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorder}>
            <SortableContext items={visibleFacilities.map((facility) => facility.id)} strategy={verticalListSortingStrategy}>
              <DataTable>
                <DataTableHead>
                  <tr>
                    <DataTableHeaderCell className="w-12 px-3" aria-label="순서 변경" />
                    <DataTableHeaderCell>시설</DataTableHeaderCell>
                    <DataTableHeaderCell className="w-36">상태</DataTableHeaderCell>
                    <DataTableHeaderCell className="w-28">노출 순서</DataTableHeaderCell>
                    <DataTableHeaderCell className="text-right">관리</DataTableHeaderCell>
                  </tr>
                </DataTableHead>
                <tbody className={ordering ? "opacity-70" : undefined}>
                  {visibleFacilities.map((f) => (
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

      <Drawer
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected ? `${selected.name} · 후원 물품` : "후원 물품"}
        description="시설 목록을 닫지 않고 선택한 시설의 준비물 목표를 관리합니다."
        className="w-[760px]"
      >
        {selected ? <DonationItemPanel token={token} facility={selected} embedded /> : null}
      </Drawer>

      <Drawer
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingId == null ? "시설 추가" : "시설 수정"}
        description={editingId == null ? "후원 대상 시설의 기본 정보를 등록합니다." : "선택한 시설의 운영 정보를 수정합니다."}
        footer={
          <>
            <Button size="sm" variant="outline" onClick={() => setFormOpen(false)}>
              취소
            </Button>
            <Button size="sm" onClick={submit} disabled={saving || !form.name.trim() || (editingId == null && !form.code.trim())}>
              {editingId == null ? "추가" : "저장"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
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
          <FormField label="소개 (아동 개인정보 미포함)">
            <Textarea
              rows={4}
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
      </Drawer>
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
      <DataTableCell className="w-12 px-3 py-2.5 align-middle">
        <button
          type="button"
          className={cn(
            "grid size-8 cursor-grab place-items-center rounded-md border border-transparent bg-transparent text-zinc-400 transition-colors",
            "hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-600 focus-visible:border-zinc-300 focus-visible:bg-zinc-50 focus-visible:text-zinc-600 focus-visible:outline-none",
            isDragging && "cursor-grabbing border-zinc-300 bg-zinc-50 text-zinc-700 shadow-sm",
          )}
          aria-label={`${facility.name} 순서 변경`}
          onClick={(e) => e.stopPropagation()}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={15} strokeWidth={1.75} />
        </button>
      </DataTableCell>
      <DataTableCell className="py-3 pl-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
            {facility.avatarInitial || facility.name.charAt(0)}
          </span>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2 font-bold text-zinc-900">
              <span className="min-w-0 truncate">{facility.name}</span>
              {facility.verified && <CheckCircle2 size={14} className="shrink-0 text-sky-600" />}
            </div>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-semibold text-zinc-500">
              <span className="truncate">{facility.region || "지역 미정"}</span>
              <span className="text-zinc-300">·</span>
              <span>{FACILITY_TYPE_LABEL[facility.type]}</span>
              <span className="text-zinc-300">·</span>
              <span className="font-mono text-[11px] text-zinc-400">{facility.code}</span>
            </div>
          </div>
        </div>
      </DataTableCell>
      <DataTableCell>
        <StatusBadge tone={facilityStatusTone[facility.status]}>
          {FACILITY_STATUS_LABEL[facility.status]}
        </StatusBadge>
      </DataTableCell>
      <DataTableCell>
        <span className="font-mono text-[12px] font-bold text-zinc-500">
          #{facility.displayOrder + 1}
        </span>
      </DataTableCell>
      <DataTableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end gap-1.5">
          <Button size="sm" variant="outline" onClick={onSelect}>
            <PackageOpen size={14} /> 물품 관리
          </Button>
          <details className="group relative">
            <summary
              className={cn(
                "grid h-8 w-8 cursor-pointer list-none place-items-center rounded-lg border border-transparent text-zinc-500 transition-colors",
                "hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20",
                "[&::-webkit-details-marker]:hidden",
              )}
              aria-label={`${facility.name} 추가 작업`}
            >
              <EllipsisVertical size={15} />
            </summary>
            <div className="absolute right-0 top-9 z-20 min-w-28 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-full justify-start px-2"
                onClick={onEdit}
              >
                <Pencil size={13} /> 수정
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-full justify-start px-2 text-red-600 hover:bg-red-50"
                onClick={onRemove}
              >
                <Trash2 size={13} /> 삭제
              </Button>
            </div>
          </details>
        </div>
      </DataTableCell>
    </tr>
  );
}

function FacilityMetric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "success" | "warning" | "info";
}) {
  const toneClass = {
    neutral: "bg-white text-zinc-900 ring-zinc-200",
    success: "bg-emerald-50 text-emerald-800 ring-emerald-100",
    warning: "bg-amber-50 text-amber-800 ring-amber-100",
    info: "bg-sky-50 text-sky-800 ring-sky-100",
  }[tone];

  return (
    <div className={cn("rounded-xl px-3 py-2 ring-1", toneClass)}>
      <p className="text-[11px] font-extrabold opacity-70">{label}</p>
      <p className="mt-0.5 text-[18px] font-black tracking-tight">{value}</p>
    </div>
  );
}
