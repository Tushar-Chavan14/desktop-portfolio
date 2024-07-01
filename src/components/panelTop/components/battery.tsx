"use client";
import React from "react";
import { useBattery } from "@uidotdev/usehooks";
import { TiBatteryCharge } from "react-icons/ti";
import { TiBatteryFull } from "react-icons/ti";
import { TiBatteryHigh } from "react-icons/ti";
import { TiBatteryMid } from "react-icons/ti";
import { TiBatteryLow } from "react-icons/ti";
import { PiBatteryWarningFill } from "react-icons/pi";
import { Spinner } from "@src/components/loaders";

const BatteryIcon = ({
  level,
  charging,
}: {
  level: number | null;
  charging: boolean | null;
}) => {
  if (level === null || charging === null) {
    return <PiBatteryWarningFill className="size-5" />;
  }

  if (charging) {
    return <TiBatteryCharge className="size-5" />;
  }

  if (level === 1) {
    return <TiBatteryFull className="size-5" />;
  } else if (level > 0.75) {
    return <TiBatteryHigh className="size-5" />;
  } else if (level > 0.5) {
    return <TiBatteryMid className="size-5" />;
  } else if (level > 0.25) {
    return <TiBatteryLow className="size-5" />;
  }
};

const Battery = ({ percentage }: { percentage?: boolean }) => {
  const { supported, loading, level, charging, chargingTime } = useBattery();

  if (!supported) {
    return <PiBatteryWarningFill className="size-5" />;
  }

  return (
    <div>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="grid grid-cols-2">
            <BatteryIcon level={level} charging={charging} />
            {percentage && (
              <p className=" text-xs font-medium mt-1">
                {(level && level * 100)?.toFixed(0)}%
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Battery;
