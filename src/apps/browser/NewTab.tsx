"use client";

import { useState, type FormEvent } from "react";
import type { IconType } from "react-icons";
import {
  PiArrowUpRight,
  PiGithubLogo,
  PiLinkedinLogo,
  PiMagnifyingGlass,
  PiMediumLogo,
} from "react-icons/pi";
import { profile, projects } from "@src/data/profile";
import { Favicon } from "./parts";
import { hostOf } from "./url";

const greetingFor = (hour: number) =>
  hour < 5 ? "Good evening" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

const liveProjects = projects.filter((p): p is typeof p & { url: string } => Boolean(p.url));

const elsewhere: { label: string; url: string; icon: IconType }[] = [
  { label: "Blog", url: profile.contact.blog, icon: PiMediumLogo },
  { label: "GitHub", url: profile.contact.github, icon: PiGithubLogo },
  { label: "LinkedIn", url: profile.contact.linkedin, icon: PiLinkedinLogo },
];

const shortHost = (url: string) => hostOf(url).replace(/^www\./, "");

const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-mocha-mauve/60";

export default function NewTab({
  onNavigate,
  isMobile,
}: {
  onNavigate: (input: string) => void;
  isMobile?: boolean;
}) {
  const [now] = useState(() => new Date());
  const [query, setQuery] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) onNavigate(query);
  };

  return (
    <div className="@container h-full w-full overflow-y-auto bg-mocha-base">
      <div className="mx-auto w-full max-w-3xl px-5 pb-12 pt-10 @min-[640px]:px-10 @min-[640px]:pt-14">
        {/* Greeting + search */}
        <p className="font-mono text-xs uppercase tracking-wider text-mocha-overlay1">
          {now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-mocha-text @min-[640px]:text-4xl">
          {greetingFor(now.getHours())}
        </h1>
        <p className="mt-2 max-w-prose text-sm text-mocha-subtext0">
          Search the web, or open one of the projects I have shipped.
        </p>

        <form onSubmit={submit} role="search" className="mt-6">
          <label className="group flex h-12 items-center gap-3 rounded-full border border-mocha-surface0 bg-mocha-mantle px-4 transition focus-within:border-mocha-mauve/50 focus-within:ring-2 focus-within:ring-mocha-mauve/30 hover:border-mocha-surface1">
            <PiMagnifyingGlass aria-hidden="true" className="shrink-0 text-lg text-mocha-overlay1 group-focus-within:text-mocha-mauve" />
            <span className="sr-only">Search Google or type a URL</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Google or type a URL"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              enterKeyHint="go"
              className={`min-w-0 flex-1 bg-transparent text-mocha-text outline-none placeholder:text-mocha-overlay0 ${isMobile ? "text-base" : "text-sm"}`}
            />
          </label>
        </form>

        {/* Live projects */}
        <section aria-labelledby="newtab-projects" className="mt-12">
          <div className="mb-3 flex items-baseline justify-between gap-4">
            <h2 id="newtab-projects" className="text-sm font-medium text-mocha-subtext1">
              Live projects
            </h2>
            <span className="font-mono text-xs text-mocha-overlay0">{liveProjects.length} sites</span>
          </div>
          <ul className="grid grid-cols-1 gap-3 @min-[640px]:grid-cols-2">
            {liveProjects.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onNavigate(p.url)}
                  className={`group flex h-full w-full items-start gap-4 rounded-xl border border-mocha-surface0 bg-mocha-mantle p-4 text-left transition hover:border-mocha-surface1 hover:bg-mocha-surface0/40 active:scale-[0.99] ${focusRing}`}
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-mocha-crust">
                    <Favicon host={hostOf(p.url)} size={24} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-medium text-mocha-text">{p.name}</span>
                      <span className="shrink-0 rounded-md bg-mocha-surface0 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-mocha-subtext0">
                        {p.kind}
                      </span>
                    </span>
                    <span className="mt-0.5 text-sm text-mocha-subtext0 text-pretty">{p.tagline}</span>
                    <span className="mt-3 flex items-center gap-1 font-mono text-xs text-mocha-overlay1 group-hover:text-mocha-mauve">
                      <span className="truncate">{shortHost(p.url)}</span>
                      <PiArrowUpRight aria-hidden="true" className="shrink-0 opacity-0 transition group-hover:opacity-100" />
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Elsewhere */}
        <section aria-labelledby="newtab-elsewhere" className="mt-10">
          <h2 id="newtab-elsewhere" className="mb-3 text-sm font-medium text-mocha-subtext1">
            Elsewhere
          </h2>
          <ul className="flex flex-wrap gap-2">
            {elsewhere.map(({ label, url, icon: Icon }) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => onNavigate(url)}
                  className={`inline-flex h-9 items-center gap-2 rounded-full border border-mocha-surface0 bg-mocha-mantle pl-3 pr-4 text-sm text-mocha-text transition hover:border-mocha-surface1 hover:bg-mocha-surface0/40 active:scale-95 ${focusRing}`}
                >
                  <Icon aria-hidden="true" className="text-base text-mocha-subtext1" />
                  {label}
                  <span className="hidden font-mono text-xs text-mocha-overlay0 @min-[640px]:inline">{shortHost(url)}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-mocha-overlay1">
            Some sites refuse to load inside other pages. When that happens you can open them in a new tab.
          </p>
        </section>
      </div>
    </div>
  );
}
