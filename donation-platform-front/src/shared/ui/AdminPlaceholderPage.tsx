"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { Card } from "@/shared/ui/Card";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageShell } from "@/shared/ui/PageShell";

type AdminPlaceholderPageProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  tasks: string[];
};

export function AdminPlaceholderPage({
  title,
  description,
  icon: Icon,
  tasks,
}: AdminPlaceholderPageProps) {
  return (
    <PageShell className="space-y-6">
      <PageHeader
        icon={Icon}
        title={title}
        description={description}
        actions={
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-card px-3 text-sm font-semibold transition-colors hover:bg-accent"
          >
            <LayoutDashboard className="size-4" />
            대시보드
          </Link>
        }
      />

      <Card className="overflow-hidden">
        <div className="border-b bg-muted/40 px-5 py-3">
          <h2 className="text-sm font-semibold">구현 예정 범위</h2>
        </div>
        <div className="grid gap-3 p-5">
          {tasks.map((task) => (
            <div
              key={task}
              className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3"
            >
              <span className="text-sm font-medium">{task}</span>
              <ArrowRight className="size-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}
