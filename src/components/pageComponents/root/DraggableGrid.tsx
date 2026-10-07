"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import { apps, desktopApps, type AppId } from "@src/apps/meta";
import { AppIcon } from "@src/components/appIcon/AppIcon";
import useDesktopStore, { type Cell } from "@src/store/zustore/useDesktopStore";
import useWindowStore from "@src/store/zustore/useWindowStore";

const CELL_W = 100;
const CELL_H = 108;
const PADDING = 12;

const cellToPoint = ({ col, row }: Cell) => ({ x: PADDING + col * CELL_W, y: PADDING + row * CELL_H });

const useGridSize = (ref: React.RefObject<HTMLDivElement | null>) => {
  const [size, setSize] = useState({ cols: 1, rows: 1 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () =>
      setSize({
        cols: Math.max(1, Math.floor((el.clientWidth - PADDING * 2) / CELL_W)),
        rows: Math.max(1, Math.floor((el.clientHeight - PADDING * 2) / CELL_H)),
      });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return size;
};

interface IconProps {
  id: AppId;
  cell: Cell;
  grid: { cols: number; rows: number };
  selected: boolean;
  onSelect: () => void;
}

const DesktopIcon = ({ id, cell, grid, selected, onSelect }: IconProps) => {
  const meta = apps[id];
  const controls = useAnimationControls();
  const reduce = useReducedMotion();
  const moveIcon = useDesktopStore((s) => s.moveIcon);
  const openApp = useWindowStore((s) => s.openApp);
  const dragged = useRef(false);

  // Icons below the last visible row wrap into the next column, then clamp
  // horizontally, so short screens and resizes never hide or stack them.
  const wrapped = { col: cell.col + Math.floor(cell.row / grid.rows), row: cell.row % grid.rows };
  const visible = { col: Math.min(wrapped.col, grid.cols - 1), row: wrapped.row };

  useEffect(() => {
    controls.start(cellToPoint(visible), reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 38 });
  }, [controls, reduce, visible.col, visible.row]);

  return (
    <motion.button
      type="button"
      drag
      dragMomentum={false}
      dragElastic={0}
      initial={cellToPoint(visible)}
      animate={controls}
      whileDrag={{ scale: 1.06, zIndex: 10, cursor: "grabbing" }}
      onDragStart={() => {
        dragged.current = true;
        onSelect();
      }}
      onDragEnd={(_e, info) => {
        const start = cellToPoint(visible);
        const x = start.x + info.offset.x;
        const y = start.y + info.offset.y;
        const target = {
          col: Math.min(grid.cols - 1, Math.max(0, Math.round((x - PADDING) / CELL_W))),
          row: Math.min(grid.rows - 1, Math.max(0, Math.round((y - PADDING) / CELL_H))),
        };
        if (target.col === visible.col && target.row === visible.row) {
          controls.start(start, { type: "spring", stiffness: 500, damping: 38 });
        } else {
          moveIcon(id, target);
        }
        // Let the click that ends a drag through without opening the app.
        setTimeout(() => (dragged.current = false), 0);
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!dragged.current) onSelect();
      }}
      onDoubleClick={() => openApp(id)}
      onKeyDown={(e) => {
        if (e.key === "Enter") openApp(id);
      }}
      aria-label={`${meta.title}. Double-click to open.`}
      aria-pressed={selected}
      className={`group absolute top-0 left-0 flex w-[92px] flex-col items-center gap-1.5 rounded-xl px-1 pt-2 pb-1.5 outline-none select-none focus-visible:ring-2 focus-visible:ring-mocha-mauve/70 ${
        selected ? "bg-mocha-mauve/20 ring-1 ring-mocha-mauve/40" : "hover:bg-white/10"
      }`}
    >
      <AppIcon icon={meta.icon} label="" size={52} />
      <span
        className={`line-clamp-2 rounded px-1 text-center text-[12.5px] leading-tight font-medium text-white [text-shadow:0_1px_3px_rgb(17_17_27/0.9)] ${
          selected ? "bg-mocha-mauve/60" : ""
        }`}
      >
        {meta.title}
      </span>
    </motion.button>
  );
};

const DraggableGrid = () => {
  const ref = useRef<HTMLDivElement>(null);
  const grid = useGridSize(ref);
  const positions = useDesktopStore((s) => s.positions);
  const [selected, setSelected] = useState<AppId | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Icon positions come from localStorage; render after hydration to avoid a jump.
  useEffect(() => {
    if (useDesktopStore.persist.hasHydrated()) setHydrated(true);
    return useDesktopStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return (
    <div
      ref={ref}
      className="relative h-full w-full"
      onClick={() => setSelected(null)}
      role="group"
      aria-label="Desktop"
    >
      {hydrated &&
        desktopApps.map((id) => {
          const cell = positions[id];
          if (!cell) return null;
          return (
            <DesktopIcon
              key={id}
              id={id}
              cell={cell}
              grid={grid}
              selected={selected === id}
              onSelect={() => setSelected(id)}
            />
          );
        })}
    </div>
  );
};

export default DraggableGrid;
