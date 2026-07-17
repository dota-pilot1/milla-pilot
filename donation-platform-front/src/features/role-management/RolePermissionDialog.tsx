"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { permissionApi } from "@/entities/permission/api/permissionApi";
import type { Permission } from "@/entities/permission/model/types";
import { roleApi } from "@/entities/user/api/roleApi";
import type { Role } from "@/entities/user/model/types";
import { toast, toastError } from "@/shared/lib/toast";

type Props = {
  role: Role | null;
  onClose: () => void;
};

const CATEGORY_ORDER = [
  "RESERVATION",
  "SERVICE",
  "CUSTOMER",
  "USER",
  "ROLE",
  "PERMISSION",
  "REVENUE",
  "DASHBOARD",
  "SYSTEM",
];

export function RolePermissionDialog({ role, onClose }: Props) {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [keyword, setKeyword] = useState("");

  const { data: allPermissions, isLoading: allLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => permissionApi.list(),
    enabled: !!role,
  });

  const { data: rolePermissions, isLoading: roleLoading } = useQuery({
    queryKey: ["role-permissions", role?.id],
    queryFn: () => roleApi.getPermissions(role!.id),
    enabled: !!role,
  });

  useEffect(() => {
    if (rolePermissions) {
      setSelected(new Set(rolePermissions.map((permission) => permission.id)));
    }
  }, [rolePermissions]);

  const mutation = useMutation({
    mutationFn: (ids: number[]) => roleApi.setPermissions(role!.id, ids),
    onSuccess: () => {
      toast.success("권한이 저장되었습니다.");
      qc.invalidateQueries({ queryKey: ["roles"] });
      qc.invalidateQueries({ queryKey: ["role-permissions", role?.id] });
      onClose();
    },
    onError: (error) => toastError(error, "저장에 실패했습니다."),
  });

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isLoading = allLoading || roleLoading;
  const normalizedKeyword = keyword.trim().toLowerCase();

  const filteredPermissions = useMemo(() => {
    if (!allPermissions) return [];
    if (!normalizedKeyword) return allPermissions;
    return allPermissions.filter((permission) => {
      const haystack = [
        permission.name,
        permission.code,
        permission.description,
        permission.category?.name,
        permission.category?.code,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedKeyword);
    });
  }, [allPermissions, normalizedKeyword]);

  const grouped = useMemo(
    () =>
      filteredPermissions.reduce<Record<string, Permission[]>>((acc, permission) => {
        const categoryCode = permission.category?.code ?? "UNCATEGORIZED";
        (acc[categoryCode] = acc[categoryCode] ?? []).push(permission);
        return acc;
      }, {}),
    [filteredPermissions]
  );

  const categoryLabels = useMemo(
    () =>
      filteredPermissions.reduce<Record<string, string>>((acc, permission) => {
        const categoryCode = permission.category?.code ?? "UNCATEGORIZED";
        acc[categoryCode] = permission.category?.name ?? "미분류";
        return acc;
      }, {}),
    [filteredPermissions]
  );

  const orderedCategories = [
    ...CATEGORY_ORDER.filter((category) => grouped[category]),
    ...Object.keys(grouped).filter((category) => !CATEGORY_ORDER.includes(category)),
  ];

  const toggleCategory = (permissions: Permission[]) => {
    const ids = permissions.map((permission) => permission.id);
    const allChecked = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => {
        if (allChecked) {
          next.delete(id);
        } else {
          next.add(id);
        }
      });
      return next;
    });
  };

  if (!role) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[84vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-border bg-background shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[260px_1fr]">
          <aside className="border-b border-border bg-muted/30 p-5 md:border-b-0 md:border-r">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Role Permission
            </p>
            <h2 className="mt-2 text-lg font-bold tracking-tight">
              {role.name}에 대한 권한 설정
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs font-medium text-muted-foreground">롤 코드</p>
                <p className="mt-1 inline-flex rounded bg-background px-2 py-1 font-mono text-xs text-foreground">
                  {role.code}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">선택 권한</p>
                <p className="mt-1 text-2xl font-bold tracking-tight">{selected.size}</p>
              </div>
              {role.description && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">설명</p>
                  <p className="mt-1 leading-6 text-muted-foreground">{role.description}</p>
                </div>
              )}
            </div>
            <div className="mt-5 rounded-md border border-border bg-background p-3 text-xs leading-5 text-muted-foreground">
              권한은 유저에게 직접 주지 않고 롤에 묶어 관리합니다. 저장 후 이 롤을 가진 직원과 고객에게 적용됩니다.
            </div>

            {role.systemRole && (
              <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                시스템 기본 롤
              </div>
            )}
          </aside>

          <section className="flex min-h-0 flex-col">
            <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold">권한 목록</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  카테고리별 권한을 선택해 {role.name} 롤에 부여합니다.
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="권한명, 코드 검색"
                  className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            {isLoading ? (
              <p className="px-5 py-8 text-sm text-muted-foreground">로딩 중...</p>
            ) : (
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {orderedCategories.length === 0 ? (
                  <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
                    검색 결과가 없습니다.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orderedCategories.map((category) => {
                      const permissions = grouped[category];
                      const selectedCount = permissions.filter((permission) => selected.has(permission.id)).length;
                      const allChecked = selectedCount === permissions.length;
                      const someChecked = selectedCount > 0 && !allChecked;

                      return (
                        <section key={category} className="rounded-md border border-border">
                          <div className="flex h-10 items-center justify-between border-b border-border bg-muted/30 px-3">
                            <button
                              type="button"
                              onClick={() => toggleCategory(permissions)}
                              className="flex min-w-0 items-center gap-2 text-left"
                            >
                              <input
                                type="checkbox"
                                checked={allChecked}
                                ref={(element) => {
                                  if (element) element.indeterminate = someChecked;
                                }}
                                readOnly
                                className="h-4 w-4 rounded border-input accent-primary"
                              />
                              <span className="truncate text-xs font-semibold uppercase text-muted-foreground">
                                {categoryLabels[category] ?? category}
                              </span>
                            </button>
                            <span className="shrink-0 rounded bg-background px-2 py-0.5 text-xs text-muted-foreground">
                              {selectedCount}/{permissions.length}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2">
                            {permissions.map((permission) => {
                              const checked = selected.has(permission.id);

                              return (
                                <label
                                  key={permission.id}
                                  className={`flex min-h-14 cursor-pointer items-start gap-2 bg-background px-3 py-2.5 transition-colors hover:bg-accent ${
                                    checked ? "bg-primary/5" : ""
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggle(permission.id)}
                                    className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
                                  />
                                  <span className="min-w-0">
                                    <span className="flex min-w-0 items-center gap-2">
                                      <span className="truncate text-sm font-medium leading-tight">
                                        {permission.name}
                                      </span>
                                      <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                                        {permission.code}
                                      </span>
                                    </span>
                                    {permission.description && (
                                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                        {permission.description}
                                      </span>
                                    )}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        <div className="flex items-center justify-between border-t border-border bg-background px-5 py-3">
          <span className="text-xs text-muted-foreground">
            전체 {allPermissions?.length ?? 0}개 중 {selected.size}개 선택
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent"
            >
              취소
            </button>
            <button
              type="button"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate([...selected])}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {mutation.isPending ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
