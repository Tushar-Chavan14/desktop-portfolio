"use client";
import useBackgroundStore from "@src/store/zustore/useBackgroundStore";
import React, { useState } from "react";
import { FiCheck, FiUpload, FiX } from "react-icons/fi";

const BackgroundGrid: React.FC<{}> = ({}) => {
  const {
    availableBackgrounds,
    selectedBackground,
    currentBackground,
    setSelectedBackground,
    removeBackground,
  } = useBackgroundStore();

  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  const handleImageSelect = (imagePath: string) => {
    setSelectedBackground(imagePath);
  };

  const handleImageRemove = (imagePath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeBackground(imagePath);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-mocha-text font-semibold text-lg">
          Choose Background
        </h3>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-3 gap-3 max-h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-mocha-surface2 scrollbar-track-mocha-surface0">
        {availableBackgrounds.map((imagePath, index) => (
          <div
            key={index}
            className={`
              relative aspect-video rounded-lg overflow-hidden cursor-pointer
              border-2 transition-all duration-200 group
              ${
                selectedBackground === imagePath
                  ? "border-mocha-blue shadow-lg shadow-mocha-blue/20"
                  : "border-mocha-surface1 hover:border-mocha-surface2"
              }
            `}
            onClick={() => handleImageSelect(imagePath)}
            onMouseEnter={() => setHoveredImage(imagePath)}
            onMouseLeave={() => setHoveredImage(null)}
          >
            {/* Background Image */}
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-200 group-hover:scale-105"
              style={{
                backgroundImage: `url('${imagePath}')`,
              }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-200" />

            {/* Remove Button */}
            {hoveredImage === imagePath && (
              <button
                onClick={(e) => handleImageRemove(imagePath, e)}
                className="absolute top-2 right-2 w-6 h-6 bg-mocha-red hover:bg-red-500 rounded-full flex items-center justify-center transition-colors duration-200 z-10"
                title="Remove background"
              >
                <FiX size={12} className="text-white" />
              </button>
            )}

            {/* Selected Indicator */}
            {selectedBackground === imagePath && (
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-mocha-blue rounded-full flex items-center justify-center">
                <FiCheck size={12} className="text-white" />
              </div>
            )}

            {/* Currently Active Indicator */}
            {currentBackground === imagePath && (
              <div className="absolute top-2 left-2 px-2 py-1 bg-mocha-green rounded text-xs font-medium text-white">
                Active
              </div>
            )}
          </div>
        ))}

        {/* Empty State */}
        {availableBackgrounds.length === 0 && (
          <div className="col-span-3 flex flex-col items-center justify-center py-12 text-mocha-subtext0">
            <FiUpload size={48} className="mb-4 opacity-50" />
            <p className="text-center">
              No backgrounds found. Add some images to the
              <br />
              <code className="bg-mocha-surface1 px-2 py-1 rounded text-xs">
                public/assets/bgs/
              </code>
              <br />
              folder to get started.
            </p>
          </div>
        )}
      </div>

      {/* Preview Info */}
      {selectedBackground && (
        <div className="mt-4 p-3 bg-mocha-surface0 rounded-lg">
          <p className="text-mocha-subtext1 text-sm">
            <span className="font-medium">Selected:</span>{" "}
            {selectedBackground.split("/").pop()}
          </p>
          {selectedBackground !== currentBackground && (
            <p className="text-mocha-yellow text-xs mt-1">
              Click "Apply Changes" to set as background
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BackgroundGrid;
