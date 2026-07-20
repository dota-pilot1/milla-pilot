import { Eye, EyeOff, FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "../../../shared/ui/Button";

type Props = {
  visible: boolean;
  disabled?: boolean;
  onCreateChild: () => void;
  onMoveFolder: () => void;
  onEdit: () => void;
  onToggleVisible: () => void;
  onDelete: () => void;
};

export function AppMenuContextMenu({
  visible,
  disabled = false,
  onCreateChild,
  onMoveFolder,
  onEdit,
  onToggleVisible,
  onDelete,
}: Props) {
  return (
    <div className="flex items-center gap-1">
      <Button size="sm" variant="outline" onClick={onCreateChild} disabled={disabled}>
        <Plus size={13} />
        하위
      </Button>
      <Button size="sm" variant="outline" onClick={onMoveFolder} disabled={disabled}>
        <FolderTree size={13} />
        폴더 이동
      </Button>
      <Button size="sm" variant="outline" onClick={onEdit} disabled={disabled}>
        <Pencil size={13} />
        수정
      </Button>
      <Button size="sm" variant="outline" onClick={onToggleVisible} disabled={disabled}>
        {visible ? <EyeOff size={13} /> : <Eye size={13} />}
        {visible ? "숨김" : "표시"}
      </Button>
      <Button size="sm" variant="destructive" onClick={onDelete} disabled={disabled}>
        <Trash2 size={13} />
        삭제
      </Button>
    </div>
  );
}
