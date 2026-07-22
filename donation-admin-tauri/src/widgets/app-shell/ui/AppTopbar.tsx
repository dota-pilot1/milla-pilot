import { getCurrentWindow } from "@tauri-apps/api/window";
import type { MouseEvent } from "react";
import { Palette } from "lucide-react";
import type { AdminMenu } from "../../../app/model/navigation";
import { WindowControls } from "./WindowControls";

export type AdminFrameTheme = "mint" | "sky" | "violet" | "rose";

type AppTopbarProps = {
  activeWebMenu: AdminMenu;
  activeMenu?: string;
  frameTheme: AdminFrameTheme;
  onFrameThemeChange: (theme: AdminFrameTheme) => void;
};

const frameThemeOptions: Array<{ value: AdminFrameTheme; label: string }> = [
  { value: "mint", label: "민트" },
  { value: "sky", label: "하늘" },
  { value: "violet", label: "보라" },
  { value: "rose", label: "장미" },
];

export function AppTopbar({ activeWebMenu, frameTheme, onFrameThemeChange }: AppTopbarProps) {
  const ActiveWebMenuIcon = activeWebMenu.icon;
  const win = getCurrentWindow();
  const handleDragStart = (event: MouseEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    void win.startDragging();
  };
  const handleDoubleClick = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest(".window-controls")) return;
    void win.toggleMaximize();
  };

  return (
    <header className="topbar" onMouseDown={handleDragStart} onDoubleClick={handleDoubleClick}>
      <div className="brand compact">
        <div className="brand-mark">
          <ActiveWebMenuIcon size={18} />
        </div>
        <div>
          <strong>{activeWebMenu.label}</strong>
        </div>
      </div>
      <div className="topbar-actions" onMouseDown={(event) => event.stopPropagation()}>
        <label className="theme-picker">
          <Palette size={15} />
          <select
            value={frameTheme}
            aria-label="테마 선택"
            onChange={(event) => onFrameThemeChange(event.target.value as AdminFrameTheme)}
          >
            {frameThemeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <WindowControls />
      </div>
    </header>
  );
}
