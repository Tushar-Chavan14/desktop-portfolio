"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PiArrowLeftBold, PiArrowRightBold, PiXBold } from "react-icons/pi";
import type { AppId } from "@src/apps/meta";
import { apps } from "@src/apps/meta";
import useShellStore from "@src/store/zustore/useShellStore";
import useWindowStore from "@src/store/zustore/useWindowStore";
import useDesktopStore from "@src/store/zustore/useDesktopStore";
import { Z } from "@src/constants/layout";

interface Step {
  title: string;
  body: string;
  /** App opened when the step starts; its window is highlighted. */
  app?: AppId;
  /** CSS selector of a fixed UI element to highlight instead of a window. */
  target?: string;
}

const STEPS: Step[] = [
  {
    title: "A quick tour",
    body: "This portfolio works like a computer desktop. A few short steps show you where everything is.",
  },
  {
    app: "about",
    title: "About me",
    body: "Who I am, what I work with and where I studied. Drag a window by its top bar; the red dot closes it.",
  },
  {
    app: "projects",
    title: "Projects",
    body: "Everything I have built. Click any folder to read what I did on that project.",
  },
  {
    app: "resume",
    title: "Resume",
    body: "My full resume. Use Download at the top right to save the PDF.",
  },
  {
    app: "contact",
    title: "Contact",
    body: "Email, phone and LinkedIn. The copy buttons put my details on your clipboard.",
  },
  {
    target: '[data-tour="dock"]',
    title: "The dock",
    body: "Every app lives down here. Click an icon to open it again at any time.",
  },
  {
    target: '[data-tour="simple-view"]',
    title: "Prefer a normal page?",
    body: "Simple view shows the whole portfolio on one scrolling page. You can come back to the desktop from there.",
  },
];

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const PAD = 8;

/** Track a DOM element's position every frame while the step is active (windows animate in). */
const useTargetRect = (step: Step | undefined, windowId: string | null) => {
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (!step || (!step.target && !windowId)) {
      setRect(null);
      return;
    }
    let frame = 0;
    let last = "";
    const tick = () => {
      const el = step.target
        ? document.querySelector(step.target)
        : document.querySelector(`[data-window-id="${windowId}"]`);
      const r = el?.getBoundingClientRect();
      const next = r ? `${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)},${Math.round(r.height)}` : "";
      if (next !== last) {
        last = next;
        setRect(r ? { x: r.x - PAD, y: r.y - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 } : null);
      }
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [step, windowId]);

  return rect;
};

const Tour = () => {
  const stepIndex = useShellStore((s) => s.tourStep);
  const setTourStep = useShellStore((s) => s.setTourStep);
  const endTour = useShellStore((s) => s.endTour);
  const openApp = useWindowStore((s) => s.openApp);
  const closeAll = useWindowStore((s) => s.closeAll);
  const setWelcomed = useDesktopStore((s) => s.setWelcomed);
  const reduce = useReducedMotion();
  const [windowId, setWindowId] = useState<string | null>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  const step = stepIndex === null ? undefined : STEPS[stepIndex];
  const rect = useTargetRect(step, windowId);

  // Each app step opens (or focuses) its app so the visitor sees it for real.
  useEffect(() => {
    if (!step?.app) {
      setWindowId(null);
      return;
    }
    setWindowId(openApp(step.app));
  }, [step, openApp]);

  useEffect(() => {
    if (step) nextRef.current?.focus();
  }, [step]);

  // Ending the tour (finish or skip) clears the windows it opened for a clean desktop.
  const finish = () => {
    setWelcomed();
    endTour();
    closeAll();
  };

  const go = (delta: number) => {
    if (stepIndex === null) return;
    const next = stepIndex + delta;
    if (next >= STEPS.length) finish();
    else if (next >= 0) setTourStep(next);
  };

  useEffect(() => {
    if (stepIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const isLast = stepIndex === STEPS.length - 1;
  const isIntro = stepIndex === 0;
  // The card sits above highlighted bottom UI, below highlighted top UI, otherwise bottom-right.
  const placement = !rect
    ? "center"
    : rect.y > window.innerHeight * 0.6
      ? "above"
      : rect.y < 80 && rect.height < 120
        ? "below"
        : "corner";

  return (
    <AnimatePresence>
      {step && (
        <motion.div
          key="tour"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0"
          style={{ zIndex: Z.tour }}
        >
          {/* Dim everything except the highlighted element */}
          {rect ? (
            <motion.div
              aria-hidden
              className="absolute rounded-2xl ring-2 ring-mocha-mauve/80 shadow-[0_0_0_9999px_rgb(17_17_27/0.55)]"
              initial={false}
              animate={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 34 }}
            />
          ) : (
            <div aria-hidden className="absolute inset-0 bg-mocha-crust/55" />
          )}

          <motion.div
            key={stepIndex}
            role="dialog"
            aria-modal="false"
            aria-labelledby="tour-title"
            aria-describedby="tour-body"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="pointer-events-auto absolute w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-mocha-mantle/95 p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_24px_48px_-16px_rgb(17_17_27/0.9)] backdrop-blur-2xl"
            style={
              placement === "center"
                ? { left: "50%", top: "50%", translate: "-50% -50%" }
                : placement === "above" && rect
                  ? { left: Math.max(16, Math.min(rect.x + rect.width / 2 - 176, window.innerWidth - 368)), top: rect.y - 16, translate: "0 -100%" }
                  : placement === "below" && rect
                    ? { left: Math.max(16, Math.min(rect.x + rect.width - 352, window.innerWidth - 368)), top: rect.y + rect.height + 16 }
                    : { right: 24, bottom: 104 }
            }
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs font-medium text-mocha-mauve tabular-nums">
                {isIntro ? "Welcome" : `Step ${stepIndex} of ${STEPS.length - 1}`}
              </p>
              <button
                type="button"
                onClick={finish}
                aria-label="Skip the tour"
                className="-m-1 grid size-7 place-items-center rounded-lg text-mocha-subtext0 transition hover:bg-mocha-surface0 hover:text-mocha-text focus-visible:outline-2 focus-visible:outline-mocha-mauve"
              >
                <PiXBold className="size-3.5" aria-hidden />
              </button>
            </div>
            <h2 id="tour-title" className="mt-2 text-lg font-semibold tracking-tight text-mocha-text">
              {step.title}
            </h2>
            <p id="tour-body" className="mt-1.5 text-sm leading-relaxed text-mocha-subtext1">
              {step.body}
            </p>

            {/* Progress */}
            {!isIntro && (
              <div className="mt-4 flex gap-1" aria-hidden>
                {STEPS.slice(1).map((s, i) => (
                  <span
                    key={s.title}
                    className={`h-1 flex-1 rounded-full transition-colors ${i < (stepIndex ?? 0) ? "bg-mocha-mauve" : "bg-mocha-surface1"}`}
                  />
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-2">
              {isIntro ? (
                <button
                  type="button"
                  onClick={finish}
                  className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-mocha-subtext1 transition hover:bg-mocha-surface0 hover:text-mocha-text focus-visible:outline-2 focus-visible:outline-mocha-mauve"
                >
                  No thanks
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-mocha-subtext1 transition hover:bg-mocha-surface0 hover:text-mocha-text focus-visible:outline-2 focus-visible:outline-mocha-mauve"
                >
                  <PiArrowLeftBold className="size-3.5" aria-hidden />
                  Back
                </button>
              )}
              <button
                ref={nextRef}
                type="button"
                onClick={() => go(1)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-mocha-mauve px-3.5 py-2 text-sm font-semibold text-mocha-crust transition hover:bg-mocha-mauve/90 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mocha-mauve"
              >
                {isIntro ? "Show me around" : isLast ? "Finish" : "Next"}
                {!isLast && <PiArrowRightBold className="size-3.5" aria-hidden />}
              </button>
            </div>
            {step.app && <span className="sr-only">{apps[step.app].title} window is now open.</span>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Tour;
