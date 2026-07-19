import { useEffect, useMemo, useState } from "react";
import { Drawer } from "../../../shared/ui/Drawer";
import { Button } from "../../../shared/ui/Button";
import { FormField } from "../../../shared/ui/FormField";
import { Input } from "../../../shared/ui/Input";
import { Select } from "../../../shared/ui/Select";
import { Checkbox } from "../../../shared/ui/Checkbox";
import type { AppMenuRecord, CreateMenuBody } from "../model/types";
import { appMenuApi } from "../api/appMenuApi";
import { buildMenuTree, collectDescendantIds, flattenTree } from "../lib/menuTree";

type Props = {
  token: string;
  open: boolean;
  menus: AppMenuRecord[];
  scopeLabel: string;
  target: AppMenuRecord | null;
  parentHintId: number | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<void> | void;
};

type FormState = {
  code: string;
  parentId: string;
  label: string;
  labelKey: string;
  path: string;
  icon: string;
  requiredRole: string;
  requiredPermission: string;
  visible: boolean;
  isExternal: boolean;
  displayOrder: string;
};

const emptyForm: FormState = {
  code: "",
  parentId: "",
  label: "",
  labelKey: "",
  path: "",
  icon: "",
  requiredRole: "",
  requiredPermission: "",
  visible: true,
  isExternal: false,
  displayOrder: "0",
};

function toCreateBody(form: FormState): CreateMenuBody {
  return {
    code: form.code.trim(),
    parentId: form.parentId ? Number(form.parentId) : null,
    label: form.label.trim(),
    labelKey: form.labelKey.trim() || null,
    path: form.path.trim() || null,
    icon: form.icon.trim() || null,
    isExternal: form.isExternal,
    requiredRole: form.requiredRole.trim() || null,
    requiredPermission: form.requiredPermission.trim() || null,
    visible: form.visible,
    displayOrder: Number(form.displayOrder) || 0,
  };
}

export function AppMenuFormDialog({
  token,
  open,
  menus,
  scopeLabel,
  target,
  parentHintId,
  onOpenChange,
  onSaved,
}: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const parentOptions = useMemo(() => {
    if (!open) return [];
    const blocked = target
      ? new Set([target.id, ...collectDescendantIds(menus, target.id)])
      : new Set<number>();
    const candidates = menus.filter((menu) => !blocked.has(menu.id));
    return flattenTree(buildMenuTree(candidates));
  }, [menus, open, target]);

  useEffect(() => {
    if (!open) return;
    if (target) {
      setForm({
        code: target.code,
        parentId: target.parentId == null ? "" : String(target.parentId),
        label: target.label,
        labelKey: target.labelKey ?? "",
        path: target.path ?? "",
        icon: target.icon ?? "",
        requiredRole: target.requiredRole ?? "",
        requiredPermission: target.requiredPermission ?? "",
        visible: target.visible,
        isExternal: target.isExternal,
        displayOrder: String(target.displayOrder),
      });
      return;
    }

    setForm({
      ...emptyForm,
      parentId: parentHintId == null ? "" : String(parentHintId),
      displayOrder: String(menus.filter((menu) => menu.parentId === parentHintId).length),
    });
  }, [menus, open, parentHintId, target]);

  const submit = async () => {
    if (!form.code.trim() && !target) {
      alert("코드를 입력해주세요.");
      return;
    }
    if (!form.label.trim()) {
      alert("메뉴 이름을 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      const body = toCreateBody(form);
      if (target) {
        await appMenuApi.update(token, target.id, {
          parentId: body.parentId,
          label: body.label,
          labelKey: body.labelKey,
          path: body.path,
          icon: body.icon,
          isExternal: body.isExternal,
          requiredRole: body.requiredRole,
          requiredPermission: body.requiredPermission,
          visible: body.visible,
          displayOrder: body.displayOrder,
        });
      } else {
        await appMenuApi.create(token, body);
      }
      await onSaved();
      onOpenChange(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "메뉴 저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={target ? `${scopeLabel} 메뉴 수정` : `${scopeLabel} 메뉴 생성`}
      description={target ? target.code : "새 메뉴를 생성합니다."}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            취소
          </Button>
          <Button onClick={() => void submit()} disabled={saving}>
            {saving ? "저장 중..." : "저장"}
          </Button>
        </>
      }
    >
      <div className="grid gap-3">
        {!target && (
          <FormField label="코드">
            <Input
              value={form.code}
              onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))}
              placeholder="ADMIN_APP_MENU_MANAGEMENT"
            />
          </FormField>
        )}
        <FormField label="부모 메뉴">
          <Select
            value={form.parentId}
            onChange={(event) => setForm((prev) => ({ ...prev, parentId: event.target.value }))}
          >
            <option value="">없음 (루트)</option>
            {parentOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label} ({item.code})
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="메뉴 이름">
          <Input
            value={form.label}
            onChange={(event) => setForm((prev) => ({ ...prev, label: event.target.value }))}
          />
        </FormField>
        <FormField label="경로">
          <Input
            value={form.path}
            onChange={(event) => setForm((prev) => ({ ...prev, path: event.target.value }))}
            placeholder="/app-menu-management"
          />
        </FormField>
        <FormField label="아이콘">
          <Input
            value={form.icon}
            onChange={(event) => setForm((prev) => ({ ...prev, icon: event.target.value }))}
            placeholder="Menu"
          />
        </FormField>
        <FormField label="필요 역할">
          <Input
            value={form.requiredRole}
            onChange={(event) => setForm((prev) => ({ ...prev, requiredRole: event.target.value }))}
            placeholder="ROLE_PLATFORM_ADMIN"
          />
        </FormField>
        <FormField label="표시 순서">
          <Input
            type="number"
            value={form.displayOrder}
            onChange={(event) => setForm((prev) => ({ ...prev, displayOrder: event.target.value }))}
          />
        </FormField>
        <div className="flex items-center gap-5 pt-1">
          <label className="inline-flex items-center gap-2 text-[13px] font-semibold text-zinc-700">
            <Checkbox
              checked={form.visible}
              onChange={(event) => setForm((prev) => ({ ...prev, visible: event.target.checked }))}
            />
            표시
          </label>
          <label className="inline-flex items-center gap-2 text-[13px] font-semibold text-zinc-700">
            <Checkbox
              checked={form.isExternal}
              onChange={(event) => setForm((prev) => ({ ...prev, isExternal: event.target.checked }))}
            />
            외부 링크
          </label>
        </div>
      </div>
    </Drawer>
  );
}
