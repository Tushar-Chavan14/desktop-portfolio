// Shell geometry shared by the window manager, dock and top bar.
export const TOP_BAR_HEIGHT = 32;
/** Space kept clear above the bottom edge for the dock when placing/maximising windows. */
export const DOCK_RESERVE = 88;
export const MOBILE_BREAKPOINT = 768;

/**
 * z-index scale. Windows get dynamic values starting at WINDOW_BASE, so every
 * fixed layer above them sits far enough away to never collide.
 */
export const Z = {
  desktop: 0,
  windowBase: 100,
  dock: 5000,
  topBar: 5100,
  activities: 6000,
  tour: 6500,
  contextMenu: 7000,
  system: 9000,
} as const;

export const SPRING = { type: "spring", stiffness: 420, damping: 34, mass: 0.9 } as const;
export const SOFT_SPRING = { type: "spring", stiffness: 260, damping: 28 } as const;
