"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { DesktopLink } from "./client";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Slow-moving colour fields behind the hero. Purely atmospheric; static under reduced motion. */
export const Aurora = () => {
  const reduce = useReducedMotion();
  const blobs = [
    { className: "left-[-10%] top-[-20%] size-[42rem] bg-mocha-mauve/25", x: [0, 60, -20, 0], y: [0, 40, 80, 0] },
    { className: "right-[-15%] top-[10%] size-[36rem] bg-mocha-sapphire/20", x: [0, -50, 30, 0], y: [0, 60, -30, 0] },
    { className: "left-[30%] bottom-[-35%] size-[30rem] bg-mocha-pink/15", x: [0, 40, -40, 0], y: [0, -40, 20, 0] },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-[110px] ${b.className}`}
          animate={reduce ? undefined : { x: b.x, y: b.y }}
          transition={{ duration: 24 + i * 6, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {/* Fade the colour out before the next section */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-mocha-crust" />
    </div>
  );
};

/** Name revealed letter by letter on load. */
export const NameReveal = ({ text }: { text: string }) => {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  let index = 0;
  return (
    <h1
      aria-label={text}
      className="text-5xl leading-[1.05] font-semibold tracking-tighter text-mocha-text sm:text-6xl lg:text-7xl"
    >
      {words.map((word, w) => (
        <span key={w} aria-hidden className="inline-block whitespace-nowrap">
          {word.split("").map((char) => {
            const i = index++;
            return (
              <motion.span
                key={i}
                className="inline-block"
                initial={reduce ? false : { opacity: 0, y: "0.4em", filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.15 + i * 0.035, duration: 0.6, ease: EASE }}
              >
                {char}
              </motion.span>
            );
          })}
          {w < words.length - 1 && <span className="inline-block w-[0.28em]" />}
        </span>
      ))}
    </h1>
  );
};

/** Cycles through what I build. Each phrase is a real line of work from the resume. */
export const RotatingPhrase = ({ phrases }: { phrases: string[] }) => {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((n) => (n + 1) % phrases.length), 2600);
    return () => clearInterval(t);
  }, [phrases.length, reduce]);

  return (
    <span className="relative inline-grid align-bottom">
      {/* Reserve the width of the longest phrase so the line never reflows */}
      <span aria-hidden className="invisible col-start-1 row-start-1 whitespace-nowrap">
        {phrases.reduce((a, b) => (b.length > a.length ? b : a))}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={phrases[i]}
          className="col-start-1 row-start-1 whitespace-nowrap text-mocha-mauve"
          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          {phrases[i]}
        </motion.span>
      </AnimatePresence>
      <span className="sr-only">{phrases.join(", ")}</span>
    </span>
  );
};

interface LayerProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
  depth: number;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  delay: number;
  rotate?: number;
  priority?: boolean;
}

/** One screenshot in the collage; deeper layers move further with the cursor. */
const Layer = ({ src, alt, width, height, className, depth, mx, my, delay, rotate = 0, priority }: LayerProps) => {
  const reduce = useReducedMotion();
  const x = useTransform(mx, (v) => v * depth);
  const y = useTransform(my, (v) => v * depth);
  // Outer element follows the cursor; inner element plays the entrance, so the two never fight over y.
  return (
    <motion.div className={`absolute ${className}`} style={reduce ? { rotate } : { x, y, rotate }}>
      <motion.div
        className="overflow-hidden rounded-xl border border-white/10 shadow-[0_30px_60px_-20px_rgb(17_17_27/0.9),0_0_0_1px_rgb(17_17_27/0.6)]"
        initial={reduce ? false : { opacity: 0, y: 40, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay, duration: 0.9, ease: EASE }}
      >
        <Image src={src} alt={alt} width={width} height={height} priority={priority} className="h-auto w-full" />
      </motion.div>
    </motion.div>
  );
};

/**
 * Real screenshots of the desktop version, layered with depth. The stack tilts
 * toward the cursor, hinting that there is something to explore behind it.
 */
export const HeroCollage = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 120, damping: 20 });
  const my = useSpring(rawY, { stiffness: 120, damping: 20 });
  const rotateY = useTransform(mx, (v) => v * 0.35);
  const rotateX = useTransform(my, (v) => v * -0.35);

  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        rawX.set(((e.clientX - r.left) / r.width - 0.5) * 40);
        rawY.set(((e.clientY - r.top) / r.height - 0.5) * 40);
      }}
      onPointerLeave={() => {
        rawX.set(0);
        rawY.set(0);
      }}
      className="relative [perspective:1400px]"
    >
      <DesktopLink className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-mocha-mauve">
        <motion.div
          style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative aspect-[16/12] w-full"
        >
          <Layer
            src="/images/projects-preview.png"
            alt="Projects window showing the Winasa project"
            width={980}
            height={640}
            className="top-0 right-0 w-[62%] opacity-80"
            depth={0.4}
            rotate={2}
            mx={mx}
            my={my}
            delay={0.35}
          />
          <Layer
            src="/images/desktop-preview.png"
            alt="The desktop version of this portfolio with the About Me window open"
            width={1440}
            height={900}
            className="top-[14%] left-0 w-[86%]"
            depth={0.8}
            mx={mx}
            my={my}
            delay={0.2}
            priority
          />
          <Layer
            src="/images/terminal-preview.png"
            alt="Terminal window running neofetch"
            width={760}
            height={500}
            className="bottom-0 right-[4%] w-[52%]"
            depth={1.4}
            rotate={-2}
            mx={mx}
            my={my}
            delay={0.5}
          />
        </motion.div>
        <span className="mt-5 inline-flex items-center gap-2 text-sm text-mocha-subtext0 transition-colors group-hover:text-mocha-text">
          This portfolio also runs as an interactive Linux-style desktop.
          <span className="font-medium text-mocha-mauve underline-offset-4 group-hover:underline">Try it</span>
        </span>
      </DesktopLink>
    </div>
  );
};
