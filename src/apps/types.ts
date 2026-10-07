/** Props every app component receives from the window manager / mobile shell. */
export interface AppComponentProps {
  windowId: string;
  /** True when rendered full-screen in the mobile launcher. */
  isMobile?: boolean;
  /** Whether this window currently has focus (desktop only). */
  isFocused?: boolean;
  [key: string]: unknown;
}
