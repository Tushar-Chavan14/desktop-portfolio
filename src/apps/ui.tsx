import type { ReactNode } from "react";
import Image from "next/image";
import portrait from "@src/assets/images/tushar.webp";

/** Shared class strings so every app's controls share one shape and state language. */
export const buttonClass = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-mocha-mauve px-3.5 py-2 text-sm font-semibold text-mocha-crust transition hover:bg-mocha-mauve/90 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mocha-mauve disabled:pointer-events-none disabled:opacity-50",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-mocha-surface0 px-3.5 py-2 text-sm font-medium text-mocha-text transition hover:bg-mocha-surface1 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mocha-mauve disabled:pointer-events-none disabled:opacity-50",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-mocha-subtext1 transition hover:bg-mocha-surface0 hover:text-mocha-text active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-mocha-mauve",
  icon: "grid size-8 place-items-center rounded-lg text-mocha-subtext1 transition hover:bg-mocha-surface0 hover:text-mocha-text active:scale-95 focus-visible:outline-2 focus-visible:outline-mocha-mauve disabled:pointer-events-none disabled:opacity-40",
};

export const SectionTitle = ({ children, id }: { children: ReactNode; id?: string }) => (
  <h2 id={id} className="text-base font-semibold tracking-tight text-mocha-text">
    {children}
  </h2>
);

/** Initials tile for tiny spots where a photo turns into a smudge (the overview header). */
export const Monogram = ({ size = 24 }: { size?: number }) => (
  <span
    aria-hidden
    className="grid shrink-0 place-items-center rounded-[30%] bg-linear-to-br from-mocha-mauve via-mocha-lavender to-mocha-sapphire font-bold tracking-tight text-mocha-crust shadow-[inset_0_1px_0_rgb(255_255_255/0.4),0_10px_30px_-10px_rgb(203_166_247/0.5)]"
    style={{ width: `${size / 16}rem`, height: `${size / 16}rem`, fontSize: `${(size * 0.36) / 16}rem` }}
  >
    TC
  </span>
);

/** Portrait used wherever Tushar appears: About, door screen, launcher, Mail. Decorative, the name is always next to it. */
export const Avatar = ({ size = 72 }: { size?: number }) => (
  <Image
    src={portrait}
    alt=""
    width={size}
    height={size}
    placeholder="blur"
    className="shrink-0 rounded-[30%] object-cover ring-1 ring-white/10 shadow-[0_10px_30px_-12px_rgb(17_17_27/0.9)]"
    style={{ width: `${size / 16}rem`, height: `${size / 16}rem` }}
  />
);

/** Small tag for tech stacks; deliberately flat so long stacks stay calm. */
export const Tag = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center rounded-md bg-mocha-surface0 px-2 py-0.5 text-xs font-medium text-mocha-subtext1">
    {children}
  </span>
);
