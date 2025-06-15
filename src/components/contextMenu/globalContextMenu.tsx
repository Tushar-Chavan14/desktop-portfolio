"use client";
import { useContextMenu } from "@src/hooks/useContextMenu";
import { useEffect } from "react";

export const ContextMenuProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  useEffect(() => {
    const disableDefaultContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Disable default context menu globally
    document.addEventListener("contextmenu", disableDefaultContextMenu);

    return () => {
      document.removeEventListener("contextmenu", disableDefaultContextMenu);
    };
  }, []);

  return <>{children}</>;
};

export default function GlobalContextMenu({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { showContextMenu, ContextMenuComponent } = useContextMenu();

  return (
    <ContextMenuProvider>
      <div onContextMenu={(e) => showContextMenu(e)}>
        {children}
        {ContextMenuComponent}
      </div>
    </ContextMenuProvider>
  );
}
