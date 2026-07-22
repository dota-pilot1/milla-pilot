"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ListChecks, Plus } from "lucide-react";
import { projectTaskApi } from "@/entities/project/api/projectTaskApi";
import {
  PROJECT_TASK_GROUP_LABEL,
  PROJECT_TASK_GROUP_NOTE,
  PROJECT_TASK_GROUP_VARIANT,
  PROJECT_TASK_GROUPS,
  type ProjectTask,
  type ProjectTaskGroup,
  type ProjectTaskPayload,
} from "@/entities/project/model/types";
import { ProjectTaskItem } from "@/entities/project/ui/ProjectTaskItem";
import { toast, toastError } from "@/shared/lib/toast";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ProjectTaskDialog } from "./ProjectTaskDialog";

export function ProjectTaskManager() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [defaultGroup, setDefaultGroup] = useState<ProjectTaskGroup>("PRE_LAUNCH_REQUIRED");

  const { data: tasks = [], isLoading, isError } = useQuery({
    queryKey: ["project-tasks"],
    queryFn: projectTaskApi.getAll,
  });

  const grouped = useMemo(() => {
    return PROJECT_TASK_GROUPS.map((group) => ({
      group,
      todo: tasks.filter((task) => task.taskGroup === group && task.status === "TODO"),
      done: tasks.filter((task) => task.taskGroup === group && task.status === "DONE"),
    }));
  }, [tasks]);

  const createMutation = useMutation({
    mutationFn: projectTaskApi.create,
    onSuccess: () => {
      toast.success("할 일이 추가되었습니다.");
      setDialogOpen(false);
      qc.invalidateQueries({ queryKey: ["project-tasks"] });
    },
    onError: (e) => toastError(e, "할 일 추가에 실패했습니다."),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProjectTaskPayload }) =>
      projectTaskApi.update(id, payload),
    onSuccess: () => {
      toast.success("할 일이 수정되었습니다.");
      setDialogOpen(false);
      setEditingTask(null);
      qc.invalidateQueries({ queryKey: ["project-tasks"] });
    },
    onError: (e) => toastError(e, "할 일 수정에 실패했습니다."),
  });

  const statusMutation = useMutation({
    mutationFn: (task: ProjectTask) =>
      projectTaskApi.updateStatus(task.id, task.status === "DONE" ? "TODO" : "DONE"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project-tasks"] });
    },
    onError: (e) => toastError(e, "완료 상태 변경에 실패했습니다."),
  });

  const deleteMutation = useMutation({
    mutationFn: projectTaskApi.delete,
    onSuccess: () => {
      toast.success("할 일이 삭제되었습니다.");
      qc.invalidateQueries({ queryKey: ["project-tasks"] });
    },
    onError: (e) => toastError(e, "할 일 삭제에 실패했습니다."),
  });

  const openCreate = (group: ProjectTaskGroup) => {
    setDefaultGroup(group);
    setEditingTask(null);
    setDialogOpen(true);
  };

  const openEdit = (task: ProjectTask) => {
    setDefaultGroup(task.taskGroup);
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleSubmit = (payload: ProjectTaskPayload) => {
    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, payload });
      return;
    }
    createMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-xl border bg-muted/40" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="할 일을 불러오지 못했습니다."
        description="서버가 켜져 있는지 확인한 뒤 다시 시도해주세요."
      />
    );
  }

  return (
    <>
      <div className="space-y-5">
        {grouped.map(({ group, todo, done }) => (
          <section key={group} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={PROJECT_TASK_GROUP_VARIANT[group]}>
                  {PROJECT_TASK_GROUP_LABEL[group]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {PROJECT_TASK_GROUP_NOTE[group]}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => openCreate(group)}>
                <Plus className="size-4" />
                추가
              </Button>
            </div>

            {todo.length === 0 && done.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title="등록된 할 일이 없습니다."
                description="이 그룹에 필요한 작업을 추가해주세요."
                className="py-10"
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {todo.map((task) => (
                  <ProjectTaskItem
                    key={task.id}
                    task={task}
                    busy={statusMutation.isPending}
                    onToggle={(next) => statusMutation.mutate(next)}
                    onEdit={openEdit}
                    onDelete={(next) => deleteMutation.mutate(next.id)}
                  />
                ))}
              </div>
            )}

            {done.length > 0 ? (
              <details className="group rounded-xl border bg-muted/30 p-3">
                <summary className="cursor-pointer text-sm font-semibold">
                  완료 목록 {done.length}개
                </summary>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {done.map((task) => (
                    <ProjectTaskItem
                      key={task.id}
                      task={task}
                      busy={statusMutation.isPending}
                      onToggle={(next) => statusMutation.mutate(next)}
                      onEdit={openEdit}
                      onDelete={(next) => deleteMutation.mutate(next.id)}
                    />
                  ))}
                </div>
              </details>
            ) : null}
          </section>
        ))}
      </div>

      <ProjectTaskDialog
        open={dialogOpen}
        task={editingTask}
        defaultGroup={defaultGroup}
        pending={createMutation.isPending || updateMutation.isPending}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
      />
    </>
  );
}
