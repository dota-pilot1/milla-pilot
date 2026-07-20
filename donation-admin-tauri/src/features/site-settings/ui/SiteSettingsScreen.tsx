import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Check,
  ClipboardCopy,
  ExternalLink,
  FileCode2,
  Globe,
  MonitorCog,
  Server,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { Button } from "../../../shared/ui/Button";
import { Checkbox } from "../../../shared/ui/Checkbox";
import { Input } from "../../../shared/ui/Input";
import { Panel } from "../../../shared/ui/Panel";
import { StatusBadge } from "../../../shared/ui/StatusBadge";
import { Tabs, type TabItem } from "../../../shared/ui/Tabs";
import { cn } from "../../../shared/lib/cn";
import { PROJECT_PROFILES, type ProjectAreaId } from "../model/projectProfiles";

type ReleaseInfo = {
  tag: string;
  name: string;
  publishedAt: string;
  htmlUrl: string;
  status: "ready" | "none" | "error";
};

type TodoItem = {
  id: string;
  label: string;
  done: boolean;
  custom?: boolean;
};

type TodoStore = Record<ProjectAreaId, TodoItem[]>;

const TODO_STORAGE_KEY = "donation-admin:project-overview-todos:v1";
const RELEASE_FALLBACK: ReleaseInfo = {
  tag: "-",
  name: "릴리즈 없음",
  publishedAt: "",
  htmlUrl: "",
  status: "none",
};

const TAB_ITEMS: readonly TabItem<ProjectAreaId>[] = [
  { value: "front", label: "프론트", icon: Globe },
  { value: "backend", label: "백엔드", icon: Server },
  { value: "admin", label: "관리자 앱", icon: ShieldCheck },
  { value: "dev", label: "개발 관리 앱", icon: Wrench },
];

function makeDefaultTodos(): TodoStore {
  return PROJECT_PROFILES.reduce(
    (acc, profile) => {
      acc[profile.id] = profile.todoTemplates.map((template) => ({
        id: template.id,
        label: template.label,
        done: false,
      }));
      return acc;
    },
    {} as TodoStore,
  );
}

function mergeTodosWithDefaults(defaults: TodoStore, incoming: Partial<TodoStore> | null): TodoStore {
  if (!incoming) return defaults;
  const next = { ...defaults };

  for (const profile of PROJECT_PROFILES) {
    const saved = incoming[profile.id];
    if (!saved) continue;

    const baseById = new Map(next[profile.id].map((todo) => [todo.id, todo]));
    const mergedBase = next[profile.id].map((todo) => {
      const savedTodo = saved.find((item) => item.id === todo.id);
      return savedTodo ? { ...todo, done: savedTodo.done } : todo;
    });
    const custom = saved.filter((item) => item.custom && !baseById.has(item.id));
    next[profile.id] = [...mergedBase, ...custom];
  }

  return next;
}

function releaseDateLabel(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function SiteSettingsScreen() {
  const [tab, setTab] = useState<ProjectAreaId>("front");
  const [draftTodo, setDraftTodo] = useState("");
  const [copiedKey, setCopiedKey] = useState("");
  const [copyNotice, setCopyNotice] = useState("");
  const [releasesByRepo, setReleasesByRepo] = useState<Record<string, ReleaseInfo>>({});
  const [todosByArea, setTodosByArea] = useState<TodoStore>(() => {
    const defaults = makeDefaultTodos();
    try {
      const raw = localStorage.getItem(TODO_STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw) as Partial<TodoStore>;
      return mergeTodosWithDefaults(defaults, parsed);
    } catch {
      return defaults;
    }
  });

  useEffect(() => {
    localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todosByArea));
  }, [todosByArea]);

  useEffect(() => {
    const repos = [...new Set(PROJECT_PROFILES.map((profile) => profile.repo))];
    let canceled = false;

    const loadReleases = async () => {
      const entries = await Promise.all(
        repos.map(async (repo) => {
          try {
            const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`);
            if (response.status === 404) return [repo, RELEASE_FALLBACK] as const;
            if (!response.ok) {
              return [
                repo,
                {
                  tag: "-",
                  name: "릴리즈 조회 실패",
                  publishedAt: "",
                  htmlUrl: "",
                  status: "error",
                } satisfies ReleaseInfo,
              ] as const;
            }

            const data = (await response.json()) as {
              tag_name?: string;
              name?: string;
              published_at?: string;
              html_url?: string;
            };

            return [
              repo,
              {
                tag: data.tag_name ?? "-",
                name: data.name || data.tag_name || "Latest Release",
                publishedAt: data.published_at ?? "",
                htmlUrl: data.html_url ?? "",
                status: "ready",
              } satisfies ReleaseInfo,
            ] as const;
          } catch {
            return [
              repo,
              {
                tag: "-",
                name: "릴리즈 조회 실패",
                publishedAt: "",
                htmlUrl: "",
                status: "error",
              } satisfies ReleaseInfo,
            ] as const;
          }
        }),
      );

      if (!canceled) {
        setReleasesByRepo(Object.fromEntries(entries));
      }
    };

    void loadReleases();
    return () => {
      canceled = true;
    };
  }, []);

  const current = useMemo(
    () => PROJECT_PROFILES.find((profile) => profile.id === tab) ?? PROJECT_PROFILES[0],
    [tab],
  );
  const currentTodos = todosByArea[current.id];
  const doneCount = currentTodos.filter((todo) => todo.done).length;
  const release = releasesByRepo[current.repo];

  const toggleTodo = (todoId: string, checked: boolean) => {
    setTodosByArea((prev) => ({
      ...prev,
      [current.id]: prev[current.id].map((todo) => (todo.id === todoId ? { ...todo, done: checked } : todo)),
    }));
  };

  const addTodo = () => {
    const label = draftTodo.trim();
    if (!label) return;
    setTodosByArea((prev) => ({
      ...prev,
      [current.id]: [
        ...prev[current.id],
        { id: `custom-${current.id}-${Date.now()}`, label, done: false, custom: true },
      ],
    }));
    setDraftTodo("");
  };

  const removeTodo = (todoId: string) => {
    setTodosByArea((prev) => ({
      ...prev,
      [current.id]: prev[current.id].filter((todo) => todo.id !== todoId),
    }));
  };

  const resetCurrentTodos = () => {
    setTodosByArea((prev) => ({
      ...prev,
      [current.id]: makeDefaultTodos()[current.id],
    }));
  };

  const copyText = async (key: string, text: string) => {
    if (!navigator.clipboard?.writeText) {
      setCopyNotice("클립보드 접근 불가");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setCopyNotice("복사 완료");
      window.setTimeout(() => setCopiedKey(""), 1200);
    } catch {
      setCopyNotice("복사 실패");
    }
  };

  return (
    <main className="workspace-page space-y-6 bg-[#f7f8fa]">
      <section className="workspace-hero dense">
        <div className="workspace-hero-mark">
          <MonitorCog size={24} />
        </div>
        <div className="workspace-hero-copy">
          <p className="eyebrow">DonationPlatform Admin</p>
          <h1>사이트 설정</h1>
          <p>프로젝트 정보 요약</p>
        </div>
      </section>

      <Tabs items={TAB_ITEMS} value={tab} onValueChange={setTab} />

      <Panel className="space-y-5 p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-extrabold tracking-tight text-zinc-900">{current.label}</h2>
            <p className="mt-1 text-[13px] text-zinc-500">{current.subtitle}</p>
          </div>
          <StatusBadge tone="info">{copyNotice || "요약 정보"}</StatusBadge>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard title="GitHub 저장소" value={current.repo} sub={current.directory} />
          <SummaryCard
            title="최신 릴리즈"
            value={release?.name ?? "조회 중..."}
            sub={`${release?.tag ?? "-"} · ${releaseDateLabel(release?.publishedAt ?? "")}`}
            action={
              release?.htmlUrl ? (
                <a
                  href={release.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-500 hover:text-zinc-800"
                >
                  열기
                  <ExternalLink size={12} />
                </a>
              ) : null
            }
          />
          <SummaryCard title="역할" value={current.role} sub="담당 범위" />
        </div>

        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <FileCode2 size={16} className="text-zinc-500" />
            <h3 className="text-[14px] font-extrabold text-zinc-900">실행 명령어 / 복붙 블록</h3>
          </div>
          <div className="space-y-2.5">
            {current.runCommands.map((command, index) => (
              <CopyRow
                key={command}
                label={`실행 ${index + 1}`}
                value={command}
                copied={copiedKey === `run-${index}`}
                onCopy={() => void copyText(`run-${index}`, command)}
              />
            ))}
            {current.copyBlocks.map((block) => (
              <CopyRow
                key={block.label}
                label={block.label}
                value={block.value}
                copied={copiedKey === block.label}
                onCopy={() => void copyText(block.label, block.value)}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Wrench size={16} className="text-zinc-500" />
              <h3 className="text-[14px] font-extrabold text-zinc-900">Todo 체크리스트</h3>
              <StatusBadge tone="success">
                {doneCount}/{currentTodos.length}
              </StatusBadge>
            </div>
            <Button size="sm" variant="outline" onClick={resetCurrentTodos}>
              기본값 복원
            </Button>
          </div>
          <div className="space-y-2">
            {currentTodos.map((todo) => (
              <label
                key={todo.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50/70 px-3 py-2.5",
                  todo.done && "border-emerald-200 bg-emerald-50/50",
                )}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Checkbox
                    checked={todo.done}
                    onChange={(event) => toggleTodo(todo.id, event.target.checked)}
                  />
                  <span className={cn("truncate text-[13px] font-semibold text-zinc-700", todo.done && "text-zinc-500 line-through")}>
                    {todo.label}
                  </span>
                </span>
                {todo.custom ? (
                  <button
                    type="button"
                    onClick={() => removeTodo(todo.id)}
                    className="text-[11px] font-bold text-zinc-400 hover:text-zinc-700"
                  >
                    삭제
                  </button>
                ) : null}
              </label>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Input
              value={draftTodo}
              onChange={(event) => setDraftTodo(event.target.value)}
              placeholder={`${current.label} Todo 추가`}
              className="h-10 rounded-xl border-zinc-200 bg-zinc-50"
            />
            <Button size="sm" onClick={addTodo}>
              추가
            </Button>
          </div>
        </section>
      </Panel>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  sub,
  action,
}: {
  title: string;
  value: string;
  sub: string;
  action?: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12px] font-bold text-zinc-500">{title}</p>
        {action}
      </div>
      <p className="mt-1.5 line-clamp-2 text-[19px] font-extrabold leading-tight tracking-tight text-zinc-950">{value}</p>
      <p className="mt-2 break-all text-[12px] text-zinc-500">{sub}</p>
    </article>
  );
}

function CopyRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold text-zinc-500">{label}</p>
        <Button size="sm" variant="outline" onClick={onCopy}>
          {copied ? <Check size={13} /> : <ClipboardCopy size={13} />}
          {copied ? "복사됨" : "복사"}
        </Button>
      </div>
      <code className="block overflow-x-auto whitespace-nowrap text-[12px] font-semibold text-zinc-800">
        {value}
      </code>
    </div>
  );
}
