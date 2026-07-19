import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import { ChevronRight, GripVertical, Plus } from "lucide-react";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import type { AppMenuItem, AppMenuRecord } from "../model/types";

type Props = {
  items: AppMenuItem[];
  selectedId: number | null;
  saving: boolean;
  onSelect: (menu: AppMenuRecord) => void;
  onCreateRoot: () => void;
  onReorder: (updated: AppMenuRecord[]) => void;
};

export function AppMenuTreeSidebar({
  items,
  selectedId,
  saving,
  onSelect,
  onCreateRoot,
  onReorder,
}: Props) {
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({});
  const [query, setQuery] = useState("");
  const searching = query.trim().length > 0;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const filteredItems = useMemo(() => filterTree(items, query.trim().toLowerCase()), [items, query]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const flat = flattenWithParent(items);
    const activeItem = flat.find((item) => item.id === Number(active.id));
    if (!activeItem) return;

    const siblings = flat
      .filter((item) => item.parentId === activeItem.parentId)
      .sort((a, b) => a.displayOrder - b.displayOrder);
    const oldIndex = siblings.findIndex((item) => item.id === Number(active.id));
    const newIndex = siblings.findIndex((item) => item.id === Number(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(siblings, oldIndex, newIndex).map((item, index) => ({
      ...item,
      displayOrder: index,
    }));
    onReorder(reordered);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-3 flex items-center gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="검색"
          className="h-9"
        />
        <Button size="icon" className="h-9 w-9 shrink-0" onClick={onCreateRoot} title="루트 메뉴 추가">
          <Plus size={14} />
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-zinc-200 bg-zinc-50 p-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            {filteredItems.map((item) => (
              <TreeNode
                key={item.id}
                item={item}
                depth={0}
                selectedId={selectedId}
                disabled={saving || searching}
                openMap={openMap}
                onSelect={onSelect}
                onToggle={(id) => setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }))}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

function TreeNode({
  item,
  depth,
  selectedId,
  disabled,
  openMap,
  onSelect,
  onToggle,
}: {
  item: AppMenuItem;
  depth: number;
  selectedId: number | null;
  disabled: boolean;
  openMap: Record<number, boolean>;
  onSelect: (menu: AppMenuRecord) => void;
  onToggle: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
    disabled,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const selected = item.id === selectedId;
  const hasChildren = item.children.length > 0;
  const isOpen = hasChildren ? (openMap[item.id] ?? false) : false;

  return (
    <div ref={setNodeRef} style={style}>
      <button
        type="button"
        onClick={() => {
          onSelect(item);
          if (hasChildren) onToggle(item.id);
        }}
        className={`mb-1 flex w-full items-center gap-2 rounded-md border px-2 py-2 text-left ${
          selected
            ? "border-zinc-900 bg-zinc-900 text-white"
            : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
        }`}
        style={{ paddingLeft: depth * 16 + 8 }}
      >
        <span
          {...attributes}
          {...listeners}
          onClick={(event) => event.stopPropagation()}
          className={`rounded p-0.5 ${selected ? "cursor-grabbing text-white/80" : "cursor-grab text-zinc-400"}`}
        >
          <GripVertical size={14} />
        </span>
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
          <span className={`block truncate text-[11px] ${selected ? "text-white/70" : "text-zinc-400"}`}>
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
          <SortableContext
            items={item.children.map((child) => child.id)}
            strategy={verticalListSortingStrategy}
          >
            {item.children.map((child) => (
              <TreeNode
                key={child.id}
                item={child}
                depth={depth + 1}
                selectedId={selectedId}
                disabled={disabled}
                openMap={openMap}
                onSelect={onSelect}
                onToggle={onToggle}
              />
            ))}
          </SortableContext>
        </div>
      ) : null}
    </div>
  );
}

function flattenWithParent(items: AppMenuItem[]): AppMenuRecord[] {
  return items.flatMap((item) => [item, ...flattenWithParent(item.children)]);
}

function filterTree(items: AppMenuItem[], query: string): AppMenuItem[] {
  if (!query) return items;
  const filtered: AppMenuItem[] = [];
  for (const item of items) {
    const children = filterTree(item.children, query);
    const matched = item.label.toLowerCase().includes(query) || item.code.toLowerCase().includes(query);
    if (matched || children.length > 0) {
      filtered.push({ ...item, children });
    }
  }
  return filtered;
}
