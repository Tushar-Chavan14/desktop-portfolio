"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import type { IconType } from "react-icons";
import {
  PiArrowClockwiseBold,
  PiDotsNineBold,
  PiImageSquareBold,
  PiInfoBold,
  PiSignpostBold,
  PiSquaresFourBold,
  PiTerminalWindowBold,
} from "react-icons/pi";
import useModalStore from "@src/store/zustore/UseModalStore";
import useWindowStore from "@src/store/zustore/useWindowStore";
import useShellStore from "@src/store/zustore/useShellStore";
import useDesktopStore from "@src/store/zustore/useDesktopStore";
import { Z } from "@src/constants/layout";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

type MenuEntry = { id: string; label: string; icon: IconType; action: () => void } | { id: string; separator: true };

export const ContextMenu = ({ x, y, onClose }: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });
  const openModal = useModalStore((s) => s.openModal);
  const openApp = useWindowStore((s) => s.openApp);
  const openActivities = useShellStore((s) => s.openActivities);
  const startTour = useShellStore((s) => s.startTour);
  const resetPositions = useDesktopStore((s) => s.resetPositions);

  const entries: MenuEntry[] = [
    { id: "terminal", label: "Open terminal", icon: PiTerminalWindowBold, action: () => openApp("terminal") },
    { id: "apps", label: "Show apps", icon: PiDotsNineBold, action: openActivities },
    { id: "sep-1", separator: true },
    { id: "wallpaper", label: "Change wallpaper...", icon: PiImageSquareBold, action: () => openModal("CHANGE_BACKGROUND", {}) },
    { id: "arrange", label: "Arrange icons", icon: PiSquaresFourBold, action: resetPositions },
    { id: "sep-2", separator: true },
    { id: "tour", label: "Take the tour", icon: PiSignpostBold, action: startTour },
    { id: "welcome", label: "About this desktop", icon: PiInfoBold, action: () => openApp("welcome") },
    { id: "refresh", label: "Refresh", icon: PiArrowClockwiseBold, action: () => window.location.reload() },
  ];

  // Measure after mount and keep the menu inside the viewport.
  useLayoutEffect(() => {
    const rect = menuRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({
      x: Math.min(x, window.innerWidth - rect.width - 8),
      y: Math.min(y, window.innerHeight - rect.height - 8),
    });
    menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [x, y]);

  useEffect(() => {
    const onPointer = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
        const i = items.indexOf(document.activeElement as HTMLButtonElement);
        const next = e.key === "ArrowDown" ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
        items[next]?.focus();
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    window.addEventListener("blur", onClose);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("blur", onClose);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={menuRef}
      role="menu"
      aria-label="Desktop"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      className="fixed min-w-60 origin-top-left rounded-xl border border-white/10 bg-mocha-mantle/90 p-1.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_18px_40px_-12px_rgb(17_17_27/0.9)] backdrop-blur-2xl"
      style={{ left: position.x, top: position.y, zIndex: Z.contextMenu }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {entries.map((entry) =>
        "separator" in entry ? (
          <div key={entry.id} role="separator" className="mx-2 my-1 h-px bg-white/5" />
        ) : (
          <button
            key={entry.id}
            role="menuitem"
            type="button"
            onClick={() => {
              entry.action();
              onClose();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-1.5 text-left text-sm text-mocha-text outline-none transition-colors hover:bg-white/10 focus-visible:bg-white/10"
          >
            <entry.icon className="size-4 text-mocha-subtext0" aria-hidden />
            {entry.label}
          </button>
        )
      )}
    </motion.div>
  );
};
