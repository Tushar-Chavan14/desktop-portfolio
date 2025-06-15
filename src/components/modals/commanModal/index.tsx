"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalProps,
  Button,
} from "@heroui/react";

interface MacOSButton {
  label?: string;
  onClick?: () => void;
  variant?:
    | "solid"
    | "bordered"
    | "light"
    | "flat"
    | "faded"
    | "shadow"
    | "ghost";
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  isLoading?: boolean;
  isDisabled?: boolean;
}

export interface CommonModalProps extends Omit<ModalProps, "children"> {
  // Modal variants
  variant?: "fullscreen" | "normal";

  // Header props
  title?: string;
  onClose?: () => void;
  onMinimize?: () => void;
  showMacOSButtons?: boolean;

  // Body content
  children: React.ReactNode;

  // Footer buttons
  footerButtons?: MacOSButton[];
  showFooter?: boolean;

  // Custom styling
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

export const CommonModal: React.FC<CommonModalProps> = ({
  variant = "normal",
  title,
  onClose,
  onMinimize,
  showMacOSButtons = true,
  children,
  footerButtons = [],
  showFooter = true,
  headerClassName = "",
  bodyClassName = "",
  footerClassName = "",
  ...modalProps
}) => {
  // Catppuccin Mocha color scheme
  const [modalVarient, setmodalVarient] = useState<"normal" | "fullscreen">(
    variant
  );

  const getModalSize = (variant: string) => {
    if (variant === "fullscreen") {
      return "full";
    }
    return "5xl";
  };

  const getModalClassNames = () => {
    const baseClasses = `bg-mocha-base border border-mocha-surface1 `;

    if (modalVarient === "fullscreen") {
      return {
        base: `${baseClasses} m-0 rounded-none h-screen w-screen`,
        backdrop: "bg-black/80",
      };
    }

    return {
      base: `${baseClasses} rounded-xl shadow-2xl max-w-5xl w-full mx-auto my-auto`,
      backdrop: "bg-black/50 backdrop-blur-sm",
    };
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleMinimize = () => {
    if (onMinimize) {
      onMinimize();
    } else {
      // Default minimize behavior
      console.log("Modal minimized");
    }
  };

  const handleMaximize = () => {
    setmodalVarient((prev) => (prev === "normal" ? "fullscreen" : "normal"));
  };

  return (
    <Modal
      size={getModalSize(modalVarient)}
      classNames={getModalClassNames()}
      hideCloseButton={true}
      scrollBehavior="inside"
      {...modalProps}
    >
      <ModalContent>
        {(onModalClose) => (
          <>
            {/* macOS Style Header */}
            <ModalHeader
              className={`
                flex items-center justify-between px-4 py-3 
                bg-gradient-to-r from-mocha-surface0 to-mocha-surface1]
                border-b border-mocha-surface2 rounded-t-xl
                ${headerClassName}
              `}
            >
              {/* macOS Traffic Light Buttons */}
              {showMacOSButtons && (
                <div className="flex items-center space-x-2">
                  {/* Close Button (Red) */}
                  <button
                    onClick={() => {
                      handleClose();
                      onModalClose();
                    }}
                    className={`
                      w-4 h-4 rounded-full bg-mocha-red
                      hover:bg-red-400 transition-colors duration-200
                      flex items-center justify-center group
                    `}
                    aria-label="Close"
                  >
                    <span className="text-xs text-red-900 opacity-0 group-hover:opacity-100 font-bold">
                      ×
                    </span>
                  </button>

                  {/* Minimize Button (Yellow) */}
                  {/* <button
                    onClick={handleMinimize}
                    className={`
                      w-4 h-4 rounded-full bg-mocha-yellow 
                      hover:bg-yellow-400 transition-colors duration-200
                      flex items-center justify-center group
                    `}
                    aria-label="Minimize"
                  >
                    <span className="text-xs text-yellow-900 opacity-0 group-hover:opacity-100 font-bold">
                      −
                    </span>
                  </button> */}

                  {/* Maximize Button (Green) */}
                  <button
                    onClick={handleMaximize}
                    className={`
                      w-4 h-4 rounded-full bg-mocha-green 
                      hover:bg-green-400 transition-colors duration-200
                      flex items-center justify-center group
                    `}
                    aria-label="Maximize"
                  >
                    <span className="text-xs text-green-900 opacity-0 group-hover:opacity-100 font-bold">
                      {modalVarient === "normal" ? "+" : "−"}
                    </span>
                  </button>
                </div>
              )}

              {/* Title */}
              {title && (
                <h2
                  className={`
                  text-mocha-text font-semibold text-lg flex-1 text-center
                  ${showMacOSButtons ? "mr-16" : ""}
                `}
                >
                  {title}
                </h2>
              )}

              {/* Spacer for alignment when no macOS buttons */}
              {!showMacOSButtons && <div className="w-16" />}
            </ModalHeader>

            {/* Modal Body */}
            <ModalBody
              className={`
                px-6 py-4 bg-mocha-base text-mocha-text rounded-xl
                ${variant === "fullscreen" ? "flex-1 overflow-auto" : ""}
                ${bodyClassName}
              `}
            >
              {children}
            </ModalBody>

            {/* Modal Footer */}
            {showFooter && footerButtons.length > 0 && (
              <ModalFooter
                className={`
                  px-3 py-3 bg-mocha-surface0 border-t border-mocha-surface1
                  rounded-b-xl flex justify-end space-x-3
                  ${footerClassName}
                `}
              >
                {footerButtons.map((button, index) => (
                  <Button
                    key={index}
                    variant={button.variant || "solid"}
                    color={button.color || "primary"}
                    onPress={button.onClick}
                    isLoading={button.isLoading}
                    isDisabled={button.isDisabled}
                    className={`
                      ${
                        button.color === "primary"
                          ? `bg-mocha-blue text-mocha-base`
                          : ""
                      }
                      ${
                        button.color === "secondary"
                          ? `bg-mocha-mauve text-mocha-base`
                          : ""
                      }
                      ${
                        button.color === "danger"
                          ? `bg-mocha-red text-mocha-base`
                          : ""
                      }
                      ${
                        button.color === "success"
                          ? `bg-mocha-green text-mocha-base`
                          : ""
                      }
                      ${
                        button.color === "warning"
                          ? `bg-mocha-yellow text-mocha-base`
                          : ""
                      }
                          rounded-lg
                      hover:opacity-80 transition-opacity duration-200
                    `}
                  >
                    {button.label}
                  </Button>
                ))}
              </ModalFooter>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
