import { create } from "zustand";

export type PowerState = "on" | "shutting-down" | "restarting" | "off" | "booting";

interface ShellStore {
  activitiesOpen: boolean;
  openActivities: () => void;
  closeActivities: () => void;
  toggleActivities: () => void;
  power: PowerState;
  setPower: (power: PowerState) => void;
  /** Index of the current guided-tour step, or null when the tour is not running. */
  tourStep: number | null;
  startTour: () => void;
  setTourStep: (step: number) => void;
  endTour: () => void;
}

const useShellStore = create<ShellStore>((set) => ({
  activitiesOpen: false,
  openActivities: () => set({ activitiesOpen: true }),
  closeActivities: () => set({ activitiesOpen: false }),
  toggleActivities: () => set((s) => ({ activitiesOpen: !s.activitiesOpen })),
  power: "on",
  setPower: (power) => set({ power }),
  tourStep: null,
  startTour: () => set({ tourStep: 0, activitiesOpen: false }),
  setTourStep: (tourStep) => set({ tourStep }),
  endTour: () => set({ tourStep: null }),
}));

export default useShellStore;
