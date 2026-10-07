"use client";

import { motion, useReducedMotion } from "motion/react";
import { PiArrowRightBold, PiDownloadSimpleBold, PiFileTextBold, PiMonitorBold } from "react-icons/pi";
import type { IconType } from "react-icons";
import { profile } from "@src/data/profile";
import { Avatar } from "@src/apps/ui";
import { Z } from "@src/constants/layout";
import { useIsMobile } from "@src/hooks/useIsMobile";

interface DoorProps {
  onQuickView: () => void;
  onDesktop: () => void;
}

const Choice = ({
  icon: Icon,
  title,
  body,
  hint,
  onPress,
  primary,
  delay,
}: {
  icon: IconType;
  title: string;
  body: string;
  hint: string;
  onPress: () => void;
  primary?: boolean;
  delay: number;
}) => {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onPress}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={reduce ? undefined : { y: -3 }}
      whileTap={{ scale: 0.98 }}
      className={`group flex flex-col items-start gap-4 rounded-2xl border p-5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mocha-mauve sm:p-6 ${
        primary
          ? "border-mocha-mauve/40 bg-mocha-mauve/12 hover:bg-mocha-mauve/18"
          : "border-white/10 bg-mocha-base/60 hover:bg-mocha-base/80"
      }`}
    >
      <span
        className={`grid size-11 place-items-center rounded-xl ${
          primary ? "bg-mocha-mauve text-mocha-crust" : "bg-mocha-surface0 text-mocha-text"
        }`}
      >
        <Icon className="size-5.5" aria-hidden />
      </span>
      <span>
        <span className="block text-lg font-semibold tracking-tight text-mocha-text">{title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-mocha-subtext1">{body}</span>
      </span>
      <span
        className={`mt-auto inline-flex items-center gap-1.5 text-sm font-medium ${
          primary ? "text-mocha-mauve" : "text-mocha-subtext0 group-hover:text-mocha-text"
        }`}
      >
        {hint}
        <PiArrowRightBold className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </motion.button>
  );
};

/**
 * First-visit choice between a plain one-page portfolio and the interactive
 * desktop, so visitors who don't know desktop conventions are never stuck.
 */
const Door = ({ onQuickView, onDesktop }: DoorProps) => {
  const reduce = useReducedMotion();
  const isMobile = useIsMobile();

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="door-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 overflow-y-auto bg-mocha-crust/55 backdrop-blur-md"
      style={{ zIndex: Z.system }}
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col justify-center px-5 py-10 sm:px-8">
        <motion.header
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-4"
        >
          <Avatar size={60} />
          <div>
            <h1 id="door-title" className="text-3xl font-semibold tracking-tight text-mocha-text sm:text-4xl">
              {profile.name}
            </h1>
            <p className="mt-0.5 text-mocha-subtext1">{profile.role}</p>
          </div>
        </motion.header>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-[52ch] text-[15px] leading-relaxed text-mocha-subtext1"
        >
          Welcome. How would you like to see my work?
        </motion.p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Choice
            icon={PiFileTextBold}
            title="Quick view"
            body="A simple page with my experience, projects, skills and contact details. Takes about two minutes."
            hint="Read the overview"
            onPress={onQuickView}
            primary
            delay={0.1}
          />
          <Choice
            icon={PiMonitorBold}
            title="Explore the desktop"
            body={
              isMobile
                ? "The same portfolio as a phone-style home screen. Tap an app to open it."
                : "The same portfolio as an interactive Linux-style desktop, with a short guided tour."
            }
            hint="Open the desktop"
            onPress={onDesktop}
            delay={0.16}
          />
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-mocha-subtext0"
        >
          <a
            href={profile.resumeUrl}
            download="Tushar-Chavan-Resume.pdf"
            className="inline-flex items-center gap-1.5 font-medium text-mocha-text underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-mocha-mauve"
          >
            <PiDownloadSimpleBold className="size-4" aria-hidden />
            Download resume (PDF)
          </a>
          <span>You can switch views at any time.</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Door;
