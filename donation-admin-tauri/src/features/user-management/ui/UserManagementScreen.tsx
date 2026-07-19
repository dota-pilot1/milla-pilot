import { useEffect, useMemo, useState } from "react";
import type { ColDef } from "ag-grid-community";
import type { SelectionChangedEvent } from "ag-grid-community";
import { Pencil, Plus, Trash2, UserCheck, UserRoundX, Users } from "lucide-react";
import { ApiError } from "../../../shared/api/client";
import { AdminDataGrid } from "../../../shared/ui/AdminDataGrid";
import { AdminGridHeader } from "../../../shared/ui/AdminGridHeader";
import { AdminPagination } from "../../../shared/ui/AdminPagination";
import { Button } from "../../../shared/ui/Button";
import { Drawer } from "../../../shared/ui/Drawer";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { FormField } from "../../../shared/ui/FormField";
import { Input } from "../../../shared/ui/Input";
import { Panel, PanelHeader } from "../../../shared/ui/Panel";
import { SearchInput } from "../../../shared/ui/SearchInput";
import { Select } from "../../../shared/ui/Select";
import { StatusBadge } from "../../../shared/ui/StatusBadge";
import { useDebouncedValue } from "../../../shared/lib/useDebouncedValue";
import type { ManagedUser, RoleOption, UserPage } from "../../../entities/user/model/types";
import {
  changeUserRole,
  createUser,
  deleteUser,
  fetchRoles,
  fetchUsers,
  toggleUserActive,
  updateUser,
} from "../api/userManagementApi";

type UserForm = {
  email: string;
  username: string;
  phoneNumber: string;
  password: string;
  roleId: string;
};

type UserGridRow = ManagedUser & {
  roleName: string;
  roleCode: string;
  statusLabel: string;
  createdAtLabel: string;
};

type ActiveFilter = "all" | "active" | "inactive";
type UserSortField = "username" | "email" | "phoneNumber" | "roleName" | "roleCode" | "active" | "createdAt";
type SortDirection = "asc" | "desc";
type UserHeaderFieldKey = "username" | "phoneNumber" | "roleName" | "active" | "createdAt";

const pageSize = 20;

const emptyForm: UserForm = {
  email: "",
  username: "",
  phoneNumber: "",
  password: "",
  roleId: "",
};

const emptyPage: UserPage = {
  content: [],
  page: 0,
  size: pageSize,
  totalElements: 0,
  totalPages: 0,
};

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));

export function UserManagementScreen({ token }: { token: string }) {
  const [usersPage, setUsersPage] = useState<UserPage>(emptyPage);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [sortField, setSortField] = useState<UserSortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const debouncedQuery = useDebouncedValue(query, 250);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);
  const [selectedCount, setSelectedCount] = useState(0);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetchUsers(token, page, pageSize, {
        q: debouncedQuery,
        roleId: roleFilter === "all" ? undefined : Number(roleFilter),
        active: activeFilter === "all" ? undefined : activeFilter === "active",
        sort: sortField,
        direction: sortDirection,
      }),
      fetchRoles(token),
    ])
      .then(([nextUsersPage, nextRoles]) => {
        setUsersPage(nextUsersPage);
        setRoles(nextRoles);
        setSelectedCount(0);
        setError("");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "유저 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [activeFilter, debouncedQuery, page, roleFilter, sortDirection, sortField, token]);

  const gridRows = useMemo<UserGridRow[]>(
    () =>
      usersPage.content.map((user) => ({
        ...user,
        roleName: user.role.name,
        roleCode: user.role.code,
        statusLabel: user.active ? "활성" : "비활성",
        createdAtLabel: formatDate(user.createdAt),
      })),
    [usersPage.content],
  );

  const roleById = useMemo(() => new Map(roles.map((role) => [role.id, role])), [roles]);

  const openCreate = () => {
    setEditingUser(null);
    setForm({ ...emptyForm, roleId: roles[0] ? String(roles[0].id) : "" });
    setFormOpen(true);
  };

  const openEdit = (user: ManagedUser) => {
    setEditingUser(user);
    setForm({
      email: user.email,
      username: user.username,
      phoneNumber: user.phoneNumber ?? "",
      password: "",
      roleId: String(user.role.id),
    });
    setFormOpen(true);
  };

  const submit = async () => {
    const roleId = Number(form.roleId);
    if (!roleId) {
      alert("역할을 선택해주세요.");
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        await updateUser(token, editingUser.id, {
          email: form.email.trim(),
          username: form.username.trim(),
          phoneNumber: form.phoneNumber.trim() || null,
        });
        if (editingUser.role.id !== roleId) {
          await changeUserRole(token, editingUser.id, roleId);
        }
      } else {
        await createUser(token, {
          email: form.email.trim(),
          username: form.username.trim(),
          phoneNumber: form.phoneNumber.trim() || null,
          password: form.password,
          roleId,
        });
      }
      setFormOpen(false);
      load();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "유저 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (user: ManagedUser) => {
    const nextState = user.active ? "비활성" : "활성";
    if (!confirm(`${user.username} 계정을 ${nextState} 처리할까요?`)) return;
    setBusyUserId(user.id);
    try {
      await toggleUserActive(token, user.id);
      load();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "계정 상태 변경에 실패했습니다.");
    } finally {
      setBusyUserId(null);
    }
  };

  const remove = async (user: ManagedUser) => {
    if (!confirm(`${user.username} 계정을 삭제할까요? 이 작업은 되돌릴 수 없습니다.`)) return;
    setBusyUserId(user.id);
    try {
      await deleteUser(token, user.id);
      if (usersPage.content.length === 1 && page > 0) setPage((current) => current - 1);
      else load();
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "유저 삭제에 실패했습니다.");
    } finally {
      setBusyUserId(null);
    }
  };

  const canSubmit =
    !!form.email.trim() &&
    !!form.username.trim() &&
    !!form.roleId &&
    (editingUser != null || form.password.length >= 8);

  const updateQuery = (value: string) => {
    setQuery(value);
    setPage(0);
  };

  const updateRoleFilter = (value: string) => {
    setRoleFilter(value);
    setPage(0);
  };

  const updateActiveFilter = (value: ActiveFilter) => {
    setActiveFilter(value);
    setPage(0);
  };

  const updateServerSort = (field: UserHeaderFieldKey, direction: SortDirection) => {
    const sortFieldByColumn: Record<UserHeaderFieldKey, UserSortField | undefined> = {
      username: "username",
      phoneNumber: "phoneNumber",
      roleName: "roleName",
      active: "active",
      createdAt: "createdAt",
    };
    const nextField = sortFieldByColumn[field];
    if (!nextField) return;

    setSortField(nextField);
    setSortDirection(direction);
    setPage(0);
  };

  const columnDefs = useMemo<ColDef<UserGridRow>[]>(
    () => [
      {
        field: "username",
        headerName: "계정",
        flex: 1.3,
        minWidth: 240,
        pinned: null,
        sortable: false,
        headerComponent: AdminGridHeader<UserGridRow, UserHeaderFieldKey>,
        headerComponentParams: {
          fieldKey: "username",
          serverSortable: true,
          serverSort: sortField === "username" ? sortDirection : null,
          onServerSortChange: updateServerSort,
        },
        cellRenderer: ({ data }: { data?: UserGridRow }) => {
          if (!data) return null;
          return (
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-zinc-100 text-[12px] font-extrabold text-zinc-700">
                {data.username.charAt(0)}
              </span>
              <div className="min-w-0">
                <div className="truncate font-bold text-zinc-900">{data.username}</div>
                <div className="truncate text-[11px] text-zinc-400">{data.email}</div>
              </div>
            </div>
          );
        },
        valueGetter: ({ data }) => data ? `${data.username} ${data.email}` : "",
      },
      {
        field: "phoneNumber",
        headerName: "전화번호",
        width: 150,
        pinned: null,
        sortable: false,
        headerComponent: AdminGridHeader<UserGridRow, UserHeaderFieldKey>,
        headerComponentParams: {
          fieldKey: "phoneNumber",
          serverSortable: true,
          serverSort: sortField === "phoneNumber" ? sortDirection : null,
          onServerSortChange: updateServerSort,
        },
        cellRenderer: ({ data }: { data?: UserGridRow }) => {
          if (!data) return null;
          if (!data.phoneNumber) return <span className="text-[12px] font-semibold text-zinc-400">미등록</span>;
          return <span className="font-bold text-zinc-800">{data.phoneNumber}</span>;
        },
        valueGetter: ({ data }) => data?.phoneNumber ?? "",
      },
      {
        field: "roleName",
        headerName: "역할",
        width: 190,
        pinned: null,
        sortable: false,
        headerComponent: AdminGridHeader<UserGridRow, UserHeaderFieldKey>,
        headerComponentParams: {
          fieldKey: "roleName",
          serverSortable: true,
          serverSort: sortField === "roleName" ? sortDirection : null,
          onServerSortChange: updateServerSort,
        },
        cellRenderer: ({ data }: { data?: UserGridRow }) => {
          if (!data) return null;
          return (
            <div className="min-w-0">
              <div className="truncate font-bold text-zinc-900">{data.roleName}</div>
              <div className="truncate text-[11px] font-semibold text-zinc-400">{data.roleCode}</div>
            </div>
          );
        },
        valueGetter: ({ data }) => data ? `${data.roleName} ${data.roleCode}` : "",
      },
      {
        field: "active",
        headerName: "상태",
        width: 120,
        pinned: null,
        sortable: false,
        headerComponent: AdminGridHeader<UserGridRow, UserHeaderFieldKey>,
        headerComponentParams: {
          fieldKey: "active",
          serverSortable: true,
          serverSort: sortField === "active" ? sortDirection : null,
          onServerSortChange: updateServerSort,
        },
        cellRenderer: ({ data }: { data?: UserGridRow }) => {
          if (!data) return null;
          return (
            <StatusBadge tone={data.active ? "success" : "neutral"}>
              {data.statusLabel}
            </StatusBadge>
          );
        },
      },
      {
        field: "createdAt",
        headerName: "가입일",
        width: 160,
        pinned: null,
        sortable: false,
        headerComponent: AdminGridHeader<UserGridRow, UserHeaderFieldKey>,
        headerComponentParams: {
          fieldKey: "createdAt",
          serverSortable: true,
          serverSort: sortField === "createdAt" ? sortDirection : null,
          onServerSortChange: updateServerSort,
        },
        valueFormatter: ({ data }) => data?.createdAtLabel ?? "",
      },
      {
        colId: "actions",
        headerName: "관리",
        width: 132,
        sortable: false,
        filter: false,
        resizable: false,
        pinned: null,
        headerClass: "admin-grid-actions-header",
        cellRenderer: ({ data }: { data?: UserGridRow }) => {
          if (!data) return null;
          return (
            <div className="flex h-full items-center justify-end gap-1">
              <Button size="sm" variant="ghost" onClick={() => openEdit(data)}>
                <Pencil size={14} />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toggleActive(data)} disabled={busyUserId === data.id}>
                {data.active ? <UserRoundX size={14} /> : <UserCheck size={14} />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove(data)} disabled={busyUserId === data.id}>
                <Trash2 size={14} className="text-red-600" />
              </Button>
            </div>
          );
        },
      },
    ],
    [busyUserId, page, sortDirection, sortField, token, usersPage.content.length],
  );

  return (
    <main className="workspace-page space-y-5">
      <section className="workspace-hero dense">
        <div className="workspace-hero-mark">
          <Users size={22} />
        </div>
        <div className="workspace-hero-copy">
          <p className="eyebrow">DonationPlatform Admin</p>
          <h1>유저 관리</h1>
          <p>운영자와 후원자 계정을 조회하고 역할, 활성 상태, 기본 프로필을 관리합니다.</p>
        </div>
      </section>

      <Panel className="p-4">
        <PanelHeader
          title={`유저 목록 · ${usersPage.totalElements.toLocaleString("ko-KR")}명 · 역할 ${roles.length}개`}
          className="mb-3"
          action={
            <Button size="sm" onClick={openCreate} disabled={roles.length === 0}>
              <Plus size={15} /> 유저 추가
            </Button>
          }
        />

        <div className="mb-3">
          <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-[11rem_9rem_minmax(18rem,1fr)]">
            <Select
              value={roleFilter}
              onChange={(e) => updateRoleFilter(e.target.value)}
              className="h-10 rounded-xl border-zinc-200 bg-white text-[13px] font-bold"
              aria-label="역할 필터"
            >
              <option value="all">전체 역할</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </Select>
            <Select
              value={activeFilter}
              onChange={(e) => updateActiveFilter(e.target.value as ActiveFilter)}
              className="h-10 rounded-xl border-zinc-200 bg-white text-[13px] font-bold"
              aria-label="상태 필터"
            >
              <option value="all">전체 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </Select>
            <SearchInput
              className="min-w-0"
              value={query}
              placeholder="이메일, 이름, 전화번호, 역할 검색"
              onChange={(e) => updateQuery(e.target.value)}
              onClear={() => updateQuery("")}
            />
          </div>
        </div>

        {error && <p className="mb-4 text-[13px] font-semibold text-red-600">{error}</p>}

        {loading && usersPage.content.length === 0 ? (
          <p className="text-[13px] text-zinc-500">불러오는 중...</p>
        ) : usersPage.content.length === 0 ? (
          <EmptyState
            title="등록된 유저가 없습니다."
            description="유저 추가로 관리자 또는 후원자 계정을 등록하세요."
            action={
              <Button size="sm" onClick={openCreate} disabled={roles.length === 0}>
                <Plus size={15} /> 유저 추가
              </Button>
            }
          />
        ) : gridRows.length === 0 ? (
          <EmptyState
            title="검색 결과가 없습니다."
            description="검색어 또는 필터와 일치하는 유저가 없습니다."
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  updateQuery("");
                  updateRoleFilter("all");
                  updateActiveFilter("all");
                }}
              >
                필터 초기화
              </Button>
            }
          />
        ) : (
          <AdminDataGrid<UserGridRow>
            rowData={gridRows}
            columnDefs={columnDefs}
            height={620}
            rowHeight={58}
            defaultColDef={{ filter: false }}
            rowSelection={{
              mode: "multiRow",
              checkboxes: true,
              headerCheckbox: true,
              enableClickSelection: false,
            }}
            selectionColumnDef={{
              width: 48,
              minWidth: 48,
              maxWidth: 48,
              resizable: false,
              pinned: null,
            }}
            onSelectionChanged={(event: SelectionChangedEvent<UserGridRow>) => {
              setSelectedCount(event.api.getSelectedRows().length);
            }}
            getRowId={({ data }) => String(data.id)}
            overlayNoRowsTemplate="표시할 유저가 없습니다."
          />
        )}

        <AdminPagination
          page={usersPage.page}
          totalPages={usersPage.totalPages}
          totalElements={usersPage.totalElements}
          pageSize={usersPage.size}
          currentCount={usersPage.content.length}
          loading={loading}
          selectedCount={selectedCount}
          onPageChange={setPage}
        />
      </Panel>

      <Drawer
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingUser ? "유저 수정" : "유저 추가"}
        description={editingUser ? "계정 기본 정보와 역할을 수정합니다." : "새 계정과 초기 역할을 등록합니다."}
        footer={
          <>
            <Button size="sm" variant="outline" onClick={() => setFormOpen(false)}>
              취소
            </Button>
            <Button size="sm" onClick={submit} disabled={saving || !canSubmit}>
              {editingUser ? "저장" : "추가"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <FormField label="이메일">
            <Input
              type="email"
              value={form.email}
              placeholder="operator@example.com"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </FormField>
          <FormField label="사용자명">
            <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </FormField>
          <FormField label="전화번호">
            <Input
              value={form.phoneNumber}
              placeholder="010-0000-0000"
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            />
          </FormField>
          {!editingUser && (
            <FormField label="초기 비밀번호">
              <Input
                type="password"
                value={form.password}
                placeholder="8자 이상"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </FormField>
          )}
          <FormField label="역할">
            <Select value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
              <option value="" disabled>
                역할 선택
              </option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} ({role.code})
                </option>
              ))}
            </Select>
          </FormField>
          {form.roleId && roleById.get(Number(form.roleId))?.description && (
            <p className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-[12px] leading-5 text-zinc-600">
              {roleById.get(Number(form.roleId))?.description}
            </p>
          )}
        </div>
      </Drawer>
    </main>
  );
}
