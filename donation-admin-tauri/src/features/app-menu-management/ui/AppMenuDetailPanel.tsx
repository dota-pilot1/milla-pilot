import { AppWindow, Globe, Link2, ShieldCheck } from "lucide-react";
import type { AppMenuRecord } from "../model/types";
import { Panel, PanelHeader } from "../../../shared/ui/Panel";
import { AppMenuContextMenu } from "./AppMenuContextMenu";

type Props = {
  scopeLabel: string;
  selected: AppMenuRecord | null;
  saving: boolean;
  onCreateChild: () => void;
  onEdit: () => void;
  onToggleVisible: () => void;
  onDelete: () => void;
};

export function AppMenuDetailPanel({
  scopeLabel,
  selected,
  saving,
  onCreateChild,
  onEdit,
  onToggleVisible,
  onDelete,
}: Props) {
  if (!selected) return null;

  return (
    <Panel className="h-full">
      <PanelHeader
        title={selected.label}
        description={`${scopeLabel} · ${selected.code}`}
        action={
          <AppMenuContextMenu
            visible={selected.visible}
            disabled={saving}
            onCreateChild={onCreateChild}
            onEdit={onEdit}
            onToggleVisible={onToggleVisible}
            onDelete={onDelete}
          />
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <InfoCard title="메뉴 코드" value={selected.code} />
        <InfoCard title="경로" value={selected.path ?? "-"} />
        <InfoCard title="권한" value={selected.requiredRole ?? "공개"} icon={ShieldCheck} />
        <InfoCard title="표시 상태" value={selected.visible ? "표시" : "숨김"} />
        <InfoCard title="외부 링크" value={selected.isExternal ? "예" : "아니오"} icon={Link2} />
        <InfoCard title="순서" value={String(selected.displayOrder)} />
      </div>
      <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-[12px] text-zinc-600">
        <div className="flex items-center gap-2 font-bold text-zinc-800">
          {scopeLabel === "웹 메뉴" ? <Globe size={14} /> : <AppWindow size={14} />}
          다음 연결 대상
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <InfoBox label="부모 ID" value={selected.parentId == null ? "루트" : String(selected.parentId)} />
          <InfoBox label="권한" value={selected.requiredRole ?? "없음"} />
          <InfoBox label="세션" value={saving ? "저장 중" : "활성"} />
          <InfoBox label="라벨 키" value={selected.labelKey ?? "-"} />
        </div>
      </div>
    </Panel>
  );
}

function InfoCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon?: typeof ShieldCheck;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-zinc-500">
        {Icon ? <Icon size={12} /> : null}
        {title}
      </div>
      <div className="truncate text-[14px] font-bold text-zinc-900">{value}</div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-white px-2.5 py-2">
      <div className="text-[10px] font-bold text-zinc-500">{label}</div>
      <div className="truncate text-[13px] font-bold text-zinc-800">{value}</div>
    </div>
  );
}
