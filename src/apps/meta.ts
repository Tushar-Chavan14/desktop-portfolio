import type { StaticImageData } from "next/image";
import type { IconType } from "react-icons";
import {
  PiAddressBookFill,
  PiFilePdfFill,
  PiFolderOpenFill,
  PiHandWavingFill,
  PiUserFocusFill,
} from "react-icons/pi";
import chromeIcon from "@src/assets/icons/chrome.svg";
import codeIcon from "@src/assets/icons/code.svg";
import githubIcon from "@src/assets/icons/github.svg";
import spotifyIcon from "@src/assets/icons/spotify.svg";
import terminalIcon from "@src/assets/icons/terminal.svg";
import textIcon from "@src/assets/icons/text.svg";
import { profile } from "@src/data/profile";

export type AppId =
  | "welcome"
  | "about"
  | "projects"
  | "resume"
  | "contact"
  | "terminal"
  | "browser"
  | "code"
  | "spotify"
  | "editor";

export type AppIconSpec =
  | { kind: "image"; src: StaticImageData }
  | { kind: "glyph"; Icon: IconType; tile: string; glyph: string };

export interface AppMeta {
  id: AppId;
  title: string;
  /** Short description shown in Activities search results. */
  description: string;
  icon: AppIconSpec;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  /** Multi-instance apps (terminal) open a new window on every launch. */
  multiInstance?: boolean;
  keywords?: string[];
}

export const apps: Record<AppId, AppMeta> = {
  welcome: {
    id: "welcome",
    title: "Welcome",
    description: "Start here: a quick tour of this desktop",
    icon: {
      kind: "glyph",
      Icon: PiHandWavingFill,
      tile: "from-mocha-peach to-mocha-maroon",
      glyph: "text-mocha-crust",
    },
    width: 620,
    height: 520,
    minWidth: 380,
    minHeight: 420,
  },
  about: {
    id: "about",
    title: "About Me",
    description: "Who I am, skills and education",
    icon: {
      kind: "glyph",
      Icon: PiUserFocusFill,
      tile: "from-mocha-mauve to-mocha-lavender",
      glyph: "text-mocha-crust",
    },
    width: 860,
    height: 640,
    minWidth: 420,
    minHeight: 360,
    keywords: ["profile", "skills", "education", "bio"],
  },
  projects: {
    id: "projects",
    title: "Projects",
    description: "Work experience and selected projects",
    icon: {
      kind: "glyph",
      Icon: PiFolderOpenFill,
      tile: "from-mocha-blue to-mocha-sapphire",
      glyph: "text-mocha-crust",
    },
    width: 980,
    height: 640,
    minWidth: 520,
    minHeight: 380,
    keywords: ["files", "portfolio", "work", "experience"],
  },
  resume: {
    id: "resume",
    title: "Resume.pdf",
    description: "View or download my resume",
    icon: {
      kind: "glyph",
      Icon: PiFilePdfFill,
      tile: "from-mocha-red to-mocha-maroon",
      glyph: "text-mocha-crust",
    },
    width: 820,
    height: 760,
    minWidth: 420,
    minHeight: 400,
    keywords: ["cv", "pdf", "download"],
  },
  contact: {
    id: "contact",
    title: "Contact",
    description: "Email, phone and social links",
    icon: {
      kind: "glyph",
      Icon: PiAddressBookFill,
      tile: "from-mocha-green to-mocha-teal",
      glyph: "text-mocha-crust",
    },
    width: 640,
    height: 600,
    minWidth: 380,
    minHeight: 420,
    keywords: ["email", "mail", "phone", "linkedin", "hire"],
  },
  terminal: {
    id: "terminal",
    title: "Terminal",
    description: "A shell with my portfolio as a file system",
    icon: { kind: "image", src: terminalIcon },
    width: 760,
    height: 500,
    minWidth: 380,
    minHeight: 260,
    multiInstance: true,
    keywords: ["shell", "bash", "fish", "console", "cli"],
  },
  browser: {
    id: "browser",
    title: "Chrome",
    description: "Browse my live projects, blog and GitHub",
    icon: { kind: "image", src: chromeIcon },
    width: 1100,
    height: 720,
    minWidth: 420,
    minHeight: 320,
    keywords: ["web", "internet", "chrome", "blog"],
  },
  code: {
    id: "code",
    title: "VS Code",
    description: "Read this desktop's source code",
    icon: { kind: "image", src: codeIcon },
    width: 1100,
    height: 720,
    minWidth: 480,
    minHeight: 320,
    keywords: ["source", "editor", "github1s"],
  },
  spotify: {
    id: "spotify",
    title: "Spotify",
    description: "What I listen to while coding",
    icon: { kind: "image", src: spotifyIcon },
    width: 420,
    height: 640,
    minWidth: 320,
    minHeight: 380,
    keywords: ["music"],
  },
  editor: {
    id: "editor",
    title: "Text Editor",
    description: "Leave a note",
    icon: { kind: "image", src: textIcon },
    width: 720,
    height: 520,
    minWidth: 360,
    minHeight: 260,
    keywords: ["notes", "text", "write"],
  },
};

/** Dock order. `null` renders a separator. */
export const dockApps: (AppId | null)[] = [
  "about",
  "projects",
  "resume",
  "contact",
  null,
  "terminal",
  "browser",
  "code",
  "spotify",
  "editor",
];

/** Icons placed on the desktop on first visit. */
export const desktopApps: AppId[] = ["welcome", "about", "projects", "resume", "contact", "terminal"];

/** External links that behave like apps (dock + launcher) but open a real tab. */
export const externalLinks = [
  {
    id: "github",
    title: "GitHub",
    description: "My repositories",
    url: profile.contact.github,
    icon: { kind: "image", src: githubIcon } as AppIconSpec,
  },
];
