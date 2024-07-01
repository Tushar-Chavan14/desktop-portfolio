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
  } else if (parseInt(level.toFixed(2)) >= 0.75) {
    return <TiBatteryHigh className="size-5" />;
  } else if (parseInt(level.toFixed(2)) >= 0.5) {
    return <TiBatteryMid className="size-5" />;
  } else if (parseInt(level.toFixed(2)) < 0.25) {
    return <TiBatteryLow className="size-5" />;
  }
};

const Battery = ({
  percentage,
  varrient,
}: {
  percentage?: boolean;
  varrient: string;
}) => {
  const { supported, loading, level, charging, chargingTime, dischargingTime } =
    useBattery();

  function convertSecondsToMinutes(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds}`;
  }

  if (!supported) {
    return <PiBatteryWarningFill className="size-5" />;
  }

  return (
    <div>
      {loading ? (
        <Spinner />
      ) : (
        <>
          {varrient === "icon" ? (
            <div
              className={`grid ${!percentage ? "grid-cols-1" : "grid-cols-2"}
              `}
            >
              <BatteryIcon level={level} charging={charging} />
              {percentage && (
                <p className=" text-xs font-medium mt-1">
                  {(level && level * 100)?.toFixed(0)}%
                </p>
              )}
            </div>
          ) : (
            varrient === "info" && (
              <div className=" flex items-center justify-around">
                <BatteryIcon level={level} charging={charging} />
                {charging ? (
                  <>
                    <p>
                      {chargingTime && convertSecondsToMinutes(chargingTime)}
                    </p>
                    <p>untill full</p>
                  </>
                ) : (
                  <>
                    <p>
                      {dischargingTime &&
                        convertSecondsToMinutes(dischargingTime)}
                    </p>
                    <p>remaining</p>
                  </>
                )}
                {percentage && (
                  <p className=" text-xs font-medium mt-1">
                    {(level && level * 100)?.toFixed(0)}%
                  </p>
                )}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default Battery;
