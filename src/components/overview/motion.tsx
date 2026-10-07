"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate, motion, useInView, useReducedMotion, useScroll, useSpring } from "motion/react";

/** Counts up to a value the first time it scrolls into view. */
export const CountUp = ({ to, suffix = "" }: { to: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduce) {
      el.textContent = `${to}${suffix}`;
      return;
    }
    const controls = animate(0, to, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = `${Math.round(v)}${suffix}`),
    });
    return () => controls.stop();
  }, [inView, reduce, suffix, to]);

  // Server and no-JS render the final number; the animation starts from 0 once visible.
  return (
    <span ref={ref} className="tabular-nums">
      {to}
      {suffix}
    </span>
  );
};

export interface StackItem {
  name: string;
  logo: string;
}

/** Endless strip of the tools I ship with. Pauses on hover; static and wrapped under reduced motion. */
export const StackMarquee = ({ items }: { items: StackItem[] }) => {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-10 pr-10">
      {items.map((item) => (
        <li key={item.name} className="flex items-center gap-2.5 text-sm font-medium whitespace-nowrap text-mocha-subtext1">
          <img src={item.logo} alt="" width={20} height={20} className="size-5 opacity-80" loading="lazy" />
          {item.name}
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className="group relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
      aria-label="Tools and technologies"
    >
      <div className="flex animate-[marquee_40s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none motion-reduce:flex-wrap">
        {row(false)}
        <span className="contents motion-reduce:hidden">{row(true)}</span>
      </div>
    </div>
  );
};

/** Vertical line beside the experience list that draws itself as you scroll through it. */
export const ScrollLine = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <div ref={ref} className="relative pl-8 md:pl-10">
      <div aria-hidden className="absolute top-2 bottom-2 left-[5px] w-px bg-mocha-surface0 md:left-[7px]" />
      <motion.div
        aria-hidden
        style={{ scaleY: reduce ? 1 : scaleY }}
        className="absolute top-2 bottom-2 left-[5px] w-px origin-top bg-linear-to-b from-mocha-mauve to-mocha-sapphire md:left-[7px]"
      />
      {children}
    </div>
  );
};

/** Card whose surface lights up under the cursor. Uses CSS variables, so no React re-renders. */
export const SpotlightCard = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--x", `${e.clientX - r.left}px`);
        el.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
      className={`group relative overflow-hidden rounded-2xl border border-white/5 bg-mocha-base transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-mocha-mauve/25 motion-reduce:hover:translate-y-0 ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--x, 50%) var(--y, 50%), rgb(203 166 247 / 0.10), transparent 60%)",
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
};

/** Thin reading-progress bar under the sticky header. */
export const ReadingProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="absolute inset-x-0 bottom-0 h-px origin-left bg-linear-to-r from-mocha-mauve to-mocha-sapphire"
    />
  );
};

/** Panel with a slowly rotating gradient border, used once for the closing call to action. */
export const GlowPanel = ({ children }: { children: ReactNode }) => (
  <div className="relative overflow-hidden rounded-3xl p-px">
    <div
      aria-hidden
      className="absolute inset-[-100%] animate-[spin_12s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,rgb(203_166_247/0.7)_60deg,transparent_120deg,transparent_180deg,rgb(116_199_236/0.5)_240deg,transparent_300deg)] motion-reduce:animate-none"
    />
    <div className="relative rounded-[calc(1.5rem-1px)] bg-mocha-base">{children}</div>
  </div>
);
