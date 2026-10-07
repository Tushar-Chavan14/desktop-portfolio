"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { PiCheckBold, PiCopyBold, PiMonitorBold } from "react-icons/pi";
import { setViewMode } from "@src/lib/viewMode";

/** Fades a section up as it scrolls into view. */
export const Reveal = ({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

export const CopyButton = ({ value, label }: { value: string; label: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {
          setCopied(false);
        }
      }}
      aria-label={copied ? `${label} copied` : `Copy ${label}`}
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-mocha-subtext1 transition hover:bg-mocha-surface0 hover:text-mocha-text active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-mocha-mauve"
    >
      {copied ? <PiCheckBold className="size-4 text-mocha-green" aria-hidden /> : <PiCopyBold className="size-4" aria-hidden />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

/** Switches the remembered view back to the desktop. */
export const DesktopLink = ({ className, children }: { className?: string; children?: ReactNode }) => (
  <Link href="/" onClick={() => setViewMode("desktop")} className={className}>
    {children ?? (
      <>
        <PiMonitorBold className="size-4" aria-hidden />
        Desktop version
      </>
    )}
  </Link>
);
