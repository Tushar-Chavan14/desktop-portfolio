"use client";

import { useState } from "react";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfToday,
  startOfWeek,
} from "date-fns";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const navButton =
  "grid size-7 place-items-center rounded-lg text-mocha-subtext1 transition hover:bg-mocha-surface1 hover:text-mocha-text active:scale-95 focus-visible:outline-2 focus-visible:outline-mocha-mauve";

export default function Calendar() {
  const today = startOfToday();
  const [month, setMonth] = useState(startOfMonth(today));
  const [selected, setSelected] = useState(today);

  const days = eachDayOfInterval({
    start: startOfWeek(month),
    end: endOfWeek(endOfMonth(month)),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-mocha-text">{format(month, "MMMM yyyy")}</h3>
        <div className="flex items-center gap-1">
          <button type="button" className={navButton} onClick={() => setMonth(addMonths(month, -1))}>
            <span className="sr-only">Previous month</span>
            <PiCaretLeftBold className="size-3.5" aria-hidden />
          </button>
          <button type="button" className={navButton} onClick={() => setMonth(addMonths(month, 1))}>
            <span className="sr-only">Next month</span>
            <PiCaretRightBold className="size-3.5" aria-hidden />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 text-center text-[11px] font-medium text-mocha-overlay1">
        {WEEKDAYS.map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 text-sm tabular-nums">
        {days.map((day) => {
          const isSelected = isSameDay(day, selected);
          const inMonth = isSameMonth(day, month);
          return (
            <div key={day.toISOString()} className="py-0.5">
              <button
                type="button"
                onClick={() => setSelected(day)}
                aria-pressed={isSelected}
                className={`mx-auto grid size-8 place-items-center rounded-full transition focus-visible:outline-2 focus-visible:outline-mocha-mauve ${
                  isSelected
                    ? "bg-mocha-mauve font-semibold text-mocha-crust"
                    : isToday(day)
                      ? "font-semibold text-mocha-mauve hover:bg-mocha-surface1"
                      : inMonth
                        ? "text-mocha-text hover:bg-mocha-surface1"
                        : "text-mocha-overlay0 hover:bg-mocha-surface1"
                }`}
              >
                <time dateTime={format(day, "yyyy-MM-dd")}>{format(day, "d")}</time>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
