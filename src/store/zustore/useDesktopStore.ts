import { create } from "zustand";
import { persist } from "zustand/middleware";
import { desktopApps, type AppId } from "@src/apps/meta";

export interface Cell {
  col: number;
  row: number;
}

interface DesktopStore {
  positions: Partial<Record<AppId, Cell>>;
  moveIcon: (id: AppId, to: Cell) => void;
  resetPositions: () => void;
  /** Whether the welcome window has been shown once. */
  welcomed: boolean;
  setWelcomed: () => void;
}

const defaultPositions = () =>
  Object.fromEntries(desktopApps.map((id, row) => [id, { col: 0, row }])) as Partial<Record<AppId, Cell>>;

const useDesktopStore = create<DesktopStore>()(
  persist(
    (set) => ({
      positions: defaultPositions(),
      moveIcon: (id, to) =>
        set((state) => {
          const positions = { ...state.positions };
          const from = positions[id];
          // Dropping onto another icon swaps the two.
          const occupant = (Object.keys(positions) as AppId[]).find(
            (key) => key !== id && positions[key]?.col === to.col && positions[key]?.row === to.row
          );
          if (occupant && from) positions[occupant] = from;
          positions[id] = to;
          return { positions };
        }),
      resetPositions: () => set({ positions: defaultPositions() }),
      welcomed: false,
      setWelcomed: () => set({ welcomed: true }),
    }),
    {
      name: "desktop-layout",
      version: 1,
      // Add icons introduced after a visitor's first session without moving existing ones.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<DesktopStore>;
        const positions = { ...defaultPositions(), ...(saved.positions ?? {}) };
        return { ...current, ...saved, positions };
      },
    }
  )
);

export default useDesktopStore;
