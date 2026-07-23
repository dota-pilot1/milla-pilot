import { useEffect, useMemo, useRef, useState } from "react";
import { KeyRound, Lock, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "../../../shared/ui/Button";
import {
  DataTable,
  DataTableCell,
  DataTableHead,
  DataTableHeaderCell,
  DataTableRow,
  DataTableSortableHeaderCell,
} from "../../../shared/ui/DataTable";
import { Checkbox } from "../../../shared/ui/Checkbox";
import { Drawer } from "../../../shared/ui/Drawer";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { FormField } from "../../../shared/ui/FormField";
import { Input } from "../../../shared/ui/Input";
import { Panel, PanelHeader } from "../../../shared/ui/Panel";
import { SearchInput } from "../../../shared/ui/SearchInput";
import { StatusBadge } from "../../../shared/ui/StatusBadge";
import { Textarea } from "../../../shared/ui/Textarea";
import { ApiError } from "../../../shared/api/client";
import { createRole, deleteRole, fetchRoles, updateRole } from "../api/roleApi";
import { ROLE_CODE_PATTERN, type Role } from "../../../entities/role/model/types";

type RoleForm = {
  code: string;
  name: string;
  description: string;
};

const emptyForm: RoleForm = { code: "ROLE_", name: "", description: "" };

type RoleSortKey = "name" | "code" | "permissions" | "type";
type SortDirection = "asc" | "desc";

export function RoleManagementScreen({ token }: { token: string }) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<RoleForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sortKey, setSortKey] = useState<RoleSortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const selectAllRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    fetchRoles(token)
      .then((data) => {
        setRoles(data);
        setError("");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "롤을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const visibleRoles = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    const filtered = q ? roles.filter((role) =>
      [role.code, role.name, role.description ?? ""].some((field) => field.toLowerCase().includes(q)),
    ) : roles;

    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortKey === "name") comparison = a.name.localeCompare(b.name, "ko");
      if (sortKey === "code") comparison = a.code.localeCompare(b.code, "en");
      if (sortKey === "permissions") comparison = a.permissions.length - b.permissions.length;
      if (sortKey === "type") comparison = Number(b.systemRole) - Number(a.systemRole);
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [keyword, roles, sortDirection, sortKey]);

  const selectableIds = useMemo(
    () => visibleRoles.filter((role) => !role.systemRole).map((role) => role.id),
    [visibleRoles],
  );
  const selectedVisibleCount = selectableIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleSelected = selectableIds.length > 0 && selectedVisibleCount === selectableIds.length;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedVisibleCount > 0 && !allVisibleSelected;
    }
  }, [allVisibleSelected, selectedVisibleCount]);

  useEffect(() => {
    const visibleIds = new Set(selectableIds);
    setSelectedIds((current) => new Set([...current].filter((id) => visibleIds.has(id))));
  }, [selectableIds]);

  const toggleSort = (key: RoleSortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => current === "asc" ? "desc" : "asc");
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  };

  const sortFor = (key: RoleSortKey) => sortKey === key ? sortDirection : null;

  const toggleAllVisible = () => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected) selectableIds.forEach((id) => next.delete(id));
      else selectableIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const toggleSelected = (id: number) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setFormOpen(true);
  };

  const openEdit = (role: Role) => {
    setForm({ code: role.code, name: role.name, description: role.description ?? "" });
    setEditingId(role.id);
    setFormOpen(true);
  };

  const code = form.code.trim().toUpperCase();
  const codeError = editingId != null || !code || ROLE_CODE_PATTERN.test(code)
    ? ""
    : "ROLE_ 로 시작하고 대문자·숫자·언더스코어만 사용합니다. (예: ROLE_FACILITY_MANAGER)";
  const canSubmit = Boolean(form.name.trim()) && (editingId != null || (Boolean(code) && !codeError));

  const submit = async () => {
    setSaving(true);
    try {
      const description = form.description.trim();
      if (editingId == null) {
        await createRole(token, { code, name: form.name.trim(), description });
      } else {
        await updateRole(token, editingId, { name: form.name.trim(), description });
      }
      setFormOpen(false);
      load();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "롤 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (role: Role) => {
    if (!confirm(`'${role.name}' 롤을 삭제할까요? 이 롤을 쓰는 계정이 있으면 삭제되지 않습니다.`)) return;
    try {
      await deleteRole(token, role.id);
      load();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "롤 삭제에 실패했습니다.");
    }
  };

  const removeSelected = async () => {
    const targets = roles.filter((role) => selectedIds.has(role.id) && !role.systemRole);
    if (
      targets.length === 0
      || !confirm(`선택한 사용자 정의 롤 ${targets.length}개를 삭제할까요? 사용 중인 롤은 삭제되지 않습니다.`)
    ) return;

    const results = await Promise.allSettled(targets.map((role) => deleteRole(token, role.id)));
    const failedIds = new Set(
      targets.filter((_, index) => results[index].status === "rejected").map((role) => role.id),
    );
    setSelectedIds(failedIds);
    load();
    if (failedIds.size > 0) {
      alert(
        `${targets.length - failedIds.size}개를 삭제했고, 사용 중이거나 삭제할 수 없는 ${failedIds.size}개는 남겨두었습니다.`,
      );
    }
  };

  return (
    <main className="workspace-page space-y-5">
      <section className="workspace-hero dense">
        <div className="workspace-hero-mark">
          <ShieldCheck size={22} />
        </div>
        <div className="workspace-hero-copy">
          <p className="eyebrow">DonationPlatform Admin</p>
          <h1>롤 관리</h1>
          <p>
            계정에 부여할 역할(롤)을 등록·수정·삭제합니다. 롤에 실제 권한을 붙이는 작업은 역할-권한 매핑에서
            처리합니다.
          </p>
        </div>
      </section>

      <Panel>
        <PanelHeader
          title={`롤 목록 · ${visibleRoles.length}개`}
          className="items-center"
          action={
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <Button size="sm" variant="outline" onClick={removeSelected}>
                  <Trash2 size={14} className="text-red-600" /> 선택 삭제 ({selectedIds.size})
                </Button>
              )}
              <SearchInput
                className="w-56"
                value={keyword}
                placeholder="코드·이름 검색"
                onChange={(e) => setKeyword(e.target.value)}
                onClear={() => setKeyword("")}
              />
              <Button size="sm" onClick={openCreate}>
                <Plus size={15} /> 롤 추가
              </Button>
            </div>
          }
        />

        {error && <p className="text-[13px] font-semibold text-red-600">{error}</p>}
        {loading ? (
          <p className="text-[13px] text-zinc-500">불러오는 중...</p>
        ) : visibleRoles.length === 0 ? (
          <EmptyState
            title={keyword ? "검색 결과가 없습니다." : "등록된 롤이 없습니다."}
            description={keyword ? "다른 코드나 이름으로 검색해 보세요." : "롤 추가로 역할을 먼저 등록하세요."}
            action={
              keyword ? undefined : (
                <Button size="sm" onClick={openCreate}>
                  <Plus size={15} /> 롤 추가
                </Button>
              )
            }
          />
        ) : (
          <DataTable>
            <DataTableHead>
              <tr>
                <DataTableHeaderCell className="w-14 px-3" align="center">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      ref={selectAllRef}
                      checked={allVisibleSelected}
                      disabled={selectableIds.length === 0}
                      aria-label="검색 결과의 사용자 정의 롤 전체 선택"
                      onChange={toggleAllVisible}
                    />
                  </div>
                </DataTableHeaderCell>
                <DataTableSortableHeaderCell direction={sortFor("name")} onSort={() => toggleSort("name")}>
                  롤
                </DataTableSortableHeaderCell>
                <DataTableSortableHeaderCell direction={sortFor("code")} onSort={() => toggleSort("code")}>
                  코드
                </DataTableSortableHeaderCell>
                <DataTableSortableHeaderCell
                  direction={sortFor("permissions")}
                  onSort={() => toggleSort("permissions")}
                >
                  권한
                </DataTableSortableHeaderCell>
                <DataTableSortableHeaderCell direction={sortFor("type")} onSort={() => toggleSort("type")}>
                  구분
                </DataTableSortableHeaderCell>
                <DataTableHeaderCell className="w-28" align="center">관리</DataTableHeaderCell>
              </tr>
            </DataTableHead>
            <tbody>
              {visibleRoles.map((role) => (
                <DataTableRow key={role.id} selected={selectedIds.has(role.id)}>
                  <DataTableCell className="w-14 px-3" align="center">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={selectedIds.has(role.id)}
                        disabled={role.systemRole}
                        aria-label={`${role.name} 선택`}
                        title={role.systemRole ? "시스템 롤은 삭제할 수 없습니다." : undefined}
                        onChange={() => toggleSelected(role.id)}
                      />
                    </div>
                  </DataTableCell>
                  <DataTableCell className="py-2.5">
                    <div className="font-bold text-zinc-900">{role.name}</div>
                    {role.description && (
                      <div className="mt-0.5 text-[12px] text-zinc-500">{role.description}</div>
                    )}
                  </DataTableCell>
                  <DataTableCell>
                    <code className="rounded-md bg-zinc-50 px-1.5 py-0.5 text-[12px] text-zinc-600">
                      {role.code}
                    </code>
                  </DataTableCell>
                  <DataTableCell>
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-zinc-600">
                      <KeyRound size={14} className="text-zinc-400" />
                      {role.permissions.length}개
                    </span>
                  </DataTableCell>
                  <DataTableCell>
                    {role.systemRole ? (
                      <StatusBadge tone="info">
                        <Lock size={11} className="mr-1" /> 시스템
                      </StatusBadge>
                    ) : (
                      <StatusBadge>사용자 정의</StatusBadge>
                    )}
                  </DataTableCell>
                  <DataTableCell align="center">
                    <div className="flex justify-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={role.systemRole}
                        title={role.systemRole ? "시스템 롤은 수정할 수 없습니다." : undefined}
                        onClick={() => openEdit(role)}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={role.systemRole}
                        title={role.systemRole ? "시스템 롤은 삭제할 수 없습니다." : undefined}
                        onClick={() => remove(role)}
                      >
                        <Trash2 size={14} className={role.systemRole ? undefined : "text-red-600"} />
                      </Button>
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
        title={editingId == null ? "롤 추가" : "롤 수정"}
        description={
          editingId == null
            ? "계정에 부여할 역할을 새로 만듭니다. 코드는 등록 후 변경할 수 없습니다."
            : "선택한 롤의 이름과 설명을 수정합니다."
        }
        footer={
          <>
            <Button size="sm" variant="outline" onClick={() => setFormOpen(false)}>
              취소
            </Button>
            <Button size="sm" onClick={submit} disabled={saving || !canSubmit}>
              {editingId == null ? "추가" : "저장"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <FormField
            label="코드"
            hint={editingId == null ? "ROLE_ 접두사 + 대문자. 예: ROLE_FACILITY_MANAGER" : "코드는 변경할 수 없습니다."}
            error={codeError}
          >
            <Input
              value={form.code}
              disabled={editingId != null}
              placeholder="ROLE_FACILITY_MANAGER"
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            />
          </FormField>
          <FormField label="이름">
            <Input
              value={form.name}
              placeholder="시설 담당자"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </FormField>
          <FormField label="설명" hint="이 롤이 무엇을 할 수 있는지 한 줄로 적어두면 운영에 도움이 됩니다.">
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </FormField>
        </div>
      </Drawer>
    </main>
  );
}
