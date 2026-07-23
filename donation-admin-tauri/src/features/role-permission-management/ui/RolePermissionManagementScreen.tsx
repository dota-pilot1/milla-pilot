import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ShieldCheck } from "lucide-react";
import type { Permission } from "../../../entities/permission/model/types";
import type { Role } from "../../../entities/role/model/types";
import { ApiError } from "../../../shared/api/client";
import { Button } from "../../../shared/ui/Button";
import { Checkbox } from "../../../shared/ui/Checkbox";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { Panel } from "../../../shared/ui/Panel";
import { SearchInput } from "../../../shared/ui/SearchInput";
import { StatusBadge } from "../../../shared/ui/StatusBadge";
import { fetchPermissions } from "../../permission-management/api/permissionApi";
import { fetchRolePermissions, fetchRoles, setRolePermissions } from "../../role-management/api/roleApi";

type PermissionGroup = { code: string; name: string; permissions: Permission[] };

export function RolePermissionManagementScreen({ token }: { token: string }) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchRoles(token), fetchPermissions(token)])
      .then(([nextRoles, nextPermissions]) => {
        setRoles(nextRoles);
        setPermissions(nextPermissions);
        setSelectedRoleId((current) => current ?? nextRoles[0]?.id ?? null);
        setError("");
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "역할과 권한을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (selectedRoleId == null) return;
    setPermissionLoading(true);
    fetchRolePermissions(token, selectedRoleId)
      .then((items) => {
        const ids = new Set(items.map((item) => item.id));
        setSavedIds(ids);
        setCheckedIds(new Set(ids));
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "역할 권한을 불러오지 못했습니다."))
      .finally(() => setPermissionLoading(false));
  }, [selectedRoleId, token]);

  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? null;
  const visibleRoles = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    return query
      ? roles.filter((role) => [role.name, role.code].some((value) => value.toLowerCase().includes(query)))
      : roles;
  }, [keyword, roles]);

  const groups = useMemo(() => {
    const grouped = new Map<string, PermissionGroup>();
    permissions.forEach((permission) => {
      const code = permission.category?.code ?? "UNCATEGORIZED";
      const group = grouped.get(code) ?? { code, name: permission.category?.name ?? "미분류", permissions: [] };
      group.permissions.push(permission);
      grouped.set(code, group);
    });
    return [...grouped.values()].map((group) => ({
      ...group,
      permissions: group.permissions.sort((a, b) => a.name.localeCompare(b.name, "ko")),
    }));
  }, [permissions]);

  const dirty = checkedIds.size !== savedIds.size || [...checkedIds].some((id) => !savedIds.has(id));

  const togglePermission = (id: number) => {
    setCheckedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGroup = (items: Permission[]) => {
    const allChecked = items.every((permission) => checkedIds.has(permission.id));
    setCheckedIds((current) => {
      const next = new Set(current);
      items.forEach((permission) => allChecked ? next.delete(permission.id) : next.add(permission.id));
      return next;
    });
  };

  const save = async () => {
    if (selectedRoleId == null || !dirty) return;
    setSaving(true);
    try {
      await setRolePermissions(token, selectedRoleId, [...checkedIds]);
      setSavedIds(new Set(checkedIds));
    } catch (reason) {
      alert(reason instanceof ApiError ? reason.message : "권한 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="workspace-page space-y-5">
      <section className="workspace-hero dense">
        <div className="workspace-hero-mark"><ShieldCheck size={22} /></div>
        <div className="workspace-hero-copy">
          <p className="eyebrow">DonationPlatform Admin</p>
          <h1>역할-권한 매핑</h1>
          <p>역할을 선택하고 수행할 수 있는 업무 권한을 카테고리별로 설정합니다.</p>
        </div>
      </section>

      <Panel className="overflow-hidden p-0">
        {error && <p className="border-b border-zinc-200 px-5 py-3 text-[13px] font-semibold text-red-600">{error}</p>}
        {loading ? (
          <div className="p-6 text-[13px] text-zinc-500">불러오는 중...</div>
        ) : (
          <div className="grid min-h-[620px] grid-cols-[320px_minmax(0,1fr)]">
            <aside className="flex min-h-0 flex-col border-r border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={15} className="text-emerald-700" />
                    <h2 className="text-[13px] font-extrabold text-zinc-900">역할 목록</h2>
                  </div>
                  <span className="text-[11px] font-bold text-zinc-500">{roles.length}개</span>
                </div>
                <SearchInput
                  className="w-full"
                  value={keyword}
                  placeholder="역할 검색"
                  onChange={(event) => setKeyword(event.target.value)}
                  onClear={() => setKeyword("")}
                />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto bg-zinc-50/50 p-2">
                {visibleRoles.map((role) => {
                  const active = role.id === selectedRoleId;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRoleId(role.id)}
                      className={`relative mb-1 w-full rounded-lg border px-3 py-2.5 text-left transition-all ${active ? "border-emerald-200 bg-emerald-50/80 shadow-sm ring-1 ring-emerald-100" : "border-zinc-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30"}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`truncate text-[13px] font-extrabold ${active ? "text-emerald-800" : "text-zinc-800"}`}>{role.name}</span>
                        {role.systemRole && <StatusBadge tone="info">시스템</StatusBadge>}
                      </div>
                      <code className="mt-1 block truncate text-[11px] text-zinc-500">{role.code}</code>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="flex min-w-0 flex-col bg-white">
              {selectedRole == null ? (
                <EmptyState title="역할을 선택해 주세요." description="왼쪽 목록에서 권한을 설정할 역할을 선택하세요." />
              ) : (
                <>
                  <header className="flex min-h-16 items-center justify-between gap-4 border-b border-zinc-200 px-5 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate text-[15px] font-extrabold text-zinc-900">{selectedRole.name}</h2>
                        <span className="text-[12px] text-zinc-500">선택 {checkedIds.size}개</span>
                      </div>
                      <code className="text-[11px] text-zinc-500">{selectedRole.code}</code>
                    </div>
                    <Button size="sm" onClick={save} disabled={!dirty || saving || permissionLoading}>
                      <Check size={15} /> {saving ? "저장 중..." : "변경사항 저장"}
                    </Button>
                  </header>

                  {permissionLoading ? (
                    <div className="p-5 text-[13px] text-zinc-500">권한을 불러오는 중...</div>
                  ) : groups.length === 0 ? (
                    <EmptyState title="등록된 권한이 없습니다." description="권한 관리에서 권한을 먼저 등록하세요." />
                  ) : (
                    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
                      {groups.map((group) => <PermissionGroupSection key={group.code} group={group} checkedIds={checkedIds} onToggleGroup={toggleGroup} onTogglePermission={togglePermission} />)}
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        )}
      </Panel>
    </main>
  );
}

function PermissionGroupSection({
  group,
  checkedIds,
  onToggleGroup,
  onTogglePermission,
}: {
  group: PermissionGroup;
  checkedIds: Set<number>;
  onToggleGroup: (items: Permission[]) => void;
  onTogglePermission: (id: number) => void;
}) {
  const checkboxRef = useRef<HTMLInputElement>(null);
  const checkedCount = group.permissions.filter((permission) => checkedIds.has(permission.id)).length;
  const allChecked = checkedCount === group.permissions.length;

  useEffect(() => {
    if (checkboxRef.current) checkboxRef.current.indeterminate = checkedCount > 0 && !allChecked;
  }, [allChecked, checkedCount]);

  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-3">
        <label className="flex cursor-pointer items-center gap-2.5">
          <Checkbox ref={checkboxRef} checked={allChecked} onChange={() => onToggleGroup(group.permissions)} />
          <span className="text-[13px] font-extrabold text-zinc-900">{group.name}</span>
          <code className="text-[11px] text-zinc-500">{group.code}</code>
        </label>
        <span className="text-[11px] font-bold text-zinc-500">{checkedCount}/{group.permissions.length}</span>
      </div>
      <div className="grid gap-px bg-zinc-200 sm:grid-cols-2 xl:grid-cols-3">
        {group.permissions.map((permission) => {
          const checked = checkedIds.has(permission.id);
          return (
            <label key={permission.id} className={`flex min-h-16 cursor-pointer items-start gap-3 bg-white px-4 py-3 transition-colors hover:bg-zinc-50 ${checked ? "bg-emerald-50/60" : ""}`}>
              <Checkbox checked={checked} onChange={() => onTogglePermission(permission.id)} />
              <span className="min-w-0">
                <span className="block text-[13px] font-bold text-zinc-900">{permission.name}</span>
                <code className="mt-0.5 block truncate text-[11px] text-zinc-500">{permission.code}</code>
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
