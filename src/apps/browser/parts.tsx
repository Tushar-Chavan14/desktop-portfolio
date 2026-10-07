"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { PiArrowSquareOut } from "react-icons/pi";
import { faviconUrl, hostOf } from "./url";

/* ------------------------------------------------------------------ */

export function Favicon({
  host,
  size,
  className = "",
}: {
  host: string;
  size: number;
  className?: string;
}) {
  const [failedHost, setFailedHost] = useState<string | null>(null);
  const label = host.replace(/^www\./, "");
  const initial = label.charAt(0).toUpperCase() || "?";

  if (failedHost === host) {
    return (
      <span
        aria-hidden="true"
        style={{ width: size, height: size, fontSize: Math.round(size * 0.45) }}
        className={`grid shrink-0 place-items-center rounded-lg bg-mocha-surface1 font-semibold text-mocha-text ${className}`}
      >
        {initial}
      </span>
    );
  }

  return (
    <img
      src={faviconUrl(host)}
      alt={`${label} icon`}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailedHost(host)}
      style={{ width: size, height: size }}
      className={`shrink-0 rounded-md ${className}`}
    />
  );
}

/* ------------------------------------------------------------------ */

/** Thin indeterminate progress bar pinned to the top of the page area. */
export function LoadingBar({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  if (!active) return null;
  return (
    <div
      role="progressbar"
      aria-label="Loading page"
      aria-busy="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-mocha-mauve/15"
    >
      {reduce ? (
        <div className="h-full w-full bg-mocha-mauve/60" />
      ) : (
        <motion.div
          className="h-full w-1/3 rounded-full bg-mocha-mauve"
          initial={{ x: "-100%" }}
          animate={{ x: "300%" }}
          transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-mocha-mauve/60";

export function ToolbarButton({
  label,
  onClick,
  disabled,
  className = "",
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid size-8 shrink-0 place-items-center rounded-lg text-[18px] text-mocha-subtext1 transition hover:bg-mocha-surface0 hover:text-mocha-text active:scale-95 disabled:pointer-events-none disabled:text-mocha-overlay0/60 ${focusRing} ${className}`}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */

export function BlockedPage({
  url,
  reason,
  onOpen,
  onBack,
}: {
  url: string;
  reason: string;
  onOpen: () => void;
  onBack?: () => void;
}) {
  const host = hostOf(url);
  const unreachable = reason === "unreachable";

  return (
    <div className="flex h-full w-full items-center justify-center overflow-auto bg-mocha-base p-6">
      <div className="flex w-full max-w-md flex-col items-start">
        <div className="mb-6 grid size-16 place-items-center rounded-xl border border-mocha-surface0 bg-mocha-mantle">
          <Favicon host={host} size={32} />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-mocha-text text-balance">
          {host.replace(/^www\./, "")} can&apos;t be shown here
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-mocha-subtext0 text-pretty">
          {unreachable
            ? "The site didn't respond to a check from here. It may be down, or it may only load in its own tab."
            : "This site blocks being displayed inside other pages, so it needs to open in a tab of its own."}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpen}
            className={`inline-flex h-9 items-center gap-2 rounded-lg bg-mocha-mauve px-4 text-sm font-medium text-mocha-crust transition hover:bg-mocha-mauve/90 active:scale-95 focus-visible:ring-offset-2 focus-visible:ring-offset-mocha-base ${focusRing}`}
          >
            <PiArrowSquareOut aria-hidden="true" className="text-base" />
            Open in new tab
          </button>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className={`inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-mocha-subtext1 transition hover:bg-mocha-surface0 hover:text-mocha-text active:scale-95 ${focusRing}`}
            >
              Go back
            </button>
          )}
        </div>
        <p className="mt-8 break-all font-mono text-xs text-mocha-overlay1">{url}</p>
      </div>
    </div>
  );
}
