import {
  Award,
  BookHeart,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ChalkAccent = "yellow" | "pink" | "sky";

export interface IntroSection {
  slug: string;
  tag: string;
  icon: LucideIcon;
  title: string;
  summary: string;
  ctaLabel: string;
  accent: ChalkAccent;
  /** false = 아직 실제 기능/콘텐츠가 없는 카드. 상세 페이지에서 "준비 중"으로 정직하게 안내한다. */
  ready: boolean;
}

/**
 * 프로젝트 소개 허브의 카드 목록. 각 카드는 /project-intro/{slug} 상세 페이지로 연결된다.
 * 카드 배치는 파일럿(donaschool.ai.studio)의 구성을 참고했지만 문구는 우리 제품 실제 구현 기준으로 새로 썼다.
 */
export const INTRO_SECTIONS: readonly IntroSection[] = [
  {
    slug: "story",
    tag: "STORY",
    icon: BookHeart,
    title: "설립 스토리",
    summary: "학교가 어떤 마음으로 시작됐는지, 기부회원을 왜 '키아(KIAH)'라고 부르는지 소개합니다.",
    ctaLabel: "자세히 읽기",
    accent: "yellow",
    ready: true,
  },
  {
    slug: "transparency",
    tag: "TRANSPARENCY",
    icon: ShieldCheck,
    title: "투명한 기부",
    summary: "기부자의 참여가 어떤 물품으로, 어떤 절차를 거쳐 시설에 전달되는지 단계별로 보여드립니다.",
    ctaLabel: "흐름 보기",
    accent: "sky",
    ready: true,
  },
  {
    slug: "benefits",
    tag: "BENEFITS",
    icon: Sparkles,
    title: "기부처 혜택",
    summary: "시설 담당 선생님들이 서류 작업 대신 아이들에게 필요한 것을 챙기는 데 집중할 수 있도록 돕습니다.",
    ctaLabel: "혜택 보기",
    accent: "pink",
    ready: true,
  },
  {
    slug: "honor",
    tag: "HONOR",
    icon: Award,
    title: "명예 홍보관",
    summary: "꾸준히 함께해 준 기부자와 단체를 기록하는 공간입니다. 다음 단계에서 준비하고 있습니다.",
    ctaLabel: "둘러보기",
    accent: "yellow",
    ready: false,
  },
  {
    slug: "community",
    tag: "COMMUNITY",
    icon: Users,
    title: "사랑터",
    summary: "기부자와 시설이 서로의 소식을 나누는 커뮤니티 공간입니다. 다음 단계에서 준비하고 있습니다.",
    ctaLabel: "입장하기",
    accent: "sky",
    ready: false,
  },
  {
    slug: "faq",
    tag: "FAQ",
    icon: HelpCircle,
    title: "자주 묻는 질문",
    summary: "후원 참여, 진행 상태, 영수증까지 자주 궁금해하시는 내용을 정리했습니다.",
    ctaLabel: "확인하기",
    accent: "pink",
    ready: true,
  },
] as const;

export function getIntroSection(slug: string): IntroSection | undefined {
  return INTRO_SECTIONS.find((section) => section.slug === slug);
}
