"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useAnimationControls,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { PiDotsNineBold } from "react-icons/pi";
import { apps, dockApps, externalLinks, type AppId } from "@src/apps/meta";
import { AppIcon } from "@src/components/appIcon/AppIcon";
import useWindowStore from "@src/store/zustore/useWindowStore";
import useShellStore from "@src/store/zustore/useShellStore";
import { Z } from "@src/constants/layout";

const BASE = 46;
const MAGNIFIED = 70;
const RANGE = 150;

/** Size follows the pointer's distance from the icon centre (macOS-style magnification). */
const useMagnify = (mouseX: MotionValue<number>, ref: React.RefObject<HTMLElement | null>) => {
  const reduce = useReducedMotion();
  const distance = useTransform(mouseX, (x) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || !Number.isFinite(x)) return RANGE;
    return x - (rect.left + rect.width / 2);
  });
  const target = useTransform(distance, [-RANGE, 0, RANGE], [BASE, reduce ? BASE : MAGNIFIED, BASE]);
  return useSpring(target, { mass: 0.12, stiffness: 220, damping: 16 });
};

interface DockItemProps {
  mouseX: MotionValue<number>;
  label: string;
  onPress: () => void;
  running?: boolean;
  focused?: boolean;
  children: (size: MotionValue<number>) => ReactNode;
  bounceOnPress?: boolean;
}

const DockItem = ({ mouseX, label, onPress, running, focused, children, bounceOnPress }: DockItemProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const size = useMagnify(mouseX, ref);
  const controls = useAnimationControls();
  const reduce = useReducedMotion();

  return (
    <motion.button
      ref={ref}
      type="button"
      aria-label={label}
      onClick={() => {
        // Bounce gives launch feedback the way a real dock does.
        if (bounceOnPress && !reduce) {
          controls.start({ y: [0, -16, 0, -6, 0], transition: { duration: 0.6, ease: "easeOut" } });
        }
        onPress();
      }}
      style={{ width: size, height: size }}
      animate={controls}
      className="group/dock relative flex shrink-0 items-end justify-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-mocha-mauve/70"
    >
      {children(size)}
      {/* Label */}
      <span
        role="tooltip"
        className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 translate-y-1 rounded-lg border border-white/10 bg-mocha-crust/90 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-mocha-text opacity-0 shadow-lg backdrop-blur-md transition-[opacity,transform] duration-150 group-hover/dock:translate-y-0 group-hover/dock:opacity-100 group-focus-visible/dock:translate-y-0 group-focus-visible/dock:opacity-100"
      >
        {label}
      </span>
      {/* Running indicator */}
      <span
        aria-hidden
        className={`absolute -bottom-2 left-1/2 h-1 -translate-x-1/2 rounded-full transition-all duration-200 ${
          running ? (focused ? "w-3 bg-mocha-mauve" : "w-1 bg-mocha-subtext0") : "w-0 bg-transparent"
        }`}
      />
    </motion.button>
  );
};

const MotionIcon = ({ size, children }: { size: MotionValue<number>; children: ReactNode }) => (
  <motion.span style={{ width: size, height: size }} className="grid place-items-center [&>*]:size-full!">
    {children}
  </motion.span>
);

const Separator = () => <span aria-hidden className="mx-1 h-9 w-px self-center bg-white/10" />;

const BottomDock = () => {
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);
  const windows = useWindowStore((s) => s.windows);
  const focusedId = useWindowStore((s) => s.focusedId);
  const activateApp = useWindowStore((s) => s.activateApp);
  const toggleActivities = useShellStore((s) => s.toggleActivities);

  const focusedAppId = windows.find((w) => w.id === focusedId)?.appId;
  const isRunning = (appId: AppId) => windows.some((w) => w.appId === appId);

  return (
    <nav
      aria-label="Dock"
      data-tour="dock"
      className="pointer-events-none fixed inset-x-0 bottom-2 flex justify-center"
      style={{ zIndex: Z.dock }}
    >
      <motion.div
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
        className="pointer-events-auto flex h-[62px] items-end gap-2 rounded-2xl border border-white/10 bg-mocha-crust/65 px-2.5 pb-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_16px_40px_-12px_rgb(17_17_27/0.8)] backdrop-blur-2xl backdrop-saturate-150"
      >
        {dockApps.map((appId, i) => {
          if (appId === null) return <Separator key={`sep-${i}`} />;
          const meta = apps[appId];
          return (
            <DockItem
              key={appId}
              mouseX={mouseX}
              label={meta.title}
              running={isRunning(appId)}
              focused={focusedAppId === appId}
              bounceOnPress={!isRunning(appId)}
              onPress={() => activateApp(appId)}
            >
              {(size) => (
                <MotionIcon size={size}>
                  <AppIcon icon={meta.icon} label={meta.title} size={BASE} />
                </MotionIcon>
              )}
            </DockItem>
          );
        })}

        <Separator />

        {externalLinks.map((link) => (
          <DockItem
            key={link.id}
            mouseX={mouseX}
            label={`${link.title} (opens in a new tab)`}
            onPress={() => window.open(link.url, "_blank", "noopener,noreferrer")}
          >
            {(size) => (
              <MotionIcon size={size}>
                <AppIcon icon={link.icon} label={link.title} size={BASE} />
              </MotionIcon>
            )}
          </DockItem>
        ))}

        <DockItem mouseX={mouseX} label="Show apps" onPress={toggleActivities}>
          {(size) => (
            <motion.span
              style={{ width: size, height: size }}
              className="grid place-items-center rounded-[28%] bg-mocha-surface0/80 text-mocha-text shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]"
            >
              <PiDotsNineBold className="size-1/2" aria-hidden />
            </motion.span>
          )}
        </DockItem>
      </motion.div>
    </nav>
  );
};

export default BottomDock;
