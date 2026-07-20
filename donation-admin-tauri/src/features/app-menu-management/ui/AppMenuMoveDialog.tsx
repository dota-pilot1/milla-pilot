import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { appMenuApi } from "../api/appMenuApi";
import { buildMenuTree, collectDescendantIds } from "../lib/menuTree";
import type { AppMenuItem, AppMenuRecord } from "../model/types";
import { Button } from "../../../shared/ui/Button";

type Props = {
  token: string;
  open: boolean;
  menu: AppMenuRecord;
  menus: AppMenuRecord[];
  scopeLabel: string;
  onOpenChange: (open: boolean) => void;
  onMoved: () => Promise<void> | void;
};

export function AppMenuMoveDialog({
  token,
  open,
  menu,
  menus,
  scopeLabel,
  onOpenChange,
  onMoved,
}: Props) {
  const [selectedParentId, setSelectedParentId] = useState<number | null>(menu.parentId);
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState(false);

  const blockedIds = useMemo(
    () => new Set([menu.id, ...collectDescendantIds(menus, menu.id)]),
    [menu.id, menus],
  );

  const candidates = useMemo(
    () => menus.filter((item) => !blockedIds.has(item.id)),
    [blockedIds, menus],
  );

  const tree = useMemo(() => buildMenuTree(candidates), [candidates]);
  const selectableParentIds = useMemo(
    () =>
      new Set(
        candidates
          .filter((candidate) => candidates.some((item) => item.parentId === candidate.id))
          .map((candidate) => candidate.id),
      ),
    [candidates],
  );
  const rootSelectable = useMemo(
    () => candidates.some((item) => item.parentId == null),
    [candidates],
  );

  useEffect(() => {
    if (!open) return;
    setSelectedParentId(menu.parentId);
  }, [menu.parentId, open]);

  if (!open) return null;

  const submit = async () => {
    if (selectedParentId === menu.parentId) return;
    if (selectedParentId !== null && !selectableParentIds.has(selectedParentId)) return;
    if (selectedParentId === null && !rootSelectable) return;

    setSaving(true);
    try {
      const nextOrder = menus.filter(
        (item) => item.parentId === selectedParentId && item.id !== menu.id,
      ).length;

      await appMenuApi.update(token, menu.id, {
        parentId: selectedParentId,
        label: menu.label,
        labelKey: menu.labelKey,
        path: menu.path,
        icon: menu.icon,
        isExternal: menu.isExternal,
        requiredRole: menu.requiredRole,
        requiredPermission: menu.requiredPermission,
        visible: menu.visible,
        displayOrder: nextOrder,
      });

      await onMoved();
      onOpenChange(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "폴더 이동에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/35 px-4">
      <div className="grid h-[min(82vh,760px)] w-full max-w-4xl grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">
        <header className="border-b border-zinc-200 px-5 py-4">
          <h2 className="text-[17px] font-extrabold text-zinc-950">{scopeLabel} 폴더 이동</h2>
          <p className="mt-1 text-[12px] text-zinc-500">&ldquo;{menu.label}&rdquo;의 이동할 폴더를 선택하세요.</p>
        </header>

        <div className="grid min-h-0 gap-4 p-4 md:grid-cols-[340px_minmax(0,1fr)]">
          <div className="min-h-0 overflow-auto rounded-2xl border border-zinc-200 bg-white p-2.5 shadow-sm">
            <button
              type="button"
              onClick={() => {
                if (!rootSelectable) return;
                setSelectedParentId(null);
              }}
              className={`mb-1 flex w-full items-center gap-2 rounded-xl border px-2.5 py-2.5 text-left transition-all ${
                selectedParentId == null
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900 shadow-sm"
                  : rootSelectable
                    ? "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                    : "border-zinc-200 bg-zinc-100 text-zinc-400"
              }`}
              disabled={!rootSelectable}
            >
              <span className="w-[14px]" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-bold">루트</span>
                <span className={`block truncate text-[11px] ${selectedParentId == null ? "text-emerald-700/80" : "text-zinc-400"}`}>
                  없음 (루트)
                </span>
              </span>
            </button>
            {tree.map((item) => (
              <MoveTreeNode
                key={item.id}
                item={item}
                depth={0}
                selectedId={selectedParentId}
                openMap={openMap}
                onSelect={setSelectedParentId}
                onToggle={(id) => setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }))}
              />
            ))}
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
            <p className="text-[12px] font-bold text-zinc-500">이동 정보</p>
            <div className="mt-3 space-y-2 text-[13px]">
              <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
                <div className="text-[11px] font-bold text-zinc-500">현재 메뉴</div>
                <div className="font-extrabold text-zinc-900">{menu.label}</div>
                <div className="text-[11px] text-zinc-500">{menu.code}</div>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
                <div className="text-[11px] font-bold text-zinc-500">이동할 폴더</div>
                <div className="font-extrabold text-zinc-900">
                  {selectedParentId == null
                    ? "루트"
                    : menus.find((item) => item.id === selectedParentId)?.label ?? "-"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="flex justify-end gap-2 border-t border-zinc-200 bg-zinc-50 px-5 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            취소
          </Button>
          <Button
          onClick={() => void submit()}
          disabled={
            saving ||
            selectedParentId === menu.parentId ||
            (selectedParentId === null && !rootSelectable) ||
            (selectedParentId !== null && !selectableParentIds.has(selectedParentId))
          }
          >
          {saving ? "이동 중..." : "폴더 이동"}
          </Button>
        </footer>
      </div>
    </div>
  );
}

function MoveTreeNode({
  item,
  depth,
  selectedId,
  openMap,
  onSelect,
  onToggle,
}: {
  item: AppMenuItem;
  depth: number;
  selectedId: number | null;
  openMap: Record<number, boolean>;
  onSelect: (id: number) => void;
  onToggle: (id: number) => void;
}) {
  const hasChildren = item.children.length > 0;
  const isOpen = hasChildren ? (openMap[item.id] ?? false) : false;
  const selected = item.id === selectedId;
  const selectable = hasChildren;

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (selectable) onSelect(item.id);
          if (hasChildren) onToggle(item.id);
        }}
        className={`mb-1 flex w-full items-center gap-2 rounded-xl border px-2.5 py-2.5 text-left transition-all ${
          selected
            ? "border-emerald-200 bg-emerald-50 text-emerald-900 shadow-sm"
            : selectable
              ? "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
              : "border-zinc-200 bg-zinc-100 text-zinc-400"
        }`}
        style={{ paddingLeft: depth * 16 + 10 }}
      >
        <span
          className={`rounded p-0.5 ${hasChildren ? "cursor-pointer" : "opacity-0"}`}
          onClick={(event) => {
            event.stopPropagation();
            if (hasChildren) onToggle(item.id);
          }}
          onKeyDown={(event) => {
            if (!hasChildren) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              event.stopPropagation();
              onToggle(item.id);
            }
          }}
          role="button"
          tabIndex={hasChildren ? 0 : -1}
          aria-label={hasChildren ? "하위 메뉴 열기/접기" : "하위 메뉴 없음"}
        >
          <ChevronRight
            size={14}
            className={`transition-transform ${isOpen ? "rotate-90" : ""}`}
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-bold">{item.label}</span>
          <span className={`block truncate text-[11px] ${selected ? "text-emerald-700/80" : "text-zinc-400"}`}>
            {item.code}
          </span>
        </span>
      </button>

      {hasChildren ? (
        <div
          className={`overflow-hidden transition-all duration-200 ease-out ${
            isOpen ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {item.children.map((child) => (
            <MoveTreeNode
              key={child.id}
              item={child}
              depth={depth + 1}
              selectedId={selectedId}
              openMap={openMap}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
