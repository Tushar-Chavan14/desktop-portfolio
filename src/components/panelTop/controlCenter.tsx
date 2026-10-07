"use client";

import { useEffect, useState } from "react";
import { Popover, PopoverButton, PopoverPanel, CloseButton } from "@headlessui/react";
import { useBattery, useNetworkState } from "@uidotdev/usehooks";
import {
  PiArrowClockwiseBold,
  PiBatteryChargingFill,
  PiBatteryFullFill,
  PiBatteryHighFill,
  PiBatteryLowFill,
  PiBatteryMediumFill,
  PiBatteryWarningFill,
  PiCodeBold,
  PiImageSquareBold,
  PiPowerBold,
  PiTerminalWindowBold,
  PiWifiHighBold,
  PiWifiSlashBold,
} from "react-icons/pi";
import type { IconType } from "react-icons";
import useWindowStore from "@src/store/zustore/useWindowStore";
import useModalStore from "@src/store/zustore/UseModalStore";
import useShellStore from "@src/store/zustore/useShellStore";
import { profile } from "@src/data/profile";
import { panelButton, panelSurface } from "./styles";

const batteryIcon = (level: number | null, charging: boolean | null): IconType => {
  if (level === null) return PiBatteryWarningFill;
  if (charging) return PiBatteryChargingFill;
  if (level > 0.9) return PiBatteryFullFill;
  if (level > 0.6) return PiBatteryHighFill;
  if (level > 0.25) return PiBatteryMediumFill;
  return PiBatteryLowFill;
};

const formatDuration = (seconds: number | null) => {
  if (!seconds || !Number.isFinite(seconds)) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h ? `${h} h ${m} min` : `${m} min`;
};

/** Hooks that touch navigator APIs must only run after mount. */
const useMounted = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
};

const StatusIcons = () => {
  const { online } = useNetworkState();
  const battery = useBattery();
  const BatteryIcon = batteryIcon(battery.supported ? battery.level : null, battery.charging);
  return (
    <>
      {online ? (
        <PiWifiHighBold className="size-4" aria-label="Online" />
      ) : (
        <PiWifiSlashBold className="size-4" aria-label="Offline" />
      )}
      <BatteryIcon className="size-[18px]" aria-hidden />
      {battery.supported && battery.level !== null && (
        <span className="text-xs tabular-nums">{Math.round(battery.level * 100)}%</span>
      )}
    </>
  );
};

const Row = ({ icon: Icon, title, detail }: { icon: IconType; title: string; detail?: string | null }) => (
  <div className="flex items-center gap-3 rounded-xl bg-mocha-surface0/70 px-3 py-2.5">
    <span className="grid size-8 place-items-center rounded-full bg-mocha-surface1 text-mocha-text">
      <Icon className="size-4" aria-hidden />
    </span>
    <div className="min-w-0">
      <p className="text-sm font-medium text-mocha-text">{title}</p>
      {detail && <p className="truncate text-xs text-mocha-subtext0">{detail}</p>}
    </div>
  </div>
);

const Details = () => {
  const { online, effectiveType, downlink } = useNetworkState();
  const battery = useBattery();
  const BatteryIcon = batteryIcon(battery.supported ? battery.level : null, battery.charging);

  const batteryDetail = !battery.supported
    ? "Not reported by this browser"
    : battery.charging
      ? `Charging${formatDuration(battery.chargingTime) ? `, full in ${formatDuration(battery.chargingTime)}` : ""}`
      : formatDuration(battery.dischargingTime)
        ? `${formatDuration(battery.dischargingTime)} remaining`
        : "On battery";

  return (
    <div className="grid grid-cols-2 gap-2">
      <Row
        icon={online ? PiWifiHighBold : PiWifiSlashBold}
        title={online ? "Connected" : "Offline"}
        detail={online ? [effectiveType?.toUpperCase(), downlink ? `${downlink} Mbps` : null].filter(Boolean).join(", ") : "No connection"}
      />
      <Row
        icon={BatteryIcon}
        title={battery.supported && battery.level !== null ? `${Math.round(battery.level * 100)}%` : "Battery"}
        detail={batteryDetail}
      />
    </div>
  );
};

const QuickAction = ({ icon: Icon, label, onPress }: { icon: IconType; label: string; onPress: () => void }) => (
  <CloseButton
    as="button"
    type="button"
    onClick={onPress}
    className="flex flex-col items-start gap-2 rounded-xl bg-mocha-surface0/70 p-3 text-left text-sm font-medium text-mocha-text transition hover:bg-mocha-surface1 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-mocha-mauve"
  >
    <Icon className="size-5 text-mocha-mauve" aria-hidden />
    {label}
  </CloseButton>
);

const ControlCenter = () => {
  const mounted = useMounted();
  const openApp = useWindowStore((s) => s.openApp);
  const openModal = useModalStore((s) => s.openModal);
  const setPower = useShellStore((s) => s.setPower);

  return (
    <Popover className="relative">
      <PopoverButton className={panelButton} aria-label="System menu">
        {mounted ? <StatusIcons /> : <span className="w-14" />}
        <PiPowerBold className="size-4" aria-hidden />
      </PopoverButton>

      <PopoverPanel anchor={{ to: "bottom end", gap: 8 }} transition className={`${panelSurface} w-[min(22rem,calc(100vw-1rem))] p-3`}>
        <div className="flex items-center gap-3 px-1 pb-3">
          <span className="grid size-10 place-items-center rounded-[30%] bg-linear-to-br from-mocha-mauve to-mocha-lavender text-sm font-bold text-mocha-crust">
            TC
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-mocha-text">{profile.name}</p>
            <p className="truncate text-xs text-mocha-subtext0">{profile.role}</p>
          </div>
        </div>

        {mounted && <Details />}

        <div className="mt-2 grid grid-cols-3 gap-2">
          <QuickAction icon={PiImageSquareBold} label="Wallpaper" onPress={() => openModal("CHANGE_BACKGROUND", {})} />
          <QuickAction icon={PiTerminalWindowBold} label="Terminal" onPress={() => openApp("terminal")} />
          <QuickAction icon={PiCodeBold} label="Source" onPress={() => openApp("code")} />
        </div>

        <div className="mt-3 flex gap-2 border-t border-white/5 pt-3">
          <CloseButton
            as="button"
            type="button"
            onClick={() => setPower("restarting")}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-mocha-surface0/70 px-3 py-2 text-sm font-medium text-mocha-text transition hover:bg-mocha-surface1 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-mocha-mauve"
          >
            <PiArrowClockwiseBold className="size-4" aria-hidden />
            Restart
          </CloseButton>
          <CloseButton
            as="button"
            type="button"
            onClick={() => setPower("shutting-down")}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-mocha-red/90 px-3 py-2 text-sm font-semibold text-mocha-crust transition hover:bg-mocha-red active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mocha-red"
          >
            <PiPowerBold className="size-4" aria-hidden />
            Power off
          </CloseButton>
        </div>
      </PopoverPanel>
    </Popover>
  );
};

export default ControlCenter;
