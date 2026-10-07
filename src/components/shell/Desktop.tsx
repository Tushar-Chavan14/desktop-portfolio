"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";
import type { AppId } from "@src/apps/meta";
import TopPanel from "@src/components/panelTop";
import BottomDock from "@src/components/dock/bottomDock";
import WindowManager from "@src/components/modals/windows/windowManger";
import ModalManager from "@src/components/modals/modalManger";
import Activities from "@src/components/activities/Activities";
import DesktopContextMenu from "@src/components/contextMenu/globalContextMenu";
import IconGrid from "@src/components/pageComponents/root/iconGrid";
import MobileShell from "@src/components/mobile/MobileShell";
import PowerOverlay from "@src/components/power/PowerOverlay";
import Wallpaper from "@src/components/wallpaperWrap";
import Door from "@src/components/door/Door";
import Tour from "@src/components/tour/Tour";
import useWindowStore from "@src/store/zustore/useWindowStore";
import useShellStore from "@src/store/zustore/useShellStore";
import { useIsMobile } from "@src/hooks/useIsMobile";
import { getViewMode, setViewMode } from "@src/lib/viewMode";
import { DOCK_RESERVE, TOP_BAR_HEIGHT } from "@src/constants/layout";

/** Opens the app named in the URL (e.g. /projects) once the shell is ready. */
const useInitialApp = (initialApp: AppId | undefined, isMobile: boolean | null) => {
  useEffect(() => {
    if (isMobile === null || !initialApp) return;
    const { openApp, windows } = useWindowStore.getState();
    if (!windows.length) openApp(initialApp);
  }, [initialApp, isMobile]);
};

/** Ctrl+Alt+T opens a terminal, as on most Linux desktops. */
const useGlobalShortcuts = () => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        useWindowStore.getState().openApp("terminal");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
};

/**
 * Decides whether to show the first-visit choice screen. Returning visitors go
 * straight to the view they picked last time; deep links skip the choice.
 */
const useDoor = (initialApp: AppId | undefined) => {
  const router = useRouter();
  const [showDoor, setShowDoor] = useState(false);

  useEffect(() => {
    if (initialApp) return;
    const mode = getViewMode();
    if (mode === "quick") router.replace("/overview");
    else if (mode === null) setShowDoor(true);
  }, [initialApp, router]);

  return { showDoor, setShowDoor, router };
};

export default function Desktop({ initialApp }: { initialApp?: AppId }) {
  const isMobile = useIsMobile();
  const startTour = useShellStore((s) => s.startTour);
  const { showDoor, setShowDoor, router } = useDoor(initialApp);
  useInitialApp(initialApp, isMobile);
  useGlobalShortcuts();

  return (
    <>
      <Wallpaper />
      {isMobile === false && (
        <>
          <TopPanel />
          <main id="desktop" className="fixed inset-x-0" style={{ top: TOP_BAR_HEIGHT, bottom: DOCK_RESERVE - 16 }}>
            <DesktopContextMenu>
              <IconGrid />
            </DesktopContextMenu>
          </main>
          <WindowManager />
          <BottomDock />
          <Activities />
          <Tour />
          <ModalManager />
        </>
      )}
      {isMobile === true && <MobileShell />}
      <AnimatePresence>
        {showDoor && (
          <Door
            onQuickView={() => {
              setViewMode("quick");
              router.push("/overview");
            }}
            onDesktop={() => {
              setViewMode("desktop");
              setShowDoor(false);
              // The phone launcher is already self-explanatory; the tour is for the desktop.
              if (!isMobile) startTour();
            }}
          />
        )}
      </AnimatePresence>
      <PowerOverlay />
    </>
  );
}
