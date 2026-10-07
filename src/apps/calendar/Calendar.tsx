"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PiBriefcaseBold,
  PiCaretLeftBold,
  PiCaretRightBold,
  PiClockBold,
  PiEnvelopeSimpleBold,
  PiGlobeHemisphereEastBold,
  PiHourglassBold,
} from "react-icons/pi";
import { profile } from "@src/data/profile";
import useWindowStore from "@src/store/zustore/useWindowStore";
import type { AppComponentProps } from "../types";
import type { ComposeDraft } from "../mail/Mail";
import { buttonClass } from "../ui";

const { availability, firstName } = profile;
const OFFSET_MS = availability.utcOffsetMinutes * 60_000;
/** Visitors can book up to this many days ahead. */
const HORIZON_DAYS = 45;
/** No booking closer than this to now, so there is time to reply. */
const LEAD_MS = 2 * 60 * 60 * 1000;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/*
 * Dates in this app are calendar days in Tushar's time zone, kept as UTC
 * midnights so arithmetic never trips over the visitor's own DST rules.
 */
type Day = number; // ms timestamp of 00:00 UTC for that calendar day

const DAY_MS = 86_400_000;
const homeToday = (now: number): Day => {
  const d = new Date(now + OFFSET_MS);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};
const isWeekend = (day: Day) => [0, 6].includes(new Date(day).getUTCDay());
/** Real instant at which `hour` (home time) starts on `day`. */
const slotInstant = (day: Day, hour: number) => day + hour * 3_600_000 - OFFSET_MS;

const visitorZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const sameZone = new Intl.DateTimeFormat("en", { timeZone: visitorZone, timeZoneName: "shortOffset" }).format(Date.now()) ===
  new Intl.DateTimeFormat("en", { timeZone: availability.timeZone, timeZoneName: "shortOffset" }).format(Date.now());

const fmt = {
  homeTime: new Intl.DateTimeFormat("en-IN", { timeZone: availability.timeZone, hour: "numeric", minute: "2-digit" }),
  visitorTime: new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }),
  visitorHour: new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23" }),
  month: new Intl.DateTimeFormat("en", { timeZone: "UTC", month: "long", year: "numeric" }),
  dayLong: new Intl.DateTimeFormat("en", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" }),
  dayShort: new Intl.DateTimeFormat("en", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" }),
  visitorDay: new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short" }),
};

const zoneCity = visitorZone.split("/").pop()?.replace(/_/g, " ") ?? visitorZone;

const useNow = () => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  return now;
};

const slotsFor = (day: Day, now: number) => {
  const hours: number[] = [];
  for (let h = availability.callHours.start; h < availability.callHours.end; h++) hours.push(h);
  return hours.map((h) => slotInstant(day, h)).filter((t) => t >= now + LEAD_MS);
};

const isBookable = (day: Day, now: number) => {
  const today = homeToday(now);
  return day >= today && day <= today + HORIZON_DAYS * DAY_MS && !isWeekend(day) && slotsFor(day, now).length > 0;
};

/** Monday-first grid for the month containing `month`, padded with nulls. */
const monthGrid = (month: Day) => {
  const d = new Date(month);
  const first = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
  const daysInMonth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  const lead = (new Date(first).getUTCDay() + 6) % 7;
  const cells: (Day | null)[] = Array(lead).fill(null);
  for (let i = 0; i < daysInMonth; i++) cells.push(first + i * DAY_MS);
  while (cells.length % 7) cells.push(null);
  return cells;
};

const addMonths = (month: Day, n: number) => {
  const d = new Date(month);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1);
};

/* ------------------------------------------------------------------ */

const Fact = ({ icon: Icon, label, value }: { icon: typeof PiClockBold; label: string; value: string }) => (
  <li className="flex items-start gap-3">
    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-mocha-surface0 text-mocha-mauve">
      <Icon className="size-4" aria-hidden />
    </span>
    <span className="min-w-0">
      <span className="block text-xs text-mocha-subtext0">{label}</span>
      <span className="block text-sm font-medium text-mocha-text">{value}</span>
    </span>
  </li>
);

export default function Calendar(_props: AppComponentProps) {
  const openApp = useWindowStore((s) => s.openApp);
  const now = useNow();
  const today = homeToday(now);

  const firstBookable = useMemo(() => {
    for (let i = 0; i <= HORIZON_DAYS; i++) if (isBookable(today + i * DAY_MS, now)) return today + i * DAY_MS;
    return today;
    // Only pick the default once per day.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);

  const [month, setMonth] = useState<Day>(() => addMonths(firstBookable, 0));
  const [selectedDay, setSelectedDay] = useState<Day>(firstBookable);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const slots = slotsFor(selectedDay, now);
  const slot = selectedSlot !== null && slots.includes(selectedSlot) ? selectedSlot : null;

  const homeHour = new Date(now + OFFSET_MS).getUTCHours();
  const working = !isWeekend(today) && homeHour >= availability.callHours.start && homeHour < availability.callHours.end;

  const minMonth = addMonths(today, 0);
  const maxMonth = addMonths(today + HORIZON_DAYS * DAY_MS, 0);

  const request = () => {
    if (slot === null) return;
    const home = `${fmt.homeTime.format(slot)} IST`;
    const draft: ComposeDraft = {
      subject: `Call request: ${fmt.dayShort.format(selectedDay)}, ${home}`,
      message: `Hi ${firstName},\n\nCould we have a 30 minute call on ${fmt.dayLong.format(selectedDay)} at ${home}${
        sameZone ? "" : ` (${fmt.visitorTime.format(slot)} my time, ${zoneCity})`
      }?\n\nA bit about the role or project:\n`,
      nonce: Date.now(),
    };
    openApp("mail", { compose: draft });
  };

  return (
    <div className="@container h-full overflow-y-auto bg-mocha-base scrollbar-thin scrollbar-thumb-mocha-surface2 scrollbar-track-mocha-surface0">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-6 @2xl:px-8">
        {/* Status strip */}
        <header className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight text-mocha-text">Availability</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-mocha-subtext1">
              <span aria-hidden className="size-2 rounded-full bg-mocha-green" />
              {availability.status}
            </p>
          </div>
          <dl className="flex gap-5 text-sm">
            <div>
              <dt className="text-xs text-mocha-subtext0">{firstName}&apos;s time</dt>
              <dd className="font-medium text-mocha-text tabular-nums">
                {fmt.homeTime.format(now)} <span className="text-mocha-overlay2">IST</span>
              </dd>
              <dd className={`text-xs ${working ? "text-mocha-green" : "text-mocha-overlay2"}`}>
                {working ? "Working hours now" : "Outside working hours"}
              </dd>
            </div>
            {!sameZone && (
              <div>
                <dt className="text-xs text-mocha-subtext0">Your time</dt>
                <dd className="font-medium text-mocha-text tabular-nums">{fmt.visitorTime.format(now)}</dd>
                <dd className="text-xs text-mocha-overlay2">{zoneCity}</dd>
              </div>
            )}
          </dl>
        </header>

        <div className="grid gap-6 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* Month */}
          <section aria-labelledby="cal-month" className="rounded-2xl bg-mocha-mantle p-4 @2xl:p-5">
            <div className="flex items-center justify-between">
              <h2 id="cal-month" className="font-semibold text-mocha-text" aria-live="polite">
                {fmt.month.format(month)}
              </h2>
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label="Previous month"
                  disabled={month <= minMonth}
                  onClick={() => setMonth((m) => addMonths(m, -1))}
                  className={buttonClass.icon}
                >
                  <PiCaretLeftBold className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Next month"
                  disabled={month >= maxMonth}
                  onClick={() => setMonth((m) => addMonths(m, 1))}
                  className={buttonClass.icon}
                >
                  <PiCaretRightBold className="size-4" aria-hidden />
                </button>
              </div>
            </div>
            <div role="grid" aria-labelledby="cal-month" className="mt-4 grid grid-cols-7 gap-1 text-center">
              {WEEKDAYS.map((w) => (
                <span key={w} role="columnheader" className="pb-1 text-xs font-medium text-mocha-overlay2">
                  {w}
                </span>
              ))}
              {monthGrid(month).map((day, i) => {
                if (day === null) return <span key={`pad-${i}`} aria-hidden />;
                const bookable = isBookable(day, now);
                const selected = day === selectedDay;
                const isToday = day === today;
                return (
                  <button
                    key={day}
                    type="button"
                    role="gridcell"
                    disabled={!bookable}
                    aria-selected={selected}
                    aria-label={`${fmt.dayLong.format(day)}${bookable ? "" : ", unavailable"}`}
                    aria-current={isToday ? "date" : undefined}
                    onClick={() => {
                      setSelectedDay(day);
                      setSelectedSlot(null);
                    }}
                    className={`relative grid aspect-square min-h-9 place-items-center rounded-lg text-sm tabular-nums transition focus-visible:outline-2 focus-visible:outline-mocha-mauve ${
                      selected
                        ? "bg-mocha-mauve font-semibold text-mocha-crust"
                        : bookable
                          ? "text-mocha-text hover:bg-mocha-surface0"
                          : "text-mocha-overlay0/60"
                    }`}
                  >
                    {new Date(day).getUTCDate()}
                    {isToday && !selected && <span aria-hidden className="absolute bottom-1 size-1 rounded-full bg-mocha-mauve" />}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-mocha-subtext0">
              Weekdays only, up to {HORIZON_DAYS} days ahead. Dates are in {availability.timeZoneLabel}.
            </p>
          </section>

          {/* Slots */}
          <section aria-labelledby="cal-slots" className="flex flex-col rounded-2xl bg-mocha-mantle p-4 @2xl:p-5">
            <h2 id="cal-slots" className="font-semibold text-mocha-text">
              {fmt.dayLong.format(selectedDay)}
            </h2>
            <p className="mt-1 text-sm text-mocha-subtext0">
              30 minute call. Times shown {sameZone ? "in IST" : `in your time (${zoneCity}), IST below`}.
            </p>
            {slots.length ? (
              <ul className="mt-4 grid grid-cols-2 gap-2 @lg:grid-cols-3">
                {slots.map((t) => {
                  const hour = Number(fmt.visitorHour.format(t));
                  const odd = !sameZone && (hour < 8 || hour >= 21);
                  const active = t === slot;
                  return (
                    <li key={t}>
                      <button
                        type="button"
                        aria-pressed={active}
                        onClick={() => setSelectedSlot(t)}
                        className={`flex min-h-12 w-full flex-col items-center justify-center rounded-lg border px-2 py-1.5 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mocha-mauve active:scale-[0.98] ${
                          active
                            ? "border-mocha-mauve bg-mocha-mauve/15 text-mocha-text"
                            : "border-mocha-surface1 text-mocha-subtext1 hover:border-mocha-mauve/50 hover:text-mocha-text"
                        }`}
                      >
                        <span className="text-sm font-medium tabular-nums">{fmt.visitorTime.format(t)}</span>
                        {!sameZone && (
                          <span className="text-[11px] text-mocha-overlay2 tabular-nums">
                            {odd ? (hour < 8 ? "early for you" : "late for you") : `${fmt.homeTime.format(t)} IST`}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-4 rounded-lg bg-mocha-crust/50 p-4 text-sm text-mocha-subtext0">No times left on this day. Pick another date.</p>
            )}
            <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
              <button type="button" disabled={slot === null} onClick={request} className={buttonClass.primary}>
                <PiEnvelopeSimpleBold className="size-4" aria-hidden />
                Request this time
              </button>
              <p aria-live="polite" className="min-w-0 flex-1 text-xs text-mocha-subtext0">
                {slot === null
                  ? "Pick a time first."
                  : `Opens Mail with a request for ${fmt.visitorDay.format(slot)}, ${fmt.visitorTime.format(slot)}.`}
              </p>
            </div>
          </section>
        </div>

        <ul className="grid gap-4 rounded-2xl border border-white/5 p-4 @lg:grid-cols-2 @3xl:grid-cols-4 @2xl:p-5">
          <Fact icon={PiHourglassBold} label="Notice period" value={availability.noticePeriod} />
          <Fact icon={PiBriefcaseBold} label="Work mode" value={availability.workModes.join(", ")} />
          <Fact icon={PiGlobeHemisphereEastBold} label="Based in" value={`${profile.location.split(",")[0]}, ${availability.timeZoneLabel}`} />
          <Fact icon={PiClockBold} label="Replies" value="Within a day" />
        </ul>
      </div>
    </div>
  );
}
