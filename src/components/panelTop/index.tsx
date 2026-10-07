"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { PiFileTextBold, PiSignpostBold } from "react-icons/pi";
import DateAndTime from "./dateAndTime";
import ControlCenter from "./controlCenter";
import useWindowStore from "@src/store/zustore/useWindowStore";
import useShellStore from "@src/store/zustore/useShellStore";
import { apps } from "@src/apps/meta";
import { AppIcon } from "@src/components/appIcon/AppIcon";
import { TOP_BAR_HEIGHT, Z } from "@src/constants/layout";
import { panelButton } from "./styles";
import { setViewMode } from "@src/lib/viewMode";

const FocusedApp = () => {
  const focused = useWindowStore((s) => s.windows.find((w) => w.id === s.focusedId));
  const meta = focused ? apps[focused.appId] : null;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {meta && (
        <motion.span
          key={meta.id}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          className="hidden items-center gap-2 text-[13px] font-semibold text-mocha-text sm:inline-flex"
        >
          <AppIcon icon={meta.icon} label="" size={16} />
          {meta.title}
        </motion.span>
      )}
    </AnimatePresence>
  );
};

const TopPanel = () => {
  const activitiesOpen = useShellStore((s) => s.activitiesOpen);
  const toggleActivities = useShellStore((s) => s.toggleActivities);
  const startTour = useShellStore((s) => s.startTour);

  return (
    <header
      className="fixed inset-x-0 top-0 grid grid-cols-[1fr_auto_1fr] items-center bg-mocha-crust/85 px-1.5 backdrop-blur-xl"
      style={{ height: TOP_BAR_HEIGHT, zIndex: Z.topBar }}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleActivities}
          aria-expanded={activitiesOpen}
          className={`${panelButton} ${activitiesOpen ? "bg-white/15" : ""}`}
        >
          Activities
        </button>
        <FocusedApp />
      </div>
      <DateAndTime />
      <div className="flex items-center justify-end gap-1">
        <button type="button" onClick={startTour} className={`${panelButton} hidden lg:inline-flex`}>
          <PiSignpostBold className="size-4" aria-hidden />
          Tour
        </button>
        <Link
          href="/overview"
          data-tour="simple-view"
          onClick={() => setViewMode("quick")}
          className={`${panelButton} bg-white/10`}
        >
          <PiFileTextBold className="size-4" aria-hidden />
          Simple view
        </Link>
        <ControlCenter />
      </div>
    </header>
  );
};

export default TopPanel;
