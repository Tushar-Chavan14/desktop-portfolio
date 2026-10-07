"use client";

import React, { useState } from "react";
import { Modal, ModalBackdropProps, Button, Spinner } from "@heroui/react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "outline"
  | "ghost"
  | "danger"
  | "danger-soft";

interface MacOSButton {
  label?: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  isPending?: boolean;
  isDisabled?: boolean;
}

export interface CommonModalProps
  extends Omit<ModalBackdropProps, "children" | "className" | "variant"> {
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

// Catppuccin Mocha overrides for HeroUI button variants
const buttonVariantClasses: Partial<Record<ButtonVariant, string>> = {
  primary: "bg-mocha-mauve text-mocha-base",
  secondary: "bg-mocha-blue text-mocha-base",
  outline: "border-mocha-surface2 text-mocha-text",
  ghost: "text-mocha-text",
  danger: "bg-mocha-red text-mocha-base",
};

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
  onOpenChange,
  ...backdropProps
}) => {
  const [modalVarient, setmodalVarient] = useState<"normal" | "fullscreen">(
    variant
  );
  const isFullscreen = modalVarient === "fullscreen";

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange?.(isOpen);
    if (!isOpen) {
      onClose?.();
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
    <Modal>
      <Modal.Backdrop
        className={
          isFullscreen ? "bg-black/80" : "bg-black/50 backdrop-blur-xs"
        }
        onOpenChange={handleOpenChange}
        {...backdropProps}
      >
        <Modal.Container
          size={isFullscreen ? "full" : "lg"}
          scroll="inside"
          className={isFullscreen ? "" : "sm:w-full"}
        >
          <Modal.Dialog
            className={`
              bg-mocha-base border border-mocha-surface1 p-0
              ${
                isFullscreen
                  ? "m-0 rounded-none h-screen w-screen"
                  : "rounded-xl shadow-2xl max-w-5xl w-full mx-auto my-auto"
              }
            `}
          >
            {({ close }) => (
              <>
                {/* macOS Style Header */}
                <Modal.Header
                  className={`
                    flex flex-row items-center justify-between px-4 py-3
                    bg-linear-to-r from-mocha-surface0 to-mocha-surface1
                    border-b border-mocha-surface2 rounded-t-xl
                    ${headerClassName}
                  `}
                >
                  {/* macOS Traffic Light Buttons */}
                  {showMacOSButtons && (
                    <div className="flex items-center space-x-2">
                      {/* Close Button (Red) */}
                      <button
                        onClick={close}
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
                    <Modal.Heading
                      className={`
                      text-mocha-text font-semibold text-lg flex-1 text-center
                      ${showMacOSButtons ? "mr-16" : ""}
                    `}
                    >
                      {title}
                    </Modal.Heading>
                  )}

                  {/* Spacer for alignment when no macOS buttons */}
                  {!showMacOSButtons && <div className="w-16" />}
                </Modal.Header>

                {/* Modal Body */}
                <Modal.Body
                  className={`
                    m-0 px-6 py-4 bg-mocha-base text-mocha-text rounded-xl
                    ${variant === "fullscreen" ? "flex-1 overflow-auto" : ""}
                    ${bodyClassName}
                  `}
                >
                  {children}
                </Modal.Body>

                {/* Modal Footer */}
                {showFooter && footerButtons.length > 0 && (
                  <Modal.Footer
                    className={`
                      px-3 py-3 bg-mocha-surface0 border-t border-mocha-surface1
                      rounded-b-xl flex justify-end space-x-3
                      ${footerClassName}
                    `}
                  >
                    {footerButtons.map((button, index) => {
                      const buttonVariant = button.variant || "primary";

                      return (
                        <Button
                          key={index}
                          variant={buttonVariant}
                          onPress={button.onPress}
                          isPending={button.isPending}
                          isDisabled={button.isDisabled}
                          className={`
                            min-w-20 rounded-lg
                            hover:opacity-80 transition-opacity duration-200
                            ${buttonVariantClasses[buttonVariant] ?? ""}
                          `}
                        >
                          {({ isPending }) => (
                            <>
                              {isPending && (
                                <Spinner color="current" size="sm" />
                              )}
                              {button.label}
                            </>
                          )}
                        </Button>
                      );
                    })}
                  </Modal.Footer>
                )}
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};
