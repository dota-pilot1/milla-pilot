"use client";

import { useEffect, useId, useState } from "react";
import type { ProjectTask, ProjectTaskGroup, ProjectTaskPayload } from "@/entities/project/model/types";
import { PROJECT_TASK_GROUP_LABEL, PROJECT_TASK_GROUPS } from "@/entities/project/model/types";
import { Button } from "@/shared/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import { FormField } from "@/shared/ui/FormField";
import { Textarea } from "@/shared/ui/Textarea";
import { TextInput } from "@/shared/ui/TextInput";

type ProjectTaskDialogProps = {
  open: boolean;
  task?: ProjectTask | null;
  defaultGroup: ProjectTaskGroup;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: ProjectTaskPayload) => void;
};

export function ProjectTaskDialog({
  open,
  task,
  defaultGroup,
  pending,
  onOpenChange,
  onSubmit,
}: ProjectTaskDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const orderId = useId();
  const [taskGroup, setTaskGroup] = useState<ProjectTaskGroup>(defaultGroup);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);

  useEffect(() => {
    if (!open) return;
    setTaskGroup(task?.taskGroup ?? defaultGroup);
    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setDisplayOrder(task?.displayOrder ?? 0);
  }, [defaultGroup, open, task]);

  const trimmedTitle = title.trim();
  const canSubmit = trimmedTitle.length > 0 && trimmedTitle.length <= 120;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "할 일 수정" : "할 일 추가"}</DialogTitle>
          <DialogDescription>프로젝트 관리용 체크리스트 항목을 저장합니다.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FormField label="그룹">
            <div className="flex flex-wrap gap-2">
              {PROJECT_TASK_GROUPS.map((group) => (
                <Button
                  key={group}
                  type="button"
                  variant={taskGroup === group ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTaskGroup(group)}
                >
                  {PROJECT_TASK_GROUP_LABEL[group]}
                </Button>
              ))}
            </div>
          </FormField>

          <FormField label="제목" htmlFor={titleId}>
            <TextInput
              id={titleId}
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 정산 대사 배치"
            />
          </FormField>

          <FormField label="설명" htmlFor={descriptionId}>
            <Textarea
              id={descriptionId}
              value={description}
              maxLength={500}
              rows={4}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="구현 이유나 완료 기준을 적어주세요."
            />
          </FormField>

          <FormField label="정렬 순서" htmlFor={orderId} hint="숫자가 작을수록 먼저 표시됩니다.">
            <TextInput
              id={orderId}
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
            />
          </FormField>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            취소
          </Button>
          <Button
            onClick={() =>
              onSubmit({
                taskGroup,
                title: trimmedTitle,
                description: description.trim() || null,
                displayOrder,
              })
            }
            disabled={!canSubmit || pending}
          >
            {pending ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
