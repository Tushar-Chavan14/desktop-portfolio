"use client";

import { AnimatePresence } from "motion/react";
import useWindowStore from "@src/store/zustore/useWindowStore";
import { appComponents } from "@src/apps/registry";
import { TOP_BAR_HEIGHT } from "@src/constants/layout";
import Window from "@src/components/window/Window";

/**
 * Renders every open window inside the workspace (the area below the top bar).
 * Minimised windows stay mounted so apps like Terminal keep their state.
 */
const WindowManager = () => {
  const windows = useWindowStore((s) => s.windows);
  const focusedId = useWindowStore((s) => s.focusedId);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 [&>*]:pointer-events-auto"
      style={{ top: TOP_BAR_HEIGHT }}
    >
      <AnimatePresence>
        {windows.map((win) => {
          const App = appComponents[win.appId];
          const isFocused = win.id === focusedId;
          return (
            <Window key={win.id} win={win} isFocused={isFocused}>
              <App {...win.props} windowId={win.id} isFocused={isFocused} />
            </Window>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default WindowManager;
