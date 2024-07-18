import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isEqual,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  startOfWeek,
} from "date-fns";
import { useState } from "react";

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Calender() {
  const today = startOfToday();

  const [selectedDay, setselectedDay] = useState(today);
  const [selectedMonth, setselectedMonth] = useState<string>(
    format(today, "MMM-yyyy")
  );

  let firstDayCurrentMonth = parse(selectedMonth, "MMM-yyyy", new Date());

  const eachDays = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
  });

  const nextMonth = () => {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setselectedMonth(format(firstDayNextMonth, "MMM-yyyy"));
  };

  const prevMonth = () => {
    let firstDayPrevMonth = add(firstDayCurrentMonth, { months: -1 });
    setselectedMonth(format(firstDayPrevMonth, "MMM-yyyy"));
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="-my-1.5 p-1.5 text-gray-400 hover:text-gray-500"
          onClick={prevMonth}
        >
          <span className="sr-only">Previous month</span>
          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
        </button>
        <h2 className=" text-base font-bold text-gray-100">
          {format(firstDayCurrentMonth, "MMMM")}
        </h2>
        <button
          onClick={nextMonth}
          type="button"
          className="-my-1.5 -mr-1.5 ml-2 p-1.5 text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Next month</span>
          <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <div className="mt-5 grid grid-cols-7 text-center text-xs leading-6 text-gray-100 font-semibold">
        <div>S</div>
        <div>M</div>
        <div>T</div>
        <div>W</div>
        <div>T</div>
        <div>F</div>
        <div>S</div>
      </div>
      <div className="mt-2 grid grid-cols-7 text-sm">
        {eachDays.map((day, dayIdx) => (
          <div key={dayIdx} className={classNames("py-2")}>
            <button
              type="button"
              onClick={() => setselectedDay(day)}
              className={classNames(
                isEqual(day, selectedDay) && "text-secondary",
                !isEqual(day, selectedDay) && isToday(day) && "text-primary",
                !isEqual(day, selectedDay) &&
                  !isToday(day) &&
                  isSameMonth(day, firstDayCurrentMonth) &&
                  "text-gray-300",
                !isEqual(day, selectedDay) &&
                  !isToday(day) &&
                  !isSameMonth(day, firstDayCurrentMonth) &&
                  "text-gray-900",
                isEqual(day, selectedDay) && isToday(day) && "bg-primary",
                isEqual(day, selectedDay) && !isToday(day) && "bg-primary",
                !isEqual(day, selectedDay) && "hover:bg-secondary/30",
                (isEqual(day, selectedDay) || isToday(day)) && "font-semibold",
                "mx-auto flex h-8 w-8 items-center justify-center rounded-full"
              )}
            >
              <time dateTime={format(day, "yyy-MM-dd")}>
                {format(day, "d")}
              </time>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
