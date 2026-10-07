/**
 * The visitor's chosen view for this browser session. Session storage (not local
 * storage) so every new visit starts at the choice screen again.
 */
export type ViewMode = "quick" | "desktop";

const KEY = "portfolio:view-mode";

export const getViewMode = (): ViewMode | null => {
  try {
    const value = sessionStorage.getItem(KEY);
    return value === "quick" || value === "desktop" ? value : null;
  } catch {
    return null;
  }
};

export const setViewMode = (mode: ViewMode) => {
  try {
    sessionStorage.setItem(KEY, mode);
  } catch {
    // Storage can be unavailable (private mode); the choice just won't be remembered.
  }
};
