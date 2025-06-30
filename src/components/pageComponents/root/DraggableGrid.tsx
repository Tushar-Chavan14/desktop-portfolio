"use client";

import React, { MouseEventHandler, useState } from "react";
import { FcManager } from "react-icons/fc";

interface GridItem2 {
  id: string;
  clickHandler: MouseEventHandler<HTMLButtonElement>;
  index: number;
  icon: React.FC<{ size?: number }>;
  label: string;
}

interface DraggableGridProps {
  iconItems: GridItem2[];
}

const DraggableGrid: React.FC<DraggableGridProps> = ({ iconItems }) => {
  const [gridItems, setGridItems] = useState<(GridItem2 | null)[]>(() => {
    const items: (GridItem2 | null)[] = Array(55).fill(null);

    iconItems.forEach((item) => {
      if (item.index >= 0 && item.index < 55) {
        items[item.index] = item;
      }
    });

    return items;
  });

  const [draggedItem, setDraggedItem] = useState<GridItem2 | null>(null);
  const [draggedFromIndex, setDraggedFromIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    if (gridItems[index]) {
      setDraggedItem(gridItems[index]);
      setDraggedFromIndex(index);
      e.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    dropIndex: number
  ) => {
    e.preventDefault();

    if (draggedItem && draggedFromIndex !== null) {
      if (gridItems[dropIndex] === null) {
        const newGridItems = [...gridItems];
        newGridItems[draggedFromIndex] = null; // Remove from original position
        newGridItems[dropIndex] = draggedItem; // Place in new position
        setGridItems(newGridItems);
      }
    }

    setDraggedItem(null);
    setDraggedFromIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedFromIndex(null);
    setDragOverIndex(null);
  };

  return (
    <>
      <div className="grid grid-rows-5 grid-cols-11  w-full h-full">
        {gridItems.map((item, index) => (
          <div
            key={index}
            className={`
            flex items-center justify-center
              ${item ? "cursor-grab" : "cursor-default"}
              ${dragOverIndex === index ? "bg-mocha-mauve/20" : ""}
              ${index === draggedFromIndex ? "opacity-50" : ""}
              transition-all duration-200
            `}
            draggable={!!item}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            {item && (
              <button
                onClick={item.clickHandler}
                className="focus:outline-none hover:scale-110 transition-transform duration-200"
              >
                <div>
                  <item.icon size={75} />
                  <label>{item.label}</label>
                </div>
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default DraggableGrid;
