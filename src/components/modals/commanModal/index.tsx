"use client"

import React from 'react';
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
  variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "shadow" | "ghost";
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  isLoading?: boolean;
  isDisabled?: boolean;
}

interface CommonModalProps extends Omit<ModalProps, 'children'> {
  // Modal variants
  variant?: 'fullscreen' | 'normal';
  
  // Header props
  title?: string;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
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
  variant = 'normal',
  title,
  onClose,
  onMinimize,
  onMaximize,
  showMacOSButtons = true,
  children,
  footerButtons = [],
  showFooter = true,
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  ...modalProps
}) => {
  // Catppuccin Mocha color scheme
  const colors = {
    base: '#1e1e2e',
    mantle: '#181825',
    crust: '#11111b',
    surface0: '#313244',
    surface1: '#45475a',
    surface2: '#585b70',
    overlay0: '#6c7086',
    overlay1: '#7f849c',
    overlay2: '#9399b2',
    subtext0: '#a6adc8',
    subtext1: '#bac2de',
    text: '#cdd6f4',
    lavender: '#b4befe',
    blue: '#89b4fa',
    sapphire: '#74c7ec',
    sky: '#87ceeb',
    teal: '#94e2d5',
    green: '#a6e3a1',
    yellow: '#f9e2af',
    peach: '#fab387',
    maroon: '#eba0ac',
    red: '#f38ba8',
    mauve: '#cba6f7',
    pink: '#f5c2e7',
    flamingo: '#f2cdcd',
    rosewater: '#f5e0dc',
  };

  const getModalSize = () => {
    if (variant === 'fullscreen') {
      return 'full';
    }
    return 'xl';
  };

  const getModalClassNames = () => {
    const baseClasses = `bg-mocha-base border border-mocha.surface1`;
    
    if (variant === 'fullscreen') {
      return {
        base: `${baseClasses} m-0 rounded-none h-screen w-screen`,
        backdrop: 'bg-black/80',
      };
    }
    
    return {
      base: `${baseClasses} rounded-xl shadow-2xl`,
      backdrop: 'bg-black/50 backdrop-blur-sm',
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
      console.log('Modal minimized');
    }
  };

  const handleMaximize = () => {
    if (onMaximize) {
      onMaximize();
    } else {
      // Default maximize behavior
      console.log('Modal maximized');
    }
  };

  return (
    <Modal
      size={getModalSize()}
      classNames={getModalClassNames()}
      hideCloseButton={true}
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
                      w-3 h-3 rounded-full bg-mocha-red
                      hover:bg-red-400 transition-colors duration-200
                      flex items-center justify-center group
                    `}
                    aria-label="Close"
                  >
                    <span className="text-[8px] text-red-900 opacity-0 group-hover:opacity-100 font-bold">
                      ×
                    </span>
                  </button>
                  
                  {/* Minimize Button (Yellow) */}
                  <button
                    onClick={handleMinimize}
                    className={`
                      w-3 h-3 rounded-full bg-mocha-yellow 
                      hover:bg-yellow-400 transition-colors duration-200
                      flex items-center justify-center group
                    `}
                    aria-label="Minimize"
                  >
                    <span className="text-[8px] text-yellow-900 opacity-0 group-hover:opacity-100 font-bold">
                      −
                    </span>
                  </button>
                  
                  {/* Maximize Button (Green) */}
                  <button
                    onClick={handleMaximize}
                    className={`
                      w-3 h-3 rounded-full bg-[${colors.green}] 
                      hover:bg-green-400 transition-colors duration-200
                      flex items-center justify-center group
                    `}
                    aria-label="Maximize"
                  >
                    <span className="text-[6px] text-green-900 opacity-0 group-hover:opacity-100 font-bold">
                      +
                    </span>
                  </button>
                </div>
              )}
              
              {/* Title */}
              {title && (
                <h2 className={`
                  text-mocha-text font-semibold text-lg flex-1 text-center
                  ${showMacOSButtons ? 'mr-16' : ''}
                `}>
                  {title}
                </h2>
              )}
              
              {/* Spacer for alignment when no macOS buttons */}
              {!showMacOSButtons && <div className="w-16" />}
            </ModalHeader>

            {/* Modal Body */}
            <ModalBody 
              className={`
                px-6 py-4 bg-mocha-base text-mocha-text
                ${variant === 'fullscreen' ? 'flex-1 overflow-auto' : ''}
                ${bodyClassName}
              `}
            >
              {children}
            </ModalBody>

            {/* Modal Footer */}
            {showFooter && footerButtons.length > 0 && (
              <ModalFooter 
                className={`
                  px-6 py-4 bg-mocha-surface0 border-t border-mocha-surface1
                  rounded-b-xl flex justify-end space-x-3
                  ${footerClassName}
                `}
              >
                {footerButtons.map((button, index) => (
                  <Button
                    key={index}
                    variant={button.variant || 'solid'}
                    color={button.color || 'primary'}
                    onPress={button.onClick}
                    isLoading={button.isLoading}
                    isDisabled={button.isDisabled}
                    className={`
                      ${button.color === 'primary' ? `bg-[${colors.blue}] text-[${colors.base}]` : ''}
                      ${button.color === 'danger' ? `bg-[${colors.red}] text-[${colors.base}]` : ''}
                      ${button.color === 'success' ? `bg-[${colors.green}] text-[${colors.base}]` : ''}
                      ${button.color === 'warning' ? `bg-[${colors.yellow}] text-[${colors.base}]` : ''}
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

// Example usage component
export default function ModalExample() {
  const [isNormalOpen, setIsNormalOpen] = React.useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = React.useState(false);

  const normalModalButtons: MacOSButton[] = [
    {
      label: 'Cancel',
      variant: 'bordered',
      color: 'default',
      onClick: () => setIsNormalOpen(false),
    },
    {
      label: 'Save Changes',
      variant: 'solid',
      color: 'primary',
      onClick: () => {
        console.log('Changes saved!');
        setIsNormalOpen(false);
      },
    },
  ];

  const fullscreenModalButtons: MacOSButton[] = [
    {
      label: 'Reset',
      variant: 'bordered',
      color: 'warning',
      onClick: () => console.log('Reset clicked'),
    },
    {
      label: 'Delete',
      variant: 'solid',
      color: 'danger',
      onClick: () => console.log('Delete clicked'),
    },
    {
      label: 'Confirm',
      variant: 'solid',
      color: 'success',
      onClick: () => setIsFullscreenOpen(false),
    },
  ];

  return (
    <div className=" bg-[#1e1e2e] flex items-center justify-center space-x-4">
      <Button
        onClick={() => setIsNormalOpen(true)}
        className="bg-[#89b4fa] text-[#1e1e2e]"
      >
        Open Normal Modal
      </Button>
      
      <Button
        onClick={() => setIsFullscreenOpen(true)}
        className="bg-[#a6e3a1] text-[#1e1e2e]"
      >
        Open Fullscreen Modal
      </Button>

      {/* Normal Modal */}
      <CommonModal
        isOpen={isNormalOpen}
        onOpenChange={setIsNormalOpen}
        variant="normal"
        title="Settings"
        footerButtons={normalModalButtons}
        onClose={() => setIsNormalOpen(false)}
        onMinimize={() => console.log('Normal modal minimized')}
        onMaximize={() => console.log('Normal modal maximized')}
      >
        <div className="space-y-4">
          <p className="text-[#cdd6f4]">
            This is a normal-sized modal with macOS-style window controls.
            The header includes the classic red, yellow, and green buttons.
          </p>
          <div className="p-4 bg-[#313244] rounded-lg">
            <h3 className="text-[#b4befe] font-semibold mb-2">Configuration</h3>
            <p className="text-[#a6adc8]">
              You can customize the modal behavior, styling, and footer buttons
              through props. The color scheme follows Catppuccin Mocha theme.
            </p>
          </div>
        </div>
      </CommonModal>

      {/* Fullscreen Modal */}
      <CommonModal
        isOpen={isFullscreenOpen}
        onOpenChange={setIsFullscreenOpen}
        variant="fullscreen"
        title="Fullscreen Application"
        footerButtons={fullscreenModalButtons}
        onClose={() => setIsFullscreenOpen(false)}
      >
        <div className="h-full flex flex-col space-y-6">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-[#cba6f7] mb-4">
              Fullscreen Modal Demo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#313244] p-6 rounded-lg">
                <h4 className="text-[#74c7ec] font-semibold mb-3">Features</h4>
                <ul className="space-y-2 text-[#a6adc8]">
                  <li>• macOS-style window controls</li>
                  <li>• Catppuccin Mocha color scheme</li>
                  <li>• Responsive design</li>
                  <li>• Customizable footer buttons</li>
                  <li>• Fullscreen and normal variants</li>
                </ul>
              </div>
              <div className="bg-[#313244] p-6 rounded-lg">
                <h4 className="text-[#f9e2af] font-semibold mb-3">Usage</h4>
                <p className="text-[#a6adc8]">
                  This modal component accepts all HeroUI Modal props plus
                  additional customization options for macOS styling and
                  footer buttons.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CommonModal>
    </div>
  );
}