import type { Metadata } from "next";
import { Gaegu, Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { QueryProvider } from "./QueryProvider";
import { AuthInitializer } from "./AuthInitializer";
import { Header } from "@/widgets/header";
import { ThemeInitializer } from "@/shared/ui/theme/ThemeInitializer";
import { I18nProvider } from "@/shared/i18n/I18nProvider";

// 저장된 테마가 없으면 브랜드 기본(haggyo)을 적용한다. 무채색은 사용자가 직접 고른 경우에만.
const THEMES = ["haggyo", "coral", "amber", "sky", "rose"];
const themeNoFlashScript = `(function(){try{var t=localStorage.getItem("theme-color");if(${JSON.stringify(THEMES)}.indexOf(t)<0)t="haggyo";document.documentElement.setAttribute("data-theme",t);}catch(e){document.documentElement.setAttribute("data-theme","haggyo");}})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** 브랜드 디스플레이(손글씨) 폰트 — 헤딩·브랜드 문구 전용. 본문에는 쓰지 않는다(design-system.md). */
const gaegu = Gaegu({
  weight: ["400", "700"],
  variable: "--font-gaegu",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "학교 — 마음을 잇는 기부 플랫폼",
  description: "후원 물품 공동구매 펀딩 시스템",
  icons: { icon: "/haggyo-mark.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 기본 언어는 한국어. i18n 전환 시 lang 을 따라 바꾸는 건 별도 처리.
    <html lang="ko" data-theme="haggyo" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeNoFlashScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${gaegu.variable} antialiased`}
      >
        <ThemeInitializer />
        <I18nProvider>
          <QueryProvider>
            <AuthInitializer>
              <Header>{children}</Header>
            </AuthInitializer>
          </QueryProvider>
        </I18nProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
