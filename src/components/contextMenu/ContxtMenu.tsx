"use client";

import { useContextMenu } from "@src/hooks/useContextMenu";
import { useState, useEffect, useRef } from "react";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  targetElement?: HTMLElement;
}

interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
  separator?: boolean;
  disabled?: boolean;
}

export const ContextMenu = ({
  x,
  y,
  onClose,
  targetElement,
}: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Define your custom menu items here
  const menuItems: ContextMenuItem[] = [
    {
      id: "refresh",
      label: "Refresh",
      action: () => {
        window.location.reload();
        onClose();
      },
    },
    // {
    //   id: "separator2",
    //   label: "",
    //   separator: true,
    //   action: () => {},
    // },
    {
      id: "chenge-background",
      label: "Change background...",
      action: () => {
        onClose();
      },
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Adjust position if menu would go off screen
  const adjustPosition = () => {
    if (!menuRef.current) return { x, y };

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (x + menuRect.width > viewportWidth) {
      adjustedX = viewportWidth - menuRect.width - 10;
    }

    if (y + menuRect.height > viewportHeight) {
      adjustedY = viewportHeight - menuRect.height - 10;
    }

    return { x: adjustedX, y: adjustedY };
  };

  const { x: adjustedX, y: adjustedY } = adjustPosition();

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-[#232634] rounded-xl shadow-xl p-2 min-w-72"
      style={{
        left: adjustedX,
        top: adjustedY,
      }}
    >
      {menuItems.map((item) => {
        if (item.separator) {
          return <div key={item.id} className="h-px bg-gray-600 mx-2 my-1" />;
        }

        return (
          <button
            key={item.id}
            onClick={item.action}
            disabled={item.disabled}
            className={`
              w-full text-left px-4 py-1.5 text-sm text-white hover:bg-gray-700 hover:text-purple-300 
              disabled:text-gray-500 disabled:cursor-not-allowed
              flex items-center space-x-3 transition-colors duration-150
              rounded-lg
            `}
          >
            {item.icon && <span className="text-base">{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};






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
