"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { PiCheckBold, PiCopyBold } from "react-icons/pi";
import { setViewMode } from "@src/lib/viewMode";

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
      className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-mocha-subtext1 transition hover:bg-mocha-surface0 hover:text-mocha-text active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-mocha-mauve"
    >
      {copied ? <PiCheckBold className="size-4 text-mocha-green" aria-hidden /> : <PiCopyBold className="size-4" aria-hidden />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

/** Switches the remembered view back to the desktop. */
export const DesktopLink = ({ className, children }: { className?: string; children: ReactNode }) => (
  <Link href="/" onClick={() => setViewMode("desktop")} className={className}>
    {children}
  </Link>
);
