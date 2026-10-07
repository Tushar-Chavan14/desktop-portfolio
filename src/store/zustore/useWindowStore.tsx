import { create } from "zustand";
import { apps, type AppId } from "@src/apps/meta";
import { DOCK_RESERVE, TOP_BAR_HEIGHT } from "@src/constants/layout";

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowInstance extends Bounds {
  id: string;
  appId: AppId;
  title: string;
  props?: Record<string, unknown>;
  z: number;
  isMinimized: boolean;
  isMaximized: boolean;
  /** Bounds to return to when un-maximising. */
  restoreBounds?: Bounds;
}

interface WindowStore {
  windows: WindowInstance[];
  focusedId: string | null;
  topZ: number;
  /** Open an app, or focus/restore its existing window. Returns the window id. */
  openApp: (appId: AppId, props?: Record<string, unknown>) => string;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  setBounds: (id: string, bounds: Partial<Bounds>) => void;
  setTitle: (id: string, title: string) => void;
  /** Dock click behaviour: open, focus, or minimise when already focused. */
  activateApp: (appId: AppId) => void;
  closeAll: () => void;
}

/**
 * The area windows may occupy, in workspace coordinates. Windows render inside
 * a container that starts below the top bar, so y = 0 is the top bar's bottom edge.
 */
export const getWorkspace = () => {
  const vw = typeof window === "undefined" ? 1440 : window.innerWidth;
  const vh = typeof window === "undefined" ? 900 : window.innerHeight;
  return {
    x: 0,
    y: 0,
    width: vw,
    height: Math.max(240, vh - TOP_BAR_HEIGHT - DOCK_RESERVE),
  };
};

const initialBounds = (appId: AppId, openCount: number): Bounds => {
  const meta = apps[appId];
  const ws = getWorkspace();
  const width = Math.min(meta.width, ws.width - 32);
  const height = Math.min(meta.height, ws.height - 16);
  // Centre in the workspace, then cascade so stacked windows stay visible.
  const cascade = (openCount % 6) * 28;
  const x = Math.max(8, Math.round((ws.width - width) / 2) + cascade - 56);
  const y = Math.max(ws.y + 8, ws.y + Math.round((ws.height - height) / 3) + cascade);
  // Keep the whole window inside the workspace even after cascading.
  return {
    x: Math.min(x, Math.max(8, ws.width - width - 8)),
    y: Math.min(y, Math.max(ws.y + 8, ws.y + ws.height - height - 8)),
    width,
    height,
  };
};

let instanceCounter = 0;

const topVisible = (windows: WindowInstance[]) =>
  windows
    .filter((w) => !w.isMinimized)
    .sort((a, b) => b.z - a.z)[0]?.id ?? null;

const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  focusedId: null,
  topZ: 0,

  openApp: (appId, props) => {
    const { windows, topZ } = get();
    const existing = !apps[appId].multiInstance
      ? windows.find((w) => w.appId === appId)
      : undefined;
    const z = topZ + 1;

    if (existing) {
      set({
        windows: windows.map((w) =>
          w.id === existing.id
            ? { ...w, z, isMinimized: false, props: props ? { ...w.props, ...props } : w.props }
            : w
        ),
        focusedId: existing.id,
        topZ: z,
      });
      return existing.id;
    }

    const id = `${appId}-${++instanceCounter}`;
    const sameApp = windows.filter((w) => w.appId === appId).length;
    const instance: WindowInstance = {
      id,
      appId,
      title: sameApp ? `${apps[appId].title} ${sameApp + 1}` : apps[appId].title,
      props,
      z,
      isMinimized: false,
      isMaximized: false,
      ...initialBounds(appId, windows.length),
    };
    set({ windows: [...windows, instance], focusedId: id, topZ: z });
    return id;
  },

  closeWindow: (id) =>
    set((state) => {
      const windows = state.windows.filter((w) => w.id !== id);
      return {
        windows,
        focusedId: state.focusedId === id ? topVisible(windows) : state.focusedId,
      };
    }),

  focusWindow: (id) =>
    set((state) => {
      if (state.focusedId === id) return state;
      const z = state.topZ + 1;
      return {
        windows: state.windows.map((w) => (w.id === id ? { ...w, z, isMinimized: false } : w)),
        focusedId: id,
        topZ: z,
      };
    }),

  minimizeWindow: (id) =>
    set((state) => {
      const windows = state.windows.map((w) => (w.id === id ? { ...w, isMinimized: true } : w));
      return { windows, focusedId: state.focusedId === id ? topVisible(windows) : state.focusedId };
    }),

  toggleMaximize: (id) =>
    set((state) => ({
      windows: state.windows.map((w) => {
        if (w.id !== id) return w;
        if (w.isMaximized) {
          return { ...w, ...(w.restoreBounds ?? {}), isMaximized: false, restoreBounds: undefined };
        }
        const ws = getWorkspace();
        return {
          ...w,
          restoreBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
          isMaximized: true,
          x: ws.x,
          y: ws.y,
          width: ws.width,
          height: ws.height,
        };
      }),
    })),

  setBounds: (id, bounds) =>
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, ...bounds } : w)),
    })),

  setTitle: (id, title) =>
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, title } : w)),
    })),

  activateApp: (appId) => {
    const { windows, focusedId, openApp, focusWindow, minimizeWindow } = get();
    const appWindows = windows.filter((w) => w.appId === appId);
    if (appWindows.length === 0) {
      openApp(appId);
      return;
    }
    const focused = appWindows.find((w) => w.id === focusedId);
    if (focused) {
      minimizeWindow(focused.id);
      return;
    }
    const top = [...appWindows].sort((a, b) => b.z - a.z)[0];
    focusWindow(top.id);
  },

  closeAll: () => set({ windows: [], focusedId: null }),
}));

export default useWindowStore;
