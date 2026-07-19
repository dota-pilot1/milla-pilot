import { useEffect, useMemo, useState } from "react";
import { AppWindow, Globe, Menu } from "lucide-react";
import { Button } from "../../../shared/ui/Button";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { Panel } from "../../../shared/ui/Panel";
import type { MenuScope } from "../../../shared/lib/menuScope";
import { appMenuApi } from "../api/appMenuApi";
import { buildMenuTree } from "../lib/menuTree";
import type { AppMenuRecord } from "../model/types";
import { AppMenuDetailPanel } from "./AppMenuDetailPanel";
import { AppMenuFormDialog } from "./AppMenuFormDialog";
import { AppMenuTreeSidebar } from "./AppMenuTreeSidebar";

type Props = {
  token: string;
  scope: MenuScope;
  onSaved: () => Promise<void> | void;
};

export function AppMenuManagementScreen({ token, scope, onSaved }: Props) {
  const [menus, setMenus] = useState<AppMenuRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AppMenuRecord | null>(null);
  const [parentHintId, setParentHintId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const scopeLabel = scope === "web" ? "웹 메뉴" : "앱 메뉴";
  const ScopeIcon = scope === "web" ? Globe : AppWindow;

  const scopedMenus = menus;
  const scopedTree = useMemo(() => buildMenuTree(scopedMenus), [scopedMenus]);
  const selected = scopedMenus.find((menu) => menu.id === selectedId) ?? null;

  const load = async () => {
    setLoading(true);
    try {
      const next = await appMenuApi.getAll(token);
      setMenus(next);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "메뉴를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 1800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    void load();
  }, [token]);

  const openCreateRoot = () => {
    setEditing(null);
    setParentHintId(null);
    setDialogOpen(true);
  };

  const openCreateChild = () => {
    if (!selected) return;
    setEditing(null);
    setParentHintId(selected.id);
    setDialogOpen(true);
  };

  const openEdit = () => {
    if (!selected) return;
    setEditing(selected);
    setParentHintId(null);
    setDialogOpen(true);
  };

  const toggleVisible = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await appMenuApi.update(token, selected.id, {
        parentId: selected.parentId,
        label: selected.label,
        labelKey: selected.labelKey,
        path: selected.path,
        icon: selected.icon,
        isExternal: selected.isExternal,
        requiredRole: selected.requiredRole,
        requiredPermission: selected.requiredPermission,
        visible: !selected.visible,
        displayOrder: selected.displayOrder,
      });
      await load();
      setNotice("표시 상태를 변경했습니다.");
      void onSaved();
    } catch (updateError) {
      alert(updateError instanceof Error ? updateError.message : "표시 상태를 바꾸지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selected) return;
    if (scopedMenus.some((menu) => menu.parentId === selected.id)) {
      alert("하위 메뉴가 있어 삭제할 수 없습니다. 숨김으로 전환해주세요.");
      return;
    }
    if (!confirm(`'${selected.label}' 메뉴를 삭제할까요?`)) return;

    setSaving(true);
    try {
      await appMenuApi.delete(token, selected.id);
      setSelectedId(null);
      await load();
      setNotice("메뉴를 삭제했습니다.");
      void onSaved();
    } catch (deleteError) {
      alert(deleteError instanceof Error ? deleteError.message : "메뉴 삭제에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const reorder = async (updated: AppMenuRecord[]) => {
    if (!updated.length) return;
    const snapshot = menus;
    setMenus((prev) => prev.map((menu) => updated.find((next) => next.id === menu.id) ?? menu));
    setSaving(true);
    try {
      await Promise.all(
        updated.map((menu) =>
          appMenuApi.update(token, menu.id, {
            parentId: menu.parentId,
            label: menu.label,
            labelKey: menu.labelKey,
            path: menu.path,
            icon: menu.icon,
            isExternal: menu.isExternal,
            requiredRole: menu.requiredRole,
            requiredPermission: menu.requiredPermission,
            visible: menu.visible,
            displayOrder: menu.displayOrder,
          }),
        ),
      );
      await load();
      setNotice("순서를 저장했습니다.");
      void onSaved();
    } catch (reorderError) {
      setMenus(snapshot);
      alert(reorderError instanceof Error ? reorderError.message : "순서 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="workspace-page space-y-3">
      <Panel>
        <div className="mb-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-zinc-800">
            <ScopeIcon size={15} />
            <h1 className="text-[18px] font-extrabold tracking-tight">{scopeLabel} 관리</h1>
          </div>
          <Button variant="outline" onClick={() => void load()} disabled={loading || saving}>
            새로고침
          </Button>
        </div>
        <div className="mb-4 text-[12px] text-zinc-500">
          전체 <strong className="text-zinc-900">{scopedMenus.length}</strong>개 · 표시
          <strong className="ml-1 text-zinc-900">{scopedMenus.filter((menu) => menu.visible).length}</strong>개
        </div>

        {loading ? (
          <div className="py-10 text-center text-[13px] text-zinc-500">메뉴를 불러오는 중...</div>
        ) : error ? (
          <EmptyState title="메뉴를 불러오지 못했습니다." description={error} />
        ) : (
          <div className="grid min-h-[560px] gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
            <AppMenuTreeSidebar
              items={scopedTree}
              selectedId={selectedId}
              saving={saving}
              onSelect={(menu) => setSelectedId(menu.id)}
              onCreateRoot={openCreateRoot}
              onReorder={(updated) => void reorder(updated)}
            />
            {selected ? (
              <AppMenuDetailPanel
                scopeLabel={scopeLabel}
                selected={selected}
                saving={saving}
                onCreateChild={openCreateChild}
                onEdit={openEdit}
                onToggleVisible={() => void toggleVisible()}
                onDelete={() => void remove()}
              />
            ) : (
              <EmptyState
                title={`${scopeLabel}를 선택해주세요.`}
                description="왼쪽 트리에서 메뉴를 선택하면 상세 정보를 편집할 수 있습니다."
                action={
                  <Button onClick={openCreateRoot}>
                    <Menu size={14} />
                    새 메뉴 만들기
                  </Button>
                }
              />
            )}
          </div>
        )}
      </Panel>

      <AppMenuFormDialog
        token={token}
        open={dialogOpen}
        menus={scopedMenus}
        scopeLabel={scopeLabel}
        target={editing}
        parentHintId={parentHintId}
        onOpenChange={setDialogOpen}
        onSaved={async () => {
          await load();
          setNotice(editing ? "메뉴를 수정했습니다." : "메뉴를 생성했습니다.");
          void onSaved();
        }}
      />
      {notice ? (
        <div className="pointer-events-none fixed bottom-6 right-6 z-50 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-[12px] font-semibold text-white shadow-lg">
          {notice}
        </div>
      ) : null}
    </main>
  );
}
