"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Rnd } from "react-rnd";

interface CommonWindowProps {
  title?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;

  initialWidth?: number;
  initialHeight?: number;
  initialX?: number;
  initialY?: number;

  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;

  children: React.ReactNode;
  headerClassName?: string;
  bodyClassName?: string;
  resizable?: boolean;
  draggable?: boolean;
  showMacOSButtons?: boolean;
}

const MacButton: React.FC<{
  color: "red" | "yellow" | "green";
  onClick?: () => void;
  label: string;
}> = ({ color, onClick, label }) => {
  const colorMap: Record<string, string> = {
    red: "bg-mocha-red hover:bg-red-400 text-red-900",
    yellow: "bg-mocha-yellow hover:bg-yellow-400 text-yellow-900",
    green: "bg-mocha-green hover:bg-green-400 text-green-900",
  };

  return (
    <button
      onClick={onClick}
      className={`w-4 h-4 rounded-full ${colorMap[color]} transition-colors duration-200 flex items-center justify-center group`}
      aria-label={label}
    >
      <span className="text-xs opacity-0 group-hover:opacity-100 font-bold">
        {label}
      </span>
    </button>
  );
};

interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WindowState {
  isMaximized: boolean;
  prevBounds?: Bounds;
}

const CommonWindow: React.FC<CommonWindowProps> = ({
  title,
  isOpen = true,
  onClose,
  onMinimize,
  initialWidth = 800,
  initialHeight = 600,
  initialX = 100,
  initialY = 100,
  minWidth = 300,
  minHeight = 200,
  maxWidth = typeof window !== "undefined" ? window.innerWidth : 1920,
  maxHeight = typeof window !== "undefined" ? window.innerHeight : 1080,
  children,
  headerClassName = "",
  bodyClassName = "",
  resizable = true,
  draggable = true,
  showMacOSButtons = true,
}) => {
  const [windowState, setWindowState] = useState<WindowState>({
    isMaximized: false,
  });

  const [bounds, setBounds] = useState<Bounds>({
    x: initialX,
    y: initialY,
    width: initialWidth,
    height: initialHeight,
  });

  const handleMaximize = useCallback(() => {
    setWindowState((prev) => {
      if (prev.isMaximized && prev.prevBounds) {
        setBounds(prev.prevBounds);
        return { isMaximized: false };
      }
      const newBounds = {
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
      setBounds(newBounds);
      return { isMaximized: true, prevBounds: bounds };
    });
  }, [bounds]);

  if (!isOpen) return null;

  const handleDragStop = (_: any, d: { x: number; y: number }) => {
    setBounds((prev) => ({ ...prev, x: d.x, y: d.y }));
  };

  const macButtons = useMemo(
    () => (
      <div className="flex items-center space-x-2">
        <MacButton color="red" onClick={onClose} label="×" />
        {/* <MacButton color="yellow" onClick={onMinimize} label="−" /> */}
        <MacButton
          color="green"
          onClick={handleMaximize}
          label={windowState.isMaximized ? "−" : "+"}
        />
      </div>
    ),
    [onClose, onMinimize, handleMaximize, windowState.isMaximized]
  );

  return (
    <Rnd
      position={{ x: bounds.x, y: bounds.y }}
      size={{ width: bounds.width, height: bounds.height }}
      minWidth={minWidth}
      minHeight={minHeight}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      disableDragging={!draggable || windowState.isMaximized}
      enableResizing={resizable && !windowState.isMaximized}
      dragHandleClassName="window-drag-handle"
      bounds="window"
      onDragStop={handleDragStop}
      onResizeStop={(_e, _, ref, __, position) => {
        setBounds({
          x: position.x,
          y: position.y,
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        });
      }}
      className={`bg-mocha-base border border-mocha-surface1 shadow-2xl ${
        windowState.isMaximized ? "rounded-none" : "rounded-xl"
      }`}
      style={{ zIndex: 50 }}
    >
      {/* Header */}
      <div
        className={`
          window-drag-handle flex items-center justify-between px-4 py-3
          bg-gradient-to-r from-mocha-surface0 to-mocha-surface1
          border-b border-mocha-surface2
          ${windowState.isMaximized ? "rounded-none" : "rounded-t-xl"}
          ${
            draggable && !windowState.isMaximized
              ? "cursor-grab active:cursor-grabbing"
              : ""
          }
          ${headerClassName}
        `}
      >
        {showMacOSButtons && macButtons}

        {title && (
          <h2
            className={`text-mocha-text font-semibold text-lg flex-1 text-center ${
              showMacOSButtons ? "mr-16" : ""
            }`}
          >
            {title}
          </h2>
        )}

        {!showMacOSButtons && <div className="w-16" />}
      </div>

      {/* Body */}
      <div
        className={`
          bg-mocha-base text-mocha-text overflow-auto
          ${windowState.isMaximized ? "rounded-none" : "rounded-b-xl"}
          ${bodyClassName}
        `}
        style={{ height: "calc(100% - 55px)" }}
      >
        {children}
      </div>
    </Rnd>
  );
};

// macOS style window control button

export default CommonWindow;
