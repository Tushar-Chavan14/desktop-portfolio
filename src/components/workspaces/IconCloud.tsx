"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

export interface CloudIcon {
  name: string;
  src: string;
}

/** Evenly spread points on a unit sphere (Fibonacci lattice). */
const spherePoints = (n: number) => {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    return { x: Math.cos(theta) * r, y, z: Math.sin(theta) * r };
  });
};

const AUTO_SPEED = 0.0035; // radians per frame when idle
const FRICTION = 0.94;

/**
 * A rotating globe of logos. Spins on its own, can be dragged with inertia,
 * and only animates while visible. Positions are written straight to the DOM
 * each frame, so React never re-renders during the animation.
 */
export default function IconCloud({ icons, size = 36 }: { icons: CloudIcon[]; size?: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLImageElement | null)[]>([]);
  const reduce = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const points = spherePoints(icons.length);
    let rotX = -0.35;
    let rotY = 0;
    let velX = 0;
    let velY = AUTO_SPEED;
    let dragging = false;
    let last = { x: 0, y: 0 };
    let radius = 100;
    let frame = 0;
    let visible = true;

    const measure = () => {
      radius = Math.max(40, Math.min(root.clientWidth, root.clientHeight) / 2 - size * 0.75);
    };

    const render = () => {
      const cx = Math.cos(rotX);
      const sx = Math.sin(rotX);
      const cy = Math.cos(rotY);
      const sy = Math.sin(rotY);
      points.forEach((p, i) => {
        const el = itemRefs.current[i];
        if (!el) return;
        // Rotate around Y, then X.
        const x1 = p.x * cy + p.z * sy;
        const z1 = -p.x * sy + p.z * cy;
        const y2 = p.y * cx - z1 * sx;
        const z2 = p.y * sx + z1 * cx;
        const depth = (z2 + 1) / 2; // 0 = back, 1 = front
        const scale = 0.55 + depth * 0.55;
        el.style.transform = `translate3d(${x1 * radius}px, ${y2 * radius}px, 0) scale(${scale})`;
        el.style.opacity = String(0.25 + depth * 0.75);
        el.style.zIndex = String(Math.round(depth * 100));
      });
    };

    const tick = () => {
      if (!dragging) {
        // Ease back toward a gentle idle spin after a fling.
        velY = velY * FRICTION + AUTO_SPEED * (1 - FRICTION);
        velX *= FRICTION;
      }
      rotY += velY;
      rotX = Math.max(-1.2, Math.min(1.2, rotX + velX));
      render();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      if (!reduce && visible && !document.hidden) frame = requestAnimationFrame(tick);
    };

    measure();
    render();
    start();

    const resize = new ResizeObserver(() => {
      measure();
      render();
    });
    resize.observe(root);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    io.observe(root);

    const onVisibility = () => start();
    document.addEventListener("visibilitychange", onVisibility);

    const onDown = (e: PointerEvent) => {
      dragging = true;
      last = { x: e.clientX, y: e.clientY };
      root.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      velY = (e.clientX - last.x) * 0.006;
      velX = -(e.clientY - last.y) * 0.006;
      last = { x: e.clientX, y: e.clientY };
      if (reduce) {
        rotY += velY;
        rotX = Math.max(-1.2, Math.min(1.2, rotX + velX));
        render();
      }
    };
    const onUp = () => {
      dragging = false;
    };
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
    };
  }, [icons.length, reduce, size]);

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label={`Rotating globe of technology logos: ${icons.map((i) => i.name).join(", ")}`}
      className="relative h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
    >
      {icons.map((icon, i) => (
        <img
          key={icon.name}
          ref={(el) => {
            itemRefs.current[i] = el;
          }}
          src={icon.src}
          alt=""
          width={size}
          height={size}
          draggable={false}
          title={icon.name}
          className="pointer-events-none absolute top-1/2 left-1/2 will-change-transform"
          style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
        />
      ))}
    </div>
  );
}
