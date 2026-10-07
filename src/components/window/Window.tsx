"use client";

import { memo, useCallback, useEffect, useState, type ReactNode } from "react";
import { Rnd } from "react-rnd";
import { motion, useReducedMotion } from "motion/react";
import { PiMinusBold, PiXBold, PiArrowsOutSimpleBold, PiArrowsInSimpleBold } from "react-icons/pi";
import useWindowStore, { type WindowInstance } from "@src/store/zustore/useWindowStore";
import { apps } from "@src/apps/meta";
import { AppIcon } from "@src/components/appIcon/AppIcon";
import { Z } from "@src/constants/layout";

interface WindowProps {
  win: WindowInstance;
  isFocused: boolean;
  children: ReactNode;
}

const INTERACTING_CLASS = "window-interacting";

/** Iframes swallow pointer events mid-drag; this body class disables them (see globals.css). */
const setInteracting = (on: boolean) => {
  document.body.classList.toggle(INTERACTING_CLASS, on);
};

const TrafficLight = ({
  label,
  color,
  onPress,
  children,
}: {
  label: string;
  color: string;
  onPress: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={(e) => {
      e.stopPropagation();
      onPress();
    }}
    // Keep a press on the control from starting a drag.
    onMouseDown={(e) => e.stopPropagation()}
    onDoubleClick={(e) => e.stopPropagation()}
    className={`grid size-3.5 place-items-center rounded-full ${color} text-mocha-crust/80 transition-[filter,transform] active:scale-90 active:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mocha-mauve`}
  >
    <span className="opacity-0 transition-opacity group-hover/lights:opacity-100 group-focus-within/lights:opacity-100">
      {children}
    </span>
  </button>
);

const Window = ({ win, isFocused, children }: WindowProps) => {
  const { focusWindow, closeWindow, minimizeWindow, toggleMaximize, setBounds } = useWindowStore();
  const reduceMotion = useReducedMotion();
  const meta = apps[win.appId];
  // Animate size/position only for maximise toggles, never while dragging.
  const [animateBounds, setAnimateBounds] = useState(false);

  useEffect(() => {
    if (!animateBounds) return;
    const t = setTimeout(() => setAnimateBounds(false), 260);
    return () => clearTimeout(t);
  }, [animateBounds]);

  const onToggleMaximize = useCallback(() => {
    if (!reduceMotion) setAnimateBounds(true);
    toggleMaximize(win.id);
  }, [reduceMotion, toggleMaximize, win.id]);

  const radius = win.isMaximized ? "rounded-none" : "rounded-xl";

  return (
    <Rnd
      position={{ x: win.x, y: win.y }}
      size={{ width: win.width, height: win.height }}
      minWidth={meta.minWidth ?? 320}
      minHeight={meta.minHeight ?? 220}
      bounds="parent"
      dragHandleClassName="window-drag-handle"
      cancel=".window-no-drag"
      disableDragging={win.isMaximized}
      enableResizing={!win.isMaximized && !win.isMinimized}
      onMouseDown={() => focusWindow(win.id)}
      onDragStart={() => setInteracting(true)}
      onResizeStart={() => setInteracting(true)}
      onDragStop={(_e, d) => {
        setInteracting(false);
        if (d.x !== win.x || d.y !== win.y) setBounds(win.id, { x: d.x, y: Math.max(0, d.y) });
      }}
      onResizeStop={(_e, _dir, ref, _delta, position) => {
        setInteracting(false);
        setBounds(win.id, {
          x: position.x,
          y: position.y,
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        });
      }}
      className={`${animateBounds ? "transition-[transform,width,height] duration-250 ease-out" : ""} ${
        win.isMinimized ? "pointer-events-none" : ""
      }`}
      style={{ zIndex: Z.windowBase + win.z }}
    >
      <motion.section
        aria-label={win.title}
        data-window-id={win.id}
        aria-hidden={win.isMinimized || undefined}
        inert={win.isMinimized || undefined}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12 }}
        animate={
          win.isMinimized
            ? reduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.55, y: 420 }
            : { opacity: 1, scale: 1, y: 0 }
        }
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
        transition={
          win.isMinimized
            ? { duration: 0.32, ease: [0.4, 0, 0.2, 1] }
            : { type: "spring", stiffness: 380, damping: 32 }
        }
        style={{ transformOrigin: "50% 100%" }}
        className={`flex h-full w-full flex-col overflow-hidden border ${radius} ${
          isFocused
            ? "border-white/10 shadow-[0_24px_64px_-12px_rgb(17_17_27/0.75),0_0_0_1px_rgb(17_17_27/0.6)]"
            : "border-white/5 shadow-[0_12px_32px_-12px_rgb(17_17_27/0.6)]"
        } bg-mocha-base`}
      >
        <header
          className={`window-drag-handle relative flex h-10 shrink-0 items-center gap-3 border-b px-3.5 select-none ${
            isFocused ? "border-mocha-surface0 bg-mocha-mantle" : "border-mocha-surface0/60 bg-mocha-crust"
          } ${win.isMaximized ? "" : "cursor-grab active:cursor-grabbing"}`}
          onDoubleClick={onToggleMaximize}
        >
          <div className="group/lights window-no-drag flex items-center gap-2">
            <TrafficLight
              label="Close"
              color={isFocused ? "bg-mocha-red" : "bg-mocha-surface2"}
              onPress={() => closeWindow(win.id)}
            >
              <PiXBold className="size-2.5" />
            </TrafficLight>
            <TrafficLight
              label="Minimize"
              color={isFocused ? "bg-mocha-yellow" : "bg-mocha-surface2"}
              onPress={() => minimizeWindow(win.id)}
            >
              <PiMinusBold className="size-2.5" />
            </TrafficLight>
            <TrafficLight
              label={win.isMaximized ? "Restore" : "Maximize"}
              color={isFocused ? "bg-mocha-green" : "bg-mocha-surface2"}
              onPress={onToggleMaximize}
            >
              {win.isMaximized ? (
                <PiArrowsInSimpleBold className="size-2.5" />
              ) : (
                <PiArrowsOutSimpleBold className="size-2.5" />
              )}
            </TrafficLight>
          </div>

          <div className="pointer-events-none absolute inset-x-28 flex items-center justify-center gap-2">
            <AppIcon icon={meta.icon} label="" size={16} />
            <h2
              className={`truncate text-[13px] font-medium ${
                isFocused ? "text-mocha-text" : "text-mocha-overlay1"
              }`}
            >
              {win.title}
            </h2>
          </div>
        </header>

        <div className="relative min-h-0 flex-1 text-mocha-text">{children}</div>
      </motion.section>
    </Rnd>
  );
};

export default memo(Window);
