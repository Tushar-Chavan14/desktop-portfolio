"use client";

import { useCallback, useState, type ReactNode } from "react";
import { ContextMenu } from "./ContxtMenu";

/**
 * Wraps the desktop surface. Right-clicking the wallpaper or icons shows the
 * desktop menu; inside windows the browser's own menu still works (copy, etc.).
 */
export default function DesktopContextMenu({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const close = useCallback(() => setMenu(null), []);

  return (
    <div
      className="h-full w-full"
      onContextMenu={(e) => {
        e.preventDefault();
        setMenu({ x: e.clientX, y: e.clientY });
      }}
    >
      {children}
      {menu && <ContextMenu key={`${menu.x}-${menu.y}`} x={menu.x} y={menu.y} onClose={close} />}
    </div>
  );
}
