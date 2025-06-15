"use client";

import React from "react";
;
import useWindowStore from "@src/store/zustore/useWindowStore";
import CommonWindow from "../commanWindow/commanWindow";

const WindowManager: React.FC = () => {
  const { windows, closeWindow, minimizeWindow } = useWindowStore();

  return (
    <>
      {Object.entries(windows).map(([id, window]) => {
        if (!window.isOpen || window.isMinimized) return null;

        const WindowComponent = window.component;

        return (
          <CommonWindow
            key={id}
            title={window.title}
            isOpen={window.isOpen}
            onClose={() => closeWindow(id)}
            onMinimize={() => minimizeWindow(id)}
            initialWidth={window.initialWidth}
            initialHeight={window.initialHeight}
            initialX={window.initialX}
            initialY={window.initialY}
            minWidth={window.minWidth}
            minHeight={window.minHeight}
            resizable={window.resizable}
            draggable={window.draggable}
          >
            <WindowComponent {...window.props} />
          </CommonWindow>
        );
      })}
    </>
  );
};

export default WindowManager;