"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/Badge";
import type { ChalkAccent } from "../model/sections";
import { CHALK_ACCENT_TEXT } from "../model/accent";

interface WallMessage {
  id: number;
  author: string;
  color: ChalkAccent;
  text: string;
}

const ACCENT_OPTIONS: readonly ChalkAccent[] = ["yellow", "pink", "sky"];

const ACCENT_DOT: Record<ChalkAccent, string> = {
  yellow: "bg-chalk-yellow",
  pink: "bg-chalk-pink",
  sky: "bg-chalk-sky",
};

/** 화면 로드시 보여줄 예시 메모 — 우리 서비스 실제 흐름(사이즈 옵션·수령확인 사진)을 반영해 새로 씀. */
const SEED_MESSAGES: readonly WallMessage[] = [
  { id: 1, author: "조용한키아", color: "yellow", text: "품목마다 신발 사이즈까지 나와 있어서 딱 필요한 것만 골라 담을 수 있었어요." },
  { id: 2, author: "매달참여중", color: "pink", text: "시설 선생님이 올려주신 수령확인 사진을 보니 진짜 도착했구나 싶어 마음이 놓였습니다." },
  { id: 3, author: "익명의응원", color: "sky", text: "목표 금액이 채워지는 걸 실시간으로 보는 재미가 있네요. 다음 물품도 함께할게요." },
];

const MAX_LENGTH = 120;

/**
 * UI 프로토타입 — 백엔드 연동 없음. 새로고침하면 예시 메모로 초기화된다.
 * design-system.md §6-6 "UI 프로토타입 표시 규칙" 준수: 저장 안 됨을 배지로 명시, API 호출 없음.
 */
export function MessageWallPrototype() {
  const [messages, setMessages] = React.useState<WallMessage[]>([...SEED_MESSAGES]);
  const [author, setAuthor] = React.useState("");
  const [text, setText] = React.useState("");
  const [color, setColor] = React.useState<ChalkAccent>("yellow");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setMessages((prev) => [
      { id: Date.now(), author: author.trim() || "익명의키아", color, text: text.trim() },
      ...prev,
    ]);
    setText("");
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-chalkboard px-5 py-10 ring-1 ring-chalkboard-line sm:px-10 sm:py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.28))]"
      />

      <div className="relative flex flex-wrap items-center justify-center gap-2 text-center">
        <p className="font-display text-2xl text-chalk">사랑의 온기 나누기</p>
        <Badge variant="outline" className="border-chalk/30 text-chalk/70">
          UI 프로토타입 · 저장되지 않음
        </Badge>
      </div>
      <p className="relative mx-auto mt-3 max-w-md text-center text-sm leading-6 text-chalk/75">
        칠판 위에 짧은 메모를 남겨보세요. 지금은 화면 안에서만 보이는 시험 버전입니다.
      </p>

      {/* 작성 폼 */}
      <form
        onSubmit={handleSubmit}
        className="relative mx-auto mt-8 max-w-xl space-y-3 rounded-2xl bg-chalk/[0.04] p-5 ring-1 ring-chalkboard-line"
      >
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="닉네임 (선택)"
          maxLength={20}
          className="w-full rounded-lg bg-transparent px-3 py-2 text-sm text-chalk placeholder:text-chalk/40 ring-1 ring-chalk/20 focus:outline-none focus:ring-chalk/50"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
          placeholder="따뜻한 한마디를 남겨주세요"
          rows={3}
          className="w-full resize-none rounded-lg bg-transparent px-3 py-2 text-sm text-chalk placeholder:text-chalk/40 ring-1 ring-chalk/20 focus:outline-none focus:ring-chalk/50"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-chalk/60">분필 색상</span>
            {ACCENT_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setColor(option)}
                aria-label={`${option} 색상 선택`}
                className={cn(
                  "size-5 rounded-full ring-2 ring-offset-2 ring-offset-chalkboard transition-transform",
                  ACCENT_DOT[option],
                  color === option ? "ring-chalk scale-110" : "ring-transparent",
                )}
              />
            ))}
          </div>
          <span className="text-xs text-chalk/50">
            {text.length} / {MAX_LENGTH}자
          </span>
        </div>
        <button
          type="submit"
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-cta font-display text-sm text-cta-foreground transition-opacity hover:opacity-90"
        >
          <Send className="size-4" />
          칠판에 붙이기
        </button>
      </form>

      {/* 메모 목록 */}
      <div className="relative mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className="rounded-xl bg-chalk/[0.04] p-4 text-left ring-1 ring-chalkboard-line"
          >
            <span className={cn("inline-block size-2 rounded-full", ACCENT_DOT[message.color])} />
            <p className={cn("mt-2 text-sm leading-6", CHALK_ACCENT_TEXT[message.color])}>{message.text}</p>
            <p className="mt-2 text-xs text-chalk/50">by {message.author}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
