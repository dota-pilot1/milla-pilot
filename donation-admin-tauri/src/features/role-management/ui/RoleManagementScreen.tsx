import { useEffect, useMemo, useState } from "react";
import { KeyRound, Lock, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "../../../shared/ui/Button";
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

export function RoleManagementScreen({ token }: { token: string }) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<RoleForm>(emptyForm);
  const [saving, setSaving] = useState(false);

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
    if (!q) return roles;
    return roles.filter((role) =>
      [role.code, role.name, role.description ?? ""].some((field) => field.toLowerCase().includes(q)),
    );
  }, [keyword, roles]);

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
          description="시스템 롤은 코드·이름이 고정이며 삭제할 수 없습니다."
          action={
            <div className="flex items-center gap-2">
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
                <DataTableHeaderCell>롤</DataTableHeaderCell>
                <DataTableHeaderCell>코드</DataTableHeaderCell>
                <DataTableHeaderCell>권한</DataTableHeaderCell>
                <DataTableHeaderCell>구분</DataTableHeaderCell>
                <DataTableHeaderCell className="text-right">관리</DataTableHeaderCell>
              </tr>
            </DataTableHead>
            <tbody>
              {visibleRoles.map((role) => (
                <tr key={role.id} className="border-t border-zinc-100">
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
                  <DataTableCell>
                    <div className="flex justify-end gap-1">
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
                </tr>
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
