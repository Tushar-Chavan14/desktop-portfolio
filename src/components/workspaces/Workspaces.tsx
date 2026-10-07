"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";

export interface Workspace {
  id: string;
  label: string;
  /** Pre-rendered icon element (functions cannot cross the server/client boundary). */
  icon: ReactNode;
  /** Accent glow for this workspace's surface (CSS colour with alpha). */
  tint: string;
  content: ReactNode;
}

/** True if the wheel event can still scroll some element between target and the workspace card. */
const canScrollInside = (target: EventTarget | null, deltaY: number, stop: HTMLElement) => {
  let el = target instanceof HTMLElement ? target : null;
  while (el && el !== stop) {
    const scrollable = el.scrollHeight > el.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(el).overflowY);
    if (scrollable) {
      if (deltaY > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 1) return true;
      if (deltaY < 0 && el.scrollTop > 0) return true;
    }
    el = el.parentElement;
  }
  return false;
};

/**
 * GNOME-style workspace overview: a horizontal row of workspaces that snap to
 * centre. Swipe, trackpad, wheel, arrow keys, number keys or the switcher move
 * between them; the active one is full size, its neighbours shrink and dim.
 */
export default function Workspaces({ workspaces }: { workspaces: Workspace[] }) {
  const stripRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const wheelLock = useRef(0);

  const goTo = useCallback(
    (index: number) => {
      const i = Math.max(0, Math.min(workspaces.length - 1, index));
      cardRefs.current[i]?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", inline: "center", block: "nearest" });
      setActive(i);
    },
    [reduce, workspaces.length]
  );

  // Track which workspace is centred, whatever moved it (swipe, trackpad, keyboard focus).
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { root: strip, threshold: 0.6 }
    );
    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Keyboard: arrows and number keys.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target instanceof Element && e.target.closest("input, textarea, select, [contenteditable]")) return;
      if (e.key === "ArrowRight") goTo(active + 1);
      else if (e.key === "ArrowLeft") goTo(active - 1);
      else if (/^[1-9]$/.test(e.key) && Number(e.key) <= workspaces.length) goTo(Number(e.key) - 1);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, goTo, workspaces.length]);

  // A vertical mouse wheel moves one workspace per gesture (horizontal trackpads scroll natively).
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const card = (e.target as HTMLElement).closest<HTMLElement>("[data-index]");
      if (card && canScrollInside(e.target, e.deltaY, card)) return;
      e.preventDefault();
      const now = Date.now();
      if (now < wheelLock.current || Math.abs(e.deltaY) < 8) return;
      wheelLock.current = now + 650;
      goTo(active + (e.deltaY > 0 ? 1 : -1));
    };
    strip.addEventListener("wheel", onWheel, { passive: false });
    return () => strip.removeEventListener("wheel", onWheel);
  }, [active, goTo]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1">
        <div
          ref={stripRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Portfolio workspaces"
          className="flex h-full snap-x snap-mandatory items-stretch gap-5 overflow-x-auto overscroll-x-contain px-[6vw] py-4 [scrollbar-width:none] md:gap-8 md:px-[calc((100vw_-_min(74rem,80vw))/2)] [&::-webkit-scrollbar]:hidden"
        >
          {workspaces.map((ws, i) => {
            const isActive = i === active;
            return (
              <motion.section
                key={ws.id}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                data-index={i}
                id={ws.id}
                aria-label={`${ws.label} (${i + 1} of ${workspaces.length})`}
                aria-roledescription="slide"
                onClick={() => !isActive && goTo(i)}
                animate={reduce ? undefined : { scale: isActive ? 1 : 0.92, opacity: isActive ? 1 : 0.5 }}
                initial={reduce ? false : { scale: 1.06, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                className={`relative w-[88vw] shrink-0 snap-center overflow-hidden rounded-[28px] border border-white/10 shadow-[0_30px_80px_-30px_rgb(17_17_27/0.9)] md:w-[min(74rem,80vw)] ${
                  isActive ? "" : "cursor-pointer"
                }`}
              >
                {/* Each workspace gets its own tinted surface so they read as separate spaces */}
                <div aria-hidden className="absolute inset-0 bg-mocha-mantle/80" />
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{ background: `radial-gradient(90% 70% at 0% 0%, ${ws.tint}, transparent 65%), radial-gradient(60% 50% at 100% 100%, ${ws.tint}, transparent 70%)` }}
                />
                <div className="relative h-full overflow-y-auto overscroll-contain p-4 [scrollbar-width:thin] sm:p-6 md:p-8">
                  {ws.content}
                </div>
              </motion.section>
            );
          })}
        </div>

        {/* Arrows for mouse users on wide screens */}
        <button
          type="button"
          onClick={() => goTo(active - 1)}
          disabled={active === 0}
          aria-label="Previous workspace"
          className="absolute top-1/2 left-3 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-mocha-crust/70 text-mocha-text backdrop-blur transition hover:bg-mocha-surface0 active:scale-95 disabled:pointer-events-none disabled:opacity-0 focus-visible:outline-2 focus-visible:outline-mocha-mauve lg:grid"
        >
          <PiCaretLeftBold className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => goTo(active + 1)}
          disabled={active === workspaces.length - 1}
          aria-label="Next workspace"
          className="absolute top-1/2 right-3 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-mocha-crust/70 text-mocha-text backdrop-blur transition hover:bg-mocha-surface0 active:scale-95 disabled:pointer-events-none disabled:opacity-0 focus-visible:outline-2 focus-visible:outline-mocha-mauve lg:grid"
        >
          <PiCaretRightBold className="size-4" aria-hidden />
        </button>
      </div>

      {/* Dock-style workspace switcher */}
      <nav aria-label="Workspaces" className="flex shrink-0 justify-center px-3 pt-1 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <ul className="flex items-center gap-1 rounded-2xl border border-white/10 bg-mocha-crust/70 p-1.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-2xl">
          {workspaces.map((ws, i) => {
            const isActive = i === active;
            return (
              <li key={ws.id}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-mocha-mauve sm:px-4 ${
                    isActive ? "text-mocha-crust" : "text-mocha-subtext1 hover:text-mocha-text"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="workspace-pill"
                      aria-hidden
                      className="absolute inset-0 rounded-xl bg-mocha-mauve"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span aria-hidden className="relative grid size-[18px] place-items-center [&>svg]:size-full">
                    {ws.icon}
                  </span>
                  <span className="relative hidden sm:inline">{ws.label}</span>
                  <span className="sr-only sm:hidden">{ws.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
