"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import useBackgroundStore from "@src/store/zustore/useBackgroundStore";

/** Fixed wallpaper layer with a crossfade when the wallpaper changes. */
const Wallpaper = () => {
  const currentBackground = useBackgroundStore((s) => s.currentBackground);
  const setAvailableBackgrounds = useBackgroundStore((s) => s.setAvailableBackgrounds);

  useEffect(() => {
    fetch("/api/backgrounds")
      .then((r) => r.json())
      .then((data: { backgrounds: string[] }) => setAvailableBackgrounds(data.backgrounds))
      .catch(() => setAvailableBackgrounds([]));
  }, [setAvailableBackgrounds]);

  return (
    <div aria-hidden className="fixed inset-0 -z-10 bg-mocha-crust">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentBackground}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${currentBackground}')` }}
        />
      </AnimatePresence>
      {/* Gentle vignette keeps light icons and labels readable on bright wallpapers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgb(17_17_27/0.45))]" />
    </div>
  );
};

export default Wallpaper;
