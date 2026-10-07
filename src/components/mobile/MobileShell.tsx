"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { format } from "date-fns";
import Link from "next/link";
import { setViewMode } from "@src/lib/viewMode";
import { PiFileTextBold, PiArrowSquareOutBold, PiCaretLeftBold, PiWifiHighBold, PiBatteryHighFill } from "react-icons/pi";
import { apps, externalLinks, type AppId } from "@src/apps/meta";
import { appComponents } from "@src/apps/registry";
import { AppIcon } from "@src/components/appIcon/AppIcon";
import { Monogram } from "@src/apps/ui";
import { profile } from "@src/data/profile";
import useWindowStore from "@src/store/zustore/useWindowStore";
import { useNow } from "@src/hooks/useNow";

const homeApps: AppId[] = ["about", "projects", "resume", "contact", "mail", "calendar", "terminal", "browser", "code", "spotify", "editor", "welcome"];
const dock: AppId[] = ["about", "projects", "terminal", "contact"];

const StatusBar = () => {
  const now = useNow();
  return (
    <div className="flex h-11 shrink-0 items-center justify-between px-6 text-[13px] font-semibold text-white tabular-nums">
      <span>{now ? format(now, "h:mm") : ""}</span>
      <span className="flex items-center gap-1.5">
        <PiWifiHighBold className="size-4" aria-hidden />
        <PiBatteryHighFill className="size-5" aria-hidden />
      </span>
    </div>
  );
};

const LaunchButton = ({ id, onLaunch, showLabel = true }: { id: AppId; onLaunch: (id: AppId) => void; showLabel?: boolean }) => (
  <button
    type="button"
    onClick={() => onLaunch(id)}
    className="flex flex-col items-center gap-1.5 rounded-2xl outline-none active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-mocha-mauve"
  >
    <AppIcon icon={apps[id].icon} label={apps[id].title} size={58} />
    {showLabel && (
      <span className="max-w-18 truncate text-xs font-medium text-white [text-shadow:0_1px_3px_rgb(17_17_27/0.9)]">
        {apps[id].title}
      </span>
    )}
  </button>
);

/**
 * Phone layout: a home screen of apps; the focused window renders full-screen
 * on top. It reads the same window store as the desktop, so in-app links like
 * "open Contact" work identically.
 */
const MobileShell = () => {
  const windows = useWindowStore((s) => s.windows);
  const focusedId = useWindowStore((s) => s.focusedId);
  const openApp = useWindowStore((s) => s.openApp);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const reduce = useReducedMotion();
  const now = useNow();

  const active = windows.find((w) => w.id === focusedId && !w.isMinimized);
  const ActiveApp = active ? appComponents[active.appId] : null;

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-mocha-crust/30">
      <StatusBar />

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-4">
        <section className="mt-4 rounded-3xl border border-white/10 bg-mocha-crust/60 p-5 backdrop-blur-xl" aria-label="Profile">
          <div className="flex items-center gap-4">
            <Monogram size={56} />
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-mocha-text">{profile.name}</h1>
              <p className="text-sm text-mocha-subtext1">{profile.role}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-mocha-subtext1">{profile.shortBio}</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            {now && <p className="text-xs text-mocha-overlay1">{format(now, "EEEE, MMMM d")}</p>}
            <Link
              href="/overview"
              onClick={() => setViewMode("quick")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-mocha-text active:scale-95"
            >
              <PiFileTextBold className="size-4" aria-hidden />
              Simple view
            </Link>
          </div>
        </section>

        <ul className="mt-8 grid grid-cols-4 gap-x-2 gap-y-6" aria-label="Apps">
          {homeApps.map((id) => (
            <li key={id} className="flex justify-center">
              <LaunchButton id={id} onLaunch={openApp} />
            </li>
          ))}
          {externalLinks.map((link) => (
            <li key={link.id} className="flex justify-center">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 rounded-2xl outline-none active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-mocha-mauve"
              >
                <AppIcon icon={link.icon} label={link.title} size={58} />
                <span className="flex items-center gap-1 text-xs font-medium text-white [text-shadow:0_1px_3px_rgb(17_17_27/0.9)]">
                  {link.title}
                  <PiArrowSquareOutBold className="size-3" aria-label="opens in a new tab" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </main>

      <nav
        aria-label="Favourites"
        className="mx-3 mb-[max(0.75rem,env(safe-area-inset-bottom))] flex shrink-0 justify-around rounded-[28px] border border-white/10 bg-mocha-crust/60 px-3 py-3 backdrop-blur-xl"
      >
        {dock.map((id) => (
          <LaunchButton key={id} id={id} onLaunch={openApp} showLabel={false} />
        ))}
      </nav>

      <AnimatePresence>
        {active && ActiveApp && (
          <motion.div
            key={active.id}
            role="dialog"
            aria-modal="true"
            aria-label={active.title}
            initial={reduce ? { opacity: 0 } : { y: "100%" }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="fixed inset-0 z-10 flex flex-col bg-mocha-base pt-[env(safe-area-inset-top)]"
          >
            <header className="flex h-12 shrink-0 items-center gap-2 border-b border-mocha-surface0 bg-mocha-mantle px-2">
              <button
                type="button"
                onClick={() => closeWindow(active.id)}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[15px] font-medium text-mocha-mauve active:scale-95 focus-visible:outline-2 focus-visible:outline-mocha-mauve"
              >
                <PiCaretLeftBold className="size-4" aria-hidden />
                Home
              </button>
              <h2 className="flex-1 truncate pr-16 text-center text-[15px] font-semibold text-mocha-text">{active.title}</h2>
            </header>
            <div className="relative min-h-0 flex-1 pb-[env(safe-area-inset-bottom)] text-mocha-text">
              <ActiveApp {...active.props} windowId={active.id} isMobile isFocused />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileShell;
