"use client";

import { useState } from "react";
import { Bookmark, NotebookPen, UserRound } from "lucide-react";
import { RequireAuth } from "@/widgets/guards/RequireAuth";
import { useAuth } from "@/entities/user/model/authStore";
import { Card } from "@/shared/ui/Card";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageShell } from "@/shared/ui/PageShell";
import { Tabs, TabPanel, type TabItem } from "@/shared/ui/Tabs";

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}

type Tab = "info" | "memo" | "bookmarks";

const TABS: readonly TabItem<Tab>[] = [
  { value: "info", label: "기본 정보", icon: UserRound },
  { value: "memo", label: "메모장", icon: NotebookPen },
  { value: "bookmarks", label: "즐겨찾기", icon: Bookmark },
];

function ProfileContent() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("info");

  if (!user) return null;

  const initials = (user.username ?? "?").slice(0, 2).toUpperCase();

  return (
    <PageShell className="space-y-6">
      <PageHeader
        icon={UserRound}
        title={user.username}
        description={`${user.email} · ${user.role.name}`}
      />

      <div className="flex flex-col gap-6 items-start lg:flex-row">
        {/* 왼쪽: 탭 본문 */}
        <div className="w-full min-w-0 flex-1 space-y-4">
          <Tabs items={TABS} value={tab} onValueChange={setTab} idPrefix="profile" />

          {tab === "info" && (
            <TabPanel value="info" idPrefix="profile" className="space-y-4">
              <Section title="계정 정보">
                <Row label="이름" value={user.username} />
                <Row label="이메일" value={user.email} />
                <Row label="역할" value={user.role.name} />
              </Section>
              <Section title="보유 권한">
                {user.permissions.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-muted-foreground">권한이 없습니다.</p>
                ) : (
                  <div className="flex flex-wrap gap-2 px-5 py-4">
                    {user.permissions.map((perm) => (
                      <span
                        key={perm}
                        className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                )}
              </Section>
            </TabPanel>
          )}

          {tab === "memo" && (
            <TabPanel value="memo" idPrefix="profile">
              <Section title="메모장">
                <div className="p-5">
                  <textarea
                    className="h-64 w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    placeholder="메모를 입력하세요..."
                  />
                </div>
              </Section>
            </TabPanel>
          )}

          {tab === "bookmarks" && (
            <TabPanel value="bookmarks" idPrefix="profile">
              <Section title="즐겨찾기">
                <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
                  즐겨찾기가 없습니다.
                </div>
              </Section>
            </TabPanel>
          )}
        </div>

        {/* 오른쪽: 사이드바 */}
        <aside className="w-full shrink-0 lg:w-60">
          <Card className="overflow-hidden">
            <div className="flex flex-col items-center gap-2 border-b bg-muted/40 px-5 py-6">
              <div className="flex size-16 select-none items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                {initials}
              </div>
              <span className="text-sm font-semibold">{user.username}</span>
              <span className="inline-flex items-center rounded-full border bg-card px-2.5 py-0.5 text-xs font-medium">
                {user.role.name}
              </span>
            </div>
            <div className="divide-y">
              <MetaRow label="이메일" value={user.email} />
              <MetaRow label="권한 수" value={`${user.permissions.length}개`} />
            </div>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b bg-muted/40 px-5 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center border-b px-5 py-3 last:border-0">
      <span className="w-20 shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-sm">{value}</p>
    </div>
  );
}
