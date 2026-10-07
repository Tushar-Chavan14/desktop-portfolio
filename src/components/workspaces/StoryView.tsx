"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";
import type { Workspace } from "./Workspaces";

const SWIPE_THRESHOLD = 60;

/**
 * Phone layout for the overview: each workspace is a full-screen "story".
 * Swipe sideways or use the buttons to move; each story scrolls vertically,
 * and there is no timer, so visitors read at their own pace.
 */
export default function StoryView({ workspaces }: { workspaces: Workspace[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [touched, setTouched] = useState(false);
  const reduce = useReducedMotion();

  const go = (next: number) => {
    if (next < 0 || next >= workspaces.length || next === index) return;
    setDirection(next > index ? 1 : -1);
    setIndex(next);
    setTouched(true);
  };

  const current = workspaces[index];
  const prev = workspaces[index - 1];
  const next = workspaces[index + 1];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Progress bars: one per story, tap to jump */}
      <div className="flex gap-1.5 px-4 pt-1" role="tablist" aria-label="Sections">
        {workspaces.map((ws, i) => (
          <button
            key={ws.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={ws.label}
            onClick={() => go(i)}
            className="group flex h-6 flex-1 items-center focus-visible:outline-2 focus-visible:outline-mocha-mauve"
          >
            <span className="relative h-1 w-full overflow-hidden rounded-full bg-white/15">
              <motion.span
                className="absolute inset-y-0 left-0 rounded-full bg-mocha-mauve"
                initial={false}
                animate={{ width: i <= index ? "100%" : "0%" }}
                transition={reduce ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
              />
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 pb-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-mocha-text">
          <span aria-hidden className="grid size-5 place-items-center text-mocha-mauve [&>svg]:size-full">
            {current.icon}
          </span>
          {current.label}
        </p>
        <p className="text-xs text-mocha-overlay2 tabular-nums">
          {index + 1} / {workspaces.length}
        </p>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {/* Keyed by story: each new story slides in from the side you are moving towards. */}
          <motion.div
            key={current.id}
            initial={reduce ? { opacity: 0 } : { x: `${direction * 100}%`, opacity: 0.4 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            drag={reduce ? false : "x"}
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_e, info) => {
              if (info.offset.x < -SWIPE_THRESHOLD) go(index + 1);
              else if (info.offset.x > SWIPE_THRESHOLD) go(index - 1);
            }}
            aria-label={`${current.label} (${index + 1} of ${workspaces.length})`}
            role="tabpanel"
            className="absolute inset-0 overflow-y-auto overscroll-contain px-4 pt-1 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {current.content}
          </motion.div>
      </div>

      {/* Thumb-reachable controls */}
      <nav
        aria-label="Story navigation"
        className="flex shrink-0 items-center gap-2 border-t border-white/5 bg-mocha-crust/80 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl"
      >
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={!prev}
          className="flex h-12 flex-1 items-center gap-2 rounded-xl px-3 text-left text-sm font-medium text-mocha-subtext1 transition active:scale-[0.98] disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-mocha-mauve"
        >
          <PiCaretLeftBold className="size-4 shrink-0" aria-hidden />
          <span className="truncate">{prev ? prev.label : "Start"}</span>
        </button>
        {!touched && index === 0 && <span className="shrink-0 text-xs text-mocha-overlay2">Swipe or tap Next</span>}
        <button
          type="button"
          onClick={() => go(index + 1)}
          disabled={!next}
          className="flex h-12 flex-1 items-center justify-end gap-2 rounded-xl bg-mocha-mauve px-3 text-right text-sm font-semibold text-mocha-crust transition active:scale-[0.98] disabled:bg-mocha-surface0 disabled:text-mocha-overlay1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mocha-mauve"
        >
          <span className="truncate">{next ? next.label : "The end"}</span>
          <PiCaretRightBold className="size-4 shrink-0" aria-hidden />
        </button>
      </nav>
    </div>
  );
}
