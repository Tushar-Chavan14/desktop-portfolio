// src/store/zustore/useWindowStore.ts
import { create } from "zustand";

interface WindowConfig {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  props?: any;
  isOpen: boolean;
  isMinimized: boolean;
  initialWidth?: number;
  initialHeight?: number;
  initialX?: number;
  initialY?: number;
  minWidth?: number;
  minHeight?: number;
  resizable?: boolean;
  draggable?: boolean;
}

interface WindowStore {
  windows: Record<string, WindowConfig>;
  openWindow: (config: Omit<WindowConfig, "isOpen" | "isMinimized">) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<WindowConfig>) => void;
  listMinimisedWindows: () => Array<{
    id: string;
    title: string;
    initialWidth?: number;
    initialHeight?: number;
    initialX?: number;
    initialY?: number;
    minWidth?: number;
    minHeight?: number;
    resizable?: boolean;
    draggable?: boolean;
  }>;
}

const useWindowStore = create<WindowStore>((set, get) => ({
  windows: {},

  openWindow: (config) =>
    set((state) => ({
      windows: {
        ...state.windows,
        [config.id]: {
          ...config,
          isOpen: true,
          isMinimized: false,
        },
      },
    })),

  closeWindow: (id) =>
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          isOpen: false,
        },
      },
    })),

  minimizeWindow: (id) =>
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          isMinimized: true,
        },
      },
    })),

  restoreWindow: (id) =>
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          isMinimized: false,
        },
      },
    })),

  updateWindow: (id, updates) =>
    set((state) => ({
      windows: {
        ...state.windows,
        [id]: {
          ...state.windows[id],
          ...updates,
        },
      },
    })),
  listMinimisedWindows: () => {
    return Object.entries(get().windows)
      .filter(([_, window]) => window.isMinimized)
      .map(([id, window]) => ({
        id,
        title: window.title,
        initialWidth: window.initialWidth,
        initialHeight: window.initialHeight,
        initialX: window.initialX,
        initialY: window.initialY,
        minWidth: window.minWidth,
        minHeight: window.minHeight,
        resizable: window.resizable,
        draggable: window.draggable,
      }));
  },
}));

export default useWindowStore;
