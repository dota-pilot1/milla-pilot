"use client";

import { Check, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/Button";
import type { ProjectTask } from "../model/types";

type ProjectTaskItemProps = {
  task: ProjectTask;
  busy?: boolean;
  onToggle: (task: ProjectTask) => void;
  onEdit: (task: ProjectTask) => void;
  onDelete: (task: ProjectTask) => void;
};

export function ProjectTaskItem({
  task,
  busy,
  onToggle,
  onEdit,
  onDelete,
}: ProjectTaskItemProps) {
  const done = task.status === "DONE";

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border bg-background p-3 transition-colors",
        done && "bg-muted/40",
      )}
    >
      <button
        type="button"
        disabled={busy}
        onClick={() => onToggle(task)}
        aria-label={done ? "미완료로 변경" : "완료로 변경"}
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
          done
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input bg-card hover:bg-accent",
        )}
      >
        {done ? <Check className="size-3.5" /> : null}
      </button>

      <div className="min-w-0 flex-1">
        <h3 className={cn("text-sm font-semibold", done && "text-muted-foreground line-through")}>
          {task.title}
        </h3>
        {task.description ? (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{task.description}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-start gap-1">
        <Button variant="ghost" size="icon" className="size-8" onClick={() => onEdit(task)}>
          <Pencil className="size-4" />
          <span className="sr-only">수정</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-destructive hover:text-destructive"
          onClick={() => onDelete(task)}
        >
          <Trash2 className="size-4" />
          <span className="sr-only">삭제</span>
        </Button>
      </div>
    </div>
  );
}
