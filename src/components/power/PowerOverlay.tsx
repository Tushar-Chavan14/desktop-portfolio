"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PiPowerBold } from "react-icons/pi";
import useShellStore from "@src/store/zustore/useShellStore";
import useWindowStore from "@src/store/zustore/useWindowStore";
import { profile } from "@src/data/profile";
import { Z } from "@src/constants/layout";

const SHUTDOWN_LINES = [
  "Stopping user session of tushar...",
  "Stopped target Graphical Interface.",
  "Stopping Network Manager...",
  "Unmounting /home...",
  "Reached target System Power Off.",
];

/** Text-mode shutdown log, one line at a time. */
const ShutdownLog = ({ onDone }: { onDone: () => void }) => {
  const [count, setCount] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (count >= SHUTDOWN_LINES.length) {
      const t = setTimeout(onDone, reduce ? 100 : 450);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCount((c) => c + 1), reduce ? 40 : 260);
    return () => clearTimeout(t);
  }, [count, onDone, reduce]);

  return (
    <div className="flex h-full flex-col justify-end p-6 font-mono text-[13px] text-mocha-subtext0">
      {SHUTDOWN_LINES.slice(0, count).map((line) => (
        <p key={line}>
          <span className="text-mocha-green">[  OK  ]</span> {line}
        </p>
      ))}
    </div>
  );
};

/** Boot splash with a short progress bar. */
const BootSplash = ({ onDone }: { onDone: () => void }) => {
  const reduce = useReducedMotion();
  useEffect(() => {
    const t = setTimeout(onDone, reduce ? 300 : 1900);
    return () => clearTimeout(t);
  }, [onDone, reduce]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8">
      <motion.p
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="font-mono text-2xl font-semibold tracking-tight text-mocha-text"
      >
        {profile.username}
        <span className="text-mocha-mauve">@</span>
        {profile.hostname}
      </motion.p>
      <div className="h-1 w-40 overflow-hidden rounded-full bg-mocha-surface0">
        <motion.div
          className="h-full rounded-full bg-mocha-mauve"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: reduce ? 0.2 : 1.6, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </div>
  );
};

const PowerOverlay = () => {
  const power = useShellStore((s) => s.power);
  const setPower = useShellStore((s) => s.setPower);
  const closeAll = useWindowStore((s) => s.closeAll);
  const visible = power !== "on";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="power"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 bg-[#0b0b12]"
          style={{ zIndex: Z.system }}
        >
          {(power === "shutting-down" || power === "restarting") && (
            <ShutdownLog
              onDone={() => {
                closeAll();
                setPower(power === "restarting" ? "booting" : "off");
              }}
            />
          )}

          {power === "off" && (
            <div className="flex h-full flex-col items-center justify-center gap-5">
              <motion.button
                type="button"
                autoFocus
                onClick={() => setPower("booting")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Power on"
                className="grid size-20 place-items-center rounded-full border border-white/10 bg-mocha-crust text-mocha-subtext0 shadow-[inset_0_1px_0_rgb(255_255_255/0.06)] transition-colors hover:text-mocha-mauve focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mocha-mauve"
              >
                <PiPowerBold className="size-8" aria-hidden />
              </motion.button>
              <p className="text-sm text-mocha-overlay1">Press to start</p>
            </div>
          )}

          {power === "booting" && <BootSplash onDone={() => setPower("on")} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PowerOverlay;
