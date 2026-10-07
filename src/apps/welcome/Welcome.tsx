"use client";

import { motion, useReducedMotion } from "motion/react";
import { Kbd } from "@heroui/react";
import { apps, type AppId } from "@src/apps/meta";
import { AppIcon } from "@src/components/appIcon/AppIcon";
import { profile, projects } from "@src/data/profile";
import useWindowStore from "@src/store/zustore/useWindowStore";
import useShellStore from "@src/store/zustore/useShellStore";
import type { AppComponentProps } from "../types";
import { buttonClass } from "../ui";

const starters: { id: AppId; blurb: string }[] = [
  { id: "about", blurb: "Background, skills and education" },
  { id: "projects", blurb: `${projects.length} projects across commerce, AI and platforms` },
  { id: "resume", blurb: "Read it here or download the PDF" },
  { id: "terminal", blurb: "Same content, for people who prefer a shell" },
];

export default function Welcome({ windowId, isMobile }: AppComponentProps) {
  const openApp = useWindowStore((s) => s.openApp);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const startTour = useShellStore((s) => s.startTour);
  const reduce = useReducedMotion();

  return (
    <div className="@container flex h-full flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-mocha-surface2 scrollbar-track-mocha-surface0">
      <div className="relative overflow-hidden border-b border-mocha-surface0 px-6 pt-7 pb-6">
        {/* Soft ambient light behind the greeting */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-mocha-mauve/15 blur-3xl"
        />
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-medium text-mocha-mauve"
        >
          Welcome to tushar@fedora
        </motion.p>
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-2 text-3xl font-semibold tracking-tight text-mocha-text"
        >
          Hi, I&apos;m {profile.firstName}.
        </motion.h1>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-2 max-w-[48ch] text-[15px] leading-relaxed text-mocha-subtext1"
        >
          {profile.role} with {profile.yearsOfExperience} years of experience. {profile.shortBio} This desktop is my portfolio:
          every app here opens a part of it.
        </motion.p>
      </div>

      <ul className="grid gap-2 p-4 @lg:grid-cols-2">
        {starters.map(({ id, blurb }, i) => (
          <motion.li
            key={id}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              onClick={() => openApp(id)}
              className="flex w-full items-center gap-3 rounded-xl bg-mocha-mantle p-3 text-left transition hover:bg-mocha-surface0 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-mocha-mauve"
            >
              <AppIcon icon={apps[id].icon} label="" size={40} />
              <span className="min-w-0">
                <span className="block font-medium text-mocha-text">{apps[id].title}</span>
                <span className="block text-sm leading-snug text-mocha-subtext0">{blurb}</span>
              </span>
            </button>
          </motion.li>
        ))}
      </ul>

      <div className="mt-auto flex flex-col gap-4 border-t border-mocha-surface0 px-6 py-4 @lg:flex-row @lg:items-center @lg:justify-between">
        {!isMobile ? (
          <ul className="flex flex-col gap-1.5 text-sm text-mocha-subtext0">
            <li>Double-click desktop icons to open them.</li>
            <li className="flex items-center gap-1.5">
              Press <Kbd className="bg-mocha-surface0 text-mocha-text">Super</Kbd> or click Activities to search.
            </li>
            <li>Right-click the desktop to change the wallpaper.</li>
          </ul>
        ) : (
          <p className="text-sm text-mocha-subtext0">Tap an app on the home screen to open it.</p>
        )}
        <div className="flex shrink-0 gap-2">
          <button type="button" className={buttonClass.secondary} onClick={() => closeWindow(windowId)}>
            Close
          </button>
          {!isMobile && (
            <button
              type="button"
              className={buttonClass.primary}
              onClick={() => {
                closeWindow(windowId);
                startTour();
              }}
            >
              Take the tour
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
