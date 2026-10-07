"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PiArrowSquareOutBold, PiMagnifyingGlassBold } from "react-icons/pi";
import { apps, externalLinks, type AppId, type AppIconSpec } from "@src/apps/meta";
import { AppIcon } from "@src/components/appIcon/AppIcon";
import useShellStore from "@src/store/zustore/useShellStore";
import useWindowStore from "@src/store/zustore/useWindowStore";
import { Z } from "@src/constants/layout";

interface Entry {
  id: string;
  title: string;
  description: string;
  icon: AppIconSpec;
  haystack: string;
  run: () => void;
  external?: boolean;
}

const Activities = () => {
  const open = useShellStore((s) => s.activitiesOpen);
  const close = useShellStore((s) => s.closeActivities);
  const toggle = useShellStore((s) => s.toggleActivities);
  const openApp = useWindowStore((s) => s.openApp);
  const windows = useWindowStore((s) => s.windows);
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const entries = useMemo<Entry[]>(() => {
    const appEntries = (Object.keys(apps) as AppId[]).map((id) => {
      const a = apps[id];
      return {
        id,
        title: a.title,
        description: a.description,
        icon: a.icon,
        haystack: [a.title, a.description, ...(a.keywords ?? [])].join(" ").toLowerCase(),
        run: () => openApp(id),
      };
    });
    const linkEntries = externalLinks.map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      icon: l.icon,
      haystack: `${l.title} ${l.description}`.toLowerCase(),
      run: () => window.open(l.url, "_blank", "noopener,noreferrer"),
      external: true,
    }));
    return [...appEntries, ...linkEntries];
  }, [openApp]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries
      .filter((e) => e.haystack.includes(q))
      .sort((a, b) => Number(b.title.toLowerCase().startsWith(q)) - Number(a.title.toLowerCase().startsWith(q)));
  }, [entries, query]);

  // Super key toggles Activities, like GNOME. Only fires when pressed on its own.
  useEffect(() => {
    let lone = false;
    const down = (e: KeyboardEvent) => {
      lone = e.key === "Meta" || e.key === "OS";
      if (e.key === "Escape" && useShellStore.getState().activitiesOpen) close();
    };
    const up = (e: KeyboardEvent) => {
      if ((e.key === "Meta" || e.key === "OS") && lone) toggle();
      lone = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [close, toggle]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const launch = (entry?: Entry) => {
    if (!entry) return;
    entry.run();
    close();
  };

  const openWindows = windows;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Activities"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 overflow-y-auto bg-mocha-crust/70 backdrop-blur-2xl"
          style={{ zIndex: Z.activities }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="mx-auto flex w-full max-w-4xl flex-col px-4 pt-16 pb-28 sm:px-8"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <label className="mx-auto flex w-full max-w-md items-center gap-3 rounded-full border border-white/10 bg-mocha-base/80 px-4 py-2.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] focus-within:border-mocha-mauve/60">
              <PiMagnifyingGlassBold className="size-4 text-mocha-overlay2" aria-hidden />
              <span className="sr-only">Search apps</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") launch(results[active]);
                  if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((i) => Math.min(results.length - 1, i + 1));
                  }
                  if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((i) => Math.max(0, i - 1));
                  }
                }}
                placeholder="Type to search"
                className="w-full bg-transparent text-base text-mocha-text placeholder:text-mocha-overlay1 focus:outline-none"
              />
            </label>

            {openWindows.length > 0 && !query && (
              <section aria-label="Open windows" className="mt-8">
                <h2 className="mb-3 text-sm font-medium text-mocha-subtext0">Open windows</h2>
                <div className="flex flex-wrap gap-2">
                  {openWindows.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        focusWindow(w.id);
                        close();
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-mocha-base/70 py-1.5 pr-4 pl-2 text-sm text-mocha-text transition hover:bg-mocha-surface0 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-mocha-mauve"
                    >
                      <AppIcon icon={apps[w.appId].icon} label="" size={22} />
                      {w.title}
                      {w.isMinimized && <span className="text-xs text-mocha-overlay1">minimized</span>}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section aria-label="Applications" className="mt-8">
              {!query && <h2 className="mb-3 text-sm font-medium text-mocha-subtext0">Applications</h2>}
              {results.length === 0 ? (
                <p className="py-16 text-center text-mocha-subtext0">
                  Nothing matches &ldquo;{query}&rdquo;. Try &ldquo;resume&rdquo; or &ldquo;projects&rdquo;.
                </p>
              ) : (
                <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {results.map((entry, i) => (
                    <motion.li
                      key={entry.id}
                      initial={reduce ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: reduce ? 0 : Math.min(i, 12) * 0.02, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <button
                        type="button"
                        onClick={() => launch(entry)}
                        onMouseEnter={() => setActive(i)}
                        title={entry.description}
                        className={`flex w-full flex-col items-center gap-2 rounded-2xl p-3 text-center transition active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-mocha-mauve ${
                          i === active && query ? "bg-white/10" : "hover:bg-white/10"
                        }`}
                      >
                        <AppIcon icon={entry.icon} label={entry.title} size={56} />
                        <span className="flex items-center gap-1 text-[13px] font-medium text-mocha-text">
                          {entry.title}
                          {entry.external && <PiArrowSquareOutBold className="size-3 text-mocha-overlay2" aria-label="opens in a new tab" />}
                        </span>
                      </button>
                    </motion.li>
                  ))}
                </ul>
              )}
            </section>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Activities;
