import { useEffect, useMemo, useState } from "react";
import { KeyRound, Pencil, Plus, Trash2 } from "lucide-react";
import type { Permission, PermissionCategory } from "../../../entities/permission/model/types";
import { ApiError } from "../../../shared/api/client";
import { Button } from "../../../shared/ui/Button";
import { DataTable, DataTableCell, DataTableHead, DataTableHeaderCell, DataTableRow } from "../../../shared/ui/DataTable";
import { Drawer } from "../../../shared/ui/Drawer";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { FormField } from "../../../shared/ui/FormField";
import { Input } from "../../../shared/ui/Input";
import { Panel, PanelHeader } from "../../../shared/ui/Panel";
import { SearchInput } from "../../../shared/ui/SearchInput";
import { Select } from "../../../shared/ui/Select";
import { StatusBadge } from "../../../shared/ui/StatusBadge";
import { Textarea } from "../../../shared/ui/Textarea";
import {
  createPermission,
  deletePermission,
  fetchPermissionCategories,
  fetchPermissions,
  updatePermission,
} from "../api/permissionApi";

type PermissionForm = { code: string; name: string; description: string; categoryCode: string };
const emptyForm: PermissionForm = { code: "", name: "", description: "", categoryCode: "" };
const CODE_PATTERN = /^[A-Z][A-Z0-9_]*$/;

export function PermissionManagementScreen({ token }: { token: string }) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [categories, setCategories] = useState<PermissionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PermissionForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([fetchPermissions(token), fetchPermissionCategories(token)])
      .then(([nextPermissions, nextCategories]) => {
        setPermissions(nextPermissions);
        setCategories(nextCategories);
        setError("");
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "권한을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const visiblePermissions = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    return permissions
      .filter((permission) => categoryFilter === "all" || permission.category?.code === categoryFilter)
      .filter((permission) => !query || [permission.code, permission.name, permission.description ?? ""]
        .some((value) => value.toLowerCase().includes(query)))
      .sort((a, b) => (a.category?.name ?? "").localeCompare(b.category?.name ?? "", "ko") || a.name.localeCompare(b.name, "ko"));
  }, [categoryFilter, keyword, permissions]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, categoryCode: categories[0]?.code ?? "" });
    setFormOpen(true);
  };

  const openEdit = (permission: Permission) => {
    setEditingId(permission.id);
    setForm({
      code: permission.code,
      name: permission.name,
      description: permission.description ?? "",
      categoryCode: permission.category?.code ?? categories[0]?.code ?? "",
    });
    setFormOpen(true);
  };

  const normalizedCode = form.code.trim().toUpperCase();
  const codeError = editingId != null || !normalizedCode || CODE_PATTERN.test(normalizedCode)
    ? ""
    : "대문자·숫자·언더스코어만 사용할 수 있습니다. (예: FACILITY_READ)";
  const canSubmit = Boolean(form.name.trim() && form.categoryCode && (editingId != null || (normalizedCode && !codeError)));

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    const body = { name: form.name.trim(), description: form.description.trim(), categoryCode: form.categoryCode };
    try {
      if (editingId == null) await createPermission(token, { ...body, code: normalizedCode });
      else await updatePermission(token, editingId, body);
      setFormOpen(false);
      load();
    } catch (reason) {
      alert(reason instanceof ApiError ? reason.message : "권한 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (permission: Permission) => {
    if (!confirm(`'${permission.name}' 권한을 삭제할까요? 역할에 연결된 권한은 삭제되지 않을 수 있습니다.`)) return;
    try {
      await deletePermission(token, permission.id);
      load();
    } catch (reason) {
      alert(reason instanceof ApiError ? reason.message : "권한 삭제에 실패했습니다.");
    }
  };

  return (
    <main className="workspace-page space-y-5">
      <section className="workspace-hero dense">
        <div className="workspace-hero-mark"><KeyRound size={22} /></div>
        <div className="workspace-hero-copy">
          <p className="eyebrow">DonationPlatform Admin</p>
          <h1>권한 관리</h1>
          <p>역할에 연결할 세부 권한 코드를 등록하고 업무 영역별로 관리합니다.</p>
        </div>
      </section>

      <Panel>
        <PanelHeader
          title={`권한 목록 · ${visiblePermissions.length}개`}
          className="items-center"
          action={
            <div className="flex items-center gap-2">
              <Select
                className="h-9 w-40 text-[13px]"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                aria-label="권한 카테고리 필터"
              >
                <option value="all">전체 카테고리</option>
                {categories.map((category) => <option key={category.id} value={category.code}>{category.name}</option>)}
              </Select>
              <SearchInput
                className="w-56"
                value={keyword}
                placeholder="코드·이름 검색"
                onChange={(event) => setKeyword(event.target.value)}
                onClear={() => setKeyword("")}
              />
              <Button size="sm" onClick={openCreate} disabled={categories.length === 0}>
                <Plus size={15} /> 권한 추가
              </Button>
            </div>
          }
        />

        {error && <p className="text-[13px] font-semibold text-red-600">{error}</p>}
        {loading ? (
          <p className="text-[13px] text-zinc-500">불러오는 중...</p>
        ) : visiblePermissions.length === 0 ? (
          <EmptyState
            title={keyword || categoryFilter !== "all" ? "검색 결과가 없습니다." : "등록된 권한이 없습니다."}
            description={keyword || categoryFilter !== "all" ? "검색어나 카테고리를 변경해 보세요." : "권한 추가로 세부 권한을 등록하세요."}
            action={categories.length > 0 && !keyword && categoryFilter === "all" ? <Button size="sm" onClick={openCreate}><Plus size={15} /> 권한 추가</Button> : undefined}
          />
        ) : (
          <DataTable>
            <DataTableHead>
              <tr>
                <DataTableHeaderCell>권한</DataTableHeaderCell>
                <DataTableHeaderCell>코드</DataTableHeaderCell>
                <DataTableHeaderCell className="w-44">카테고리</DataTableHeaderCell>
                <DataTableHeaderCell className="w-28" align="center">관리</DataTableHeaderCell>
              </tr>
            </DataTableHead>
            <tbody>
              {visiblePermissions.map((permission) => (
                <DataTableRow key={permission.id}>
                  <DataTableCell className="py-2.5">
                    <div className="font-bold text-zinc-900">{permission.name}</div>
                    {permission.description && <div className="mt-0.5 text-[12px] text-zinc-500">{permission.description}</div>}
                  </DataTableCell>
                  <DataTableCell><code className="rounded-md bg-zinc-50 px-1.5 py-0.5 text-[12px] text-zinc-600">{permission.code}</code></DataTableCell>
                  <DataTableCell>{permission.category ? <StatusBadge>{permission.category.name}</StatusBadge> : <span className="text-zinc-400">미분류</span>}</DataTableCell>
                  <DataTableCell align="center">
                    <div className="flex justify-center gap-1">
                      <Button size="sm" variant="ghost" title="권한 수정" onClick={() => openEdit(permission)}><Pencil size={14} /></Button>
                      <Button size="sm" variant="ghost" title="권한 삭제" onClick={() => remove(permission)}><Trash2 size={14} className="text-red-600" /></Button>
                    </div>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </tbody>
          </DataTable>
        )}
      </Panel>

      <Drawer
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingId == null ? "권한 추가" : "권한 수정"}
        description={editingId == null ? "역할에 연결할 권한 코드를 만듭니다. 코드는 등록 후 변경할 수 없습니다." : "권한의 이름, 설명과 카테고리를 수정합니다."}
        footer={<><Button size="sm" variant="outline" onClick={() => setFormOpen(false)}>취소</Button><Button size="sm" disabled={saving || !canSubmit} onClick={submit}>{editingId == null ? "추가" : "저장"}</Button></>}
      >
        <div className="grid gap-4">
          <FormField label="코드" hint={editingId == null ? "대문자·숫자·언더스코어. 예: FACILITY_READ" : "코드는 변경할 수 없습니다."} error={codeError}>
            <Input value={form.code} disabled={editingId != null} placeholder="FACILITY_READ" onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} />
          </FormField>
          <FormField label="이름"><Input value={form.name} placeholder="시설 조회" onChange={(event) => setForm({ ...form, name: event.target.value })} /></FormField>
          <FormField label="카테고리">
            <Select value={form.categoryCode} onChange={(event) => setForm({ ...form, categoryCode: event.target.value })}>
              <option value="" disabled>카테고리 선택</option>
              {categories.map((category) => <option key={category.id} value={category.code}>{category.name}</option>)}
            </Select>
          </FormField>
          <FormField label="설명" hint="이 권한이 허용하는 작업을 한 줄로 적어주세요."><Textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></FormField>
        </div>
      </Drawer>
    </main>
  );
}
