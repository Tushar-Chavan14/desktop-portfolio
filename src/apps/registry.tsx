"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { AppId } from "./meta";
import type { AppComponentProps } from "./types";
import { profile } from "@src/data/profile";

const Loading = () => (
  <div className="flex h-full flex-col gap-3 p-6" aria-busy="true" aria-label="Loading">
    <div className="h-6 w-1/3 animate-pulse rounded-md bg-mocha-surface0" />
    <div className="h-4 w-2/3 animate-pulse rounded-md bg-mocha-surface0/70" />
    <div className="h-4 w-1/2 animate-pulse rounded-md bg-mocha-surface0/70" />
    <div className="mt-2 flex-1 animate-pulse rounded-xl bg-mocha-surface0/40" />
  </div>
);

const lazy = (loader: () => Promise<{ default: ComponentType<AppComponentProps> }>) =>
  dynamic(loader, { ssr: false, loading: Loading });

const Browser = lazy(() => import("./browser/Browser"));

// Code and Spotify are the browser engine pointed at a fixed, embeddable page.
const Code = (props: AppComponentProps) => (
  <Browser {...props} url={`https://github1s.com/${profile.contact.githubUser}/desktop-portfolio`} chromeless />
);
const Spotify = (props: AppComponentProps) => (
  <Browser
    {...props}
    url="https://open.spotify.com/embed/album/5KF4xCxDD8ip003hoatFT9?utm_source=generator&theme=0"
    chromeless
  />
);

export const appComponents: Record<AppId, ComponentType<AppComponentProps>> = {
  welcome: lazy(() => import("./welcome/Welcome")),
  about: lazy(() => import("./about/About")),
  projects: lazy(() => import("./projects/Projects")),
  resume: lazy(() => import("./resume/Resume")),
  contact: lazy(() => import("./contact/Contact")),
  terminal: lazy(() => import("./terminal/Terminal")),
  browser: Browser,
  code: Code,
  spotify: Spotify,
  editor: lazy(() => import("./editor/TextEditor")),
  mail: lazy(() => import("./mail/Mail")),
  calendar: lazy(() => import("./calendar/Calendar")),
};
