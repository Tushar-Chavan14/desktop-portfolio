import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BackgroundStore {
  currentBackground: string;
  availableBackgrounds: string[];
  selectedBackground: string; // For preview in modal
  setCurrentBackground: (bg: string) => void;
  setSelectedBackground: (bg: string) => void;
  setAvailableBackgrounds: (bgs: string[]) => void;
  applySelectedBackground: () => void;
  removeBackground: (bgPath: string) => void;
}

const useBackgroundStore = create<BackgroundStore>()(
  persist(
    (set, get) => ({
      currentBackground: "/assets/bgs/car-wreck.png", // Default background
      availableBackgrounds: [],
      selectedBackground: "/assets/bgs/car-wreck.png",

      setCurrentBackground: (bg: string) => set({ currentBackground: bg }),

      setSelectedBackground: (bg: string) => set({ selectedBackground: bg }),

      setAvailableBackgrounds: (bgs: string[]) =>
        set({ availableBackgrounds: bgs }),

      applySelectedBackground: () => {
        const { selectedBackground } = get();
        set({ currentBackground: selectedBackground });
      },
      removeBackground: (bgPath: string) => {
        set((state) => ({
          availableBackgrounds: state.availableBackgrounds.filter(
            (bg) => bg !== bgPath
          ),
          // If the removed background was selected, reset to default
          selectedBackground:
            state.selectedBackground === bgPath
              ? "/assets/bgs/car-wreck.jpg"
              : state.selectedBackground,
          currentBackground:
            state.currentBackground === bgPath
              ? "/assets/bgs/car-wreck.jpg"
              : state.currentBackground,
        }));
      },
    }),
    {
      name: "background-storage",
    }
  )
);

export default useBackgroundStore;
