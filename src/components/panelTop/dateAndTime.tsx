"use client";

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { format } from "date-fns";
import Calendar from "./components/calender";
import WeatherCard from "./components/whetherCard";
import { useNow } from "@src/hooks/useNow";
import { panelButton, panelSurface } from "./styles";

const DateAndTime = () => {
  const now = useNow();

  return (
    <Popover className="relative">
      <PopoverButton className={`${panelButton} min-w-36 justify-center tabular-nums`}>
        {now ? format(now, "EEE MMM d  h:mm a") : " "}
      </PopoverButton>

      <PopoverPanel
        anchor={{ to: "bottom", gap: 8 }}
        transition
        className={`${panelSurface} w-[min(36rem,calc(100vw-1rem))] p-3`}
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_1.25fr]">
          <div className="flex flex-col gap-3">
            <div className="rounded-xl bg-mocha-surface0/70 p-4">
              <p className="text-sm font-medium text-mocha-subtext0">{now && format(now, "EEEE")}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-mocha-text">
                {now && format(now, "MMMM d, yyyy")}
              </p>
            </div>
            <div className="flex-1 rounded-xl bg-mocha-surface0/70 p-4">
              <WeatherCard />
            </div>
          </div>
          <div className="rounded-xl bg-mocha-surface0/70 p-4">
            <Calendar />
          </div>
        </div>
      </PopoverPanel>
    </Popover>
  );
};

export default DateAndTime;
