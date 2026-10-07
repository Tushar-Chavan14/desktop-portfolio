// Command implementations. Commands are plain functions over a per-instance
// Shell object; anything that touches the outside world (opening apps, tabs,
// closing the window) is returned as an Effect for the component to run.

import type { AppId } from "@src/apps/meta";
import { education, experience, profile, projects, skills } from "@src/data/profile";
import { aboutDoc, buildFs, HOME } from "./content";
import {
  displayPath,
  editDistance,
  getNode,
  listDir,
  mkdir,
  remove,
  resolvePath,
  touch,
  writeFile,
  type DirNode,
  type FsError,
  type FsNode,
} from "./fs";
import { blank, C, err, kv, line, linkify, renderDoc, type Out, type Seg } from "./lines";

export interface Shell {
  fs: DirNode;
  cwd: string;
  oldCwd: string;
  history: string[];
}

export type Effect =
  | { type: "openApp"; appId: AppId; props?: Record<string, unknown> }
  | { type: "url"; url: string }
  | { type: "mailto"; email: string }
  | { type: "close" };

export interface Env {
  now: Date;
  /** Epoch ms of page load, for neofetch uptime. */
  bootTime: number;
}

export interface Result {
  out: Out[];
  effects: Effect[];
  clear: boolean;
}

interface Ctx {
  shell: Shell;
  env: Env;
  args: string[];
  print: (...lines: Out[]) => void;
  effect: (e: Effect) => void;
  clear: () => void;
}

type Group = "Navigation" | "Files" | "Portfolio" | "System";

interface CommandSpec {
  group: Group;
  usage: string;
  summary: string;
  run: (ctx: Ctx) => void;
}

export const APP_IDS: AppId[] = [
  "welcome",
  "about",
  "projects",
  "resume",
  "contact",
  "terminal",
  "browser",
  "code",
  "spotify",
  "editor",
];

const ALIASES: Record<string, string[]> = { ll: ["ls", "-l"], la: ["ls", "-a"], "..": ["cd", ".."] };

const isAppId = (value: string): value is AppId => (APP_IDS as string[]).includes(value);

export function createShell(now: Date = new Date()): Shell {
  return {
    fs: buildFs(now, [...Object.keys(commands), "fish", "bash", "nvim", "git", "node", "bun"].sort()),
    cwd: HOME,
    oldCwd: HOME,
    history: [],
  };
}

/** Split a command line into tokens, honouring single and double quotes. */
export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let quote: '"' | "'" | null = null;
  let has = false;
  for (const ch of input) {
    if (quote) {
      if (ch === quote) quote = null;
      else current += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      has = true;
    } else if (/\s/.test(ch)) {
      if (has || current) tokens.push(current);
      current = "";
      has = false;
    } else {
      current += ch;
    }
  }
  if (has || current) tokens.push(current);
  return tokens;
}

/** Split args into flags (characters after `-`) and operands. */
function parseFlags(args: string[]): { flags: Set<string>; rest: string[] } {
  const flags = new Set<string>();
  const rest: string[] = [];
  for (const a of args) {
    if (/^-[A-Za-z]+$/.test(a)) for (const f of a.slice(1)) flags.add(f);
    else if (/^--[a-z-]+$/.test(a)) flags.add(a.slice(2));
    else rest.push(a);
  }
  return { flags, rest };
}

const fsMessage: Record<FsError, string> = {
  ENOENT: "No such file or directory",
  EEXIST: "File exists",
  ENOTDIR: "Not a directory",
  EISDIR: "Is a directory",
  EACCES: "Permission denied",
  EBUSY: "Device or resource busy",
  EROOT: "Permission denied",
};

const abs = (ctx: Ctx, p: string) => resolvePath(ctx.shell.cwd, p, HOME);

function nameSeg(name: string, node: FsNode): Seg {
  if (node.type === "dir") return { text: name, cls: C.dir };
  if (name.startsWith(".")) return { text: name, cls: C.hidden };
  if (node.binary && !node.owner) return { text: name, cls: "text-mocha-peach" };
  return { text: name, cls: C.text };
}

function nodeSize(node: FsNode): number {
  if (node.type === "dir") return 4096;
  if (node.binary) return node.owner ? 14_336 : 182_044;
  return new TextEncoder().encode(node.content).length;
}

function formatStamp(d: Date): string {
  const month = d.toLocaleString("en-US", { month: "short" });
  const day = String(d.getDate()).padStart(2, " ");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${month} ${day} ${hh}:${mm}`;
}

export function formatUptime(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60_000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (totalMin < 1) return `${Math.max(0, Math.floor(ms / 1000))} secs`;
  return h ? `${h} hour${h > 1 ? "s" : ""}, ${m} min${m === 1 ? "" : "s"}` : `${m} min${m === 1 ? "" : "s"}`;
}

function openNode(ctx: Ctx, target: string): void {
  const path = abs(ctx, target);
  const node = getNode(ctx.shell.fs, path);
  if (!node) {
    ctx.print(err(`open: ${target}: No such file, app or URL`));
    return;
  }
  if (node.type === "dir") {
    if (path.startsWith(`${HOME}/projects`) || path.startsWith(`${HOME}/experience`)) {
      ctx.effect({ type: "openApp", appId: "projects" });
      ctx.print(line("Opening Projects", C.dim));
    } else ctx.print(err(`open: ${target}: Is a directory`));
    return;
  }
  if (node.open?.kind === "app") {
    ctx.effect({ type: "openApp", appId: node.open.appId, props: node.open.props });
    ctx.print(line(`Opening ${target}`, C.dim));
  } else if (node.open?.kind === "url") {
    ctx.effect({ type: "url", url: node.open.url });
  } else if (node.binary) {
    ctx.print(err(`open: ${target}: No application knows how to open this file`));
  } else {
    ctx.print(...renderDoc(node.content, path.endsWith(".md")));
  }
}

function socialLines(): Out[] {
  const c = profile.contact;
  return [
    kv("LinkedIn", c.linkedin),
    kv("GitHub", c.github),
    kv("Blog", c.blog),
    kv("Email", c.email),
  ];
}

function treeLines(node: DirNode, prefix: string, all: boolean, counts: { d: number; f: number }): Out[] {
  const out: Out[] = [];
  const entries = listDir(node, all);
  entries.forEach(([name, child], i) => {
    const last = i === entries.length - 1;
    out.push([{ text: prefix + (last ? "└── " : "├── "), cls: C.dim }, nameSeg(name, child)]);
    if (child.type === "dir") {
      counts.d++;
      out.push(...treeLines(child, prefix + (last ? "    " : "│   "), all, counts));
    } else counts.f++;
  });
  return out;
}

const LOGO = [
  "      _____",
  "     /   __)\\",
  "     |  /  \\ \\",
  "  ___|  |__/ /",
  " / (_    _)_/",
  "/ /  |  |",
  "\\ \\__/  |",
  " \\(_____/",
];

const PALETTE = [
  ["bg-mocha-surface1", "bg-mocha-red", "bg-mocha-green", "bg-mocha-yellow", "bg-mocha-blue", "bg-mocha-pink", "bg-mocha-teal", "bg-mocha-subtext0"],
  ["bg-mocha-surface2", "bg-mocha-maroon", "bg-mocha-green", "bg-mocha-peach", "bg-mocha-sapphire", "bg-mocha-mauve", "bg-mocha-sky", "bg-mocha-text"],
];

function neofetch(ctx: Ctx): void {
  const pick = (id: string, n: number) => skills.find((g) => g.id === id)?.items.slice(0, n) ?? [];
  const stack = [...pick("frontend", 2), ...pick("backend", 2), ...pick("data", 1), "AWS"].join(", ");
  const title = `${profile.username}@${profile.hostname}`;
  const info: Out[] = [
    [
      { text: profile.username, cls: C.user + " font-semibold" },
      { text: "@", cls: C.text },
      { text: profile.hostname, cls: C.host + " font-semibold" },
    ],
    [{ text: "-".repeat(title.length), cls: C.dim }],
    kv("OS", "Fedora Linux 42 (Portfolio Edition) x86_64", C.h2),
    kv("Host", "Your browser tab", C.h2),
    kv("Kernel", "6.14.0-portfolio", C.h2),
    kv("Uptime", formatUptime(ctx.env.now.getTime() - ctx.env.bootTime), C.h2),
    kv("Shell", "fish 4.0", C.h2),
    kv("Role", profile.role, C.h2),
    kv("Location", profile.location, C.h2),
    kv("Experience", `${profile.yearsOfExperience} years`, C.h2),
    kv("Projects", `${projects.length} shipped`, C.h2),
    kv("Stack", stack, C.h2),
    blank(),
    PALETTE[0].map((cls) => ({ text: "   ", cls })),
    PALETTE[1].map((cls) => ({ text: "   ", cls })),
  ];
  const width = Math.max(...LOGO.map((l) => l.length)) + 3;
  const rows = Math.max(LOGO.length, info.length);
  for (let i = 0; i < rows; i++) {
    const logo = (LOGO[i] ?? "").padEnd(width, " ");
    ctx.print([{ text: logo, cls: "text-mocha-blue font-semibold" }, ...(info[i] ?? [])]);
  }
}

function cowsay(text: string): Out[] {
  const msg = text || "Moo. Try neofetch.";
  const top = ` ${"_".repeat(msg.length + 2)}`;
  const bottom = ` ${"-".repeat(msg.length + 2)}`;
  return [
    top,
    `< ${msg} >`,
    bottom,
    "        \\   ^__^",
    "         \\  (oo)\\_______",
    "            (__)\\       )\\/\\",
    "                ||----w |",
    "                ||     ||",
  ].map((l) => [{ text: l, cls: C.text }]);
}

export const commands: Record<string, CommandSpec> = {
  help: {
    group: "System",
    usage: "help",
    summary: "List available commands",
    run: (ctx) => {
      const groups: Group[] = ["Portfolio", "Navigation", "Files", "System"];
      const width = Math.max(...Object.keys(commands).map((n) => n.length)) + 2;
      for (const group of groups) {
        ctx.print([{ text: group, cls: C.h1 }]);
        for (const [name, spec] of Object.entries(commands)) {
          if (spec.group !== group) continue;
          ctx.print([
            { text: `  ${name.padEnd(width)}`, cls: C.ok },
            { text: spec.summary, cls: C.sub },
          ]);
        }
        ctx.print(blank());
      }
      ctx.print([
        { text: "Tip: ", cls: C.warn },
        { text: "Tab completes, Up/Down walk history, Ctrl+L clears. Try ", cls: C.sub },
        { text: "man <command>", cls: C.ok },
        { text: ".", cls: C.sub },
      ]);
    },
  },

  // Navigation
  ls: {
    group: "Navigation",
    usage: "ls [-a] [-l] [path...]",
    summary: "List directory contents",
    run: (ctx) => {
      const { flags, rest } = parseFlags(ctx.args);
      const all = flags.has("a");
      const long = flags.has("l");
      const targets = rest.length ? rest : ["."];
      targets.forEach((target, idx) => {
        const node = getNode(ctx.shell.fs, abs(ctx, target));
        if (!node) {
          ctx.print(err(`ls: cannot access '${target}': No such file or directory`));
          return;
        }
        if (targets.length > 1) {
          if (idx > 0) ctx.print(blank());
          ctx.print(line(`${target}:`, C.sub));
        }
        const entries: [string, FsNode][] =
          node.type === "dir" ? listDir(node, all) : [[target.split("/").pop() ?? target, node]];
        if (node.type === "dir" && all) {
          entries.unshift([".", node], ["..", node]);
        }
        if (!entries.length) return;
        if (long) {
          if (node.type === "dir") ctx.print(line(`total ${entries.length * 4}`, C.dim));
          const stamp = formatStamp(ctx.env.now);
          for (const [name, child] of entries) {
            const perms = child.type === "dir" ? "drwxr-xr-x" : child.locked ? "-r--r--r--" : "-rw-r--r--";
            const owner = (child.owner ?? profile.username).padEnd(profile.username.length);
            ctx.print([
              { text: `${perms} 1 ${owner} ${owner} `, cls: C.dim },
              { text: String(nodeSize(child)).padStart(7), cls: C.ok },
              { text: ` ${stamp} `, cls: C.sub },
              nameSeg(name, child),
            ]);
          }
        } else {
          const segs: Seg[] = [];
          entries.forEach(([name, child], i) => {
            if (i) segs.push({ text: "  " });
            segs.push(nameSeg(name, child));
          });
          ctx.print(segs);
        }
      });
    },
  },
  cd: {
    group: "Navigation",
    usage: "cd [dir | .. | - | ~]",
    summary: "Change directory",
    run: (ctx) => {
      const target = ctx.args[0] ?? "~";
      const path = target === "-" ? ctx.shell.oldCwd : abs(ctx, target);
      const node = getNode(ctx.shell.fs, path);
      if (!node) return ctx.print(err(`cd: The directory "${target}" does not exist`));
      if (node.type !== "dir") return ctx.print(err(`cd: "${target}" is not a directory`));
      if (target === "-") ctx.print(line(displayPath(path, HOME), C.path));
      ctx.shell.oldCwd = ctx.shell.cwd;
      ctx.shell.cwd = path;
    },
  },
  pwd: {
    group: "Navigation",
    usage: "pwd",
    summary: "Print the working directory",
    run: (ctx) => ctx.print(line(ctx.shell.cwd, C.text)),
  },
  tree: {
    group: "Navigation",
    usage: "tree [-a] [path]",
    summary: "Show a directory as a tree",
    run: (ctx) => {
      const { flags, rest } = parseFlags(ctx.args);
      const target = rest[0] ?? ".";
      const node = getNode(ctx.shell.fs, abs(ctx, target));
      if (!node) return ctx.print(err(`tree: ${target}: No such file or directory`));
      if (node.type !== "dir") return ctx.print(err(`tree: ${target}: Not a directory`));
      const counts = { d: 0, f: 0 };
      ctx.print([{ text: target, cls: C.dir }]);
      ctx.print(...treeLines(node, "", flags.has("a"), counts));
      ctx.print(blank(), line(`${counts.d} directories, ${counts.f} files`, C.sub));
    },
  },
  cat: {
    group: "Navigation",
    usage: "cat <file...>",
    summary: "Print file contents",
    run: (ctx) => {
      if (!ctx.args.length) return ctx.print(err("cat: missing file operand. Try: cat about.md"));
      for (const target of ctx.args) {
        const path = abs(ctx, target);
        const node = getNode(ctx.shell.fs, path);
        if (!node) ctx.print(err(`cat: ${target}: No such file or directory`));
        else if (node.type === "dir") ctx.print(err(`cat: ${target}: Is a directory`));
        else if (node.binary) {
          ctx.print(
            node.open
              ? [{ text: `cat: ${target}: binary file. Try `, cls: C.warn }, { text: `open ${target}`, cls: C.ok }]
              : [{ text: `cat: ${target}: binary file`, cls: C.warn }]
          );
        } else ctx.print(...renderDoc(node.content, path.endsWith(".md")));
      }
    },
  },
  open: {
    group: "Navigation",
    usage: "open <file | app | url>",
    summary: "Open a file, app or URL in its desktop app",
    run: (ctx) => {
      const target = ctx.args[0];
      if (!target) {
        ctx.print(err("open: missing operand"));
        ctx.print(line(`Apps: ${APP_IDS.join(", ")}`, C.sub));
        return;
      }
      if (/^https?:\/\//i.test(target) || /^www\./i.test(target)) {
        const url = target.startsWith("www.") ? `https://${target}` : target;
        ctx.effect({ type: "openApp", appId: "browser", props: { url } });
        ctx.print(line(`Opening ${url} in Chrome`, C.dim));
        return;
      }
      if (isAppId(target) && !getNode(ctx.shell.fs, abs(ctx, target))) {
        ctx.effect({ type: "openApp", appId: target });
        ctx.print(line(`Opening ${target}`, C.dim));
        return;
      }
      openNode(ctx, target);
    },
  },

  // Files
  mkdir: {
    group: "Files",
    usage: "mkdir [-p] <dir...>",
    summary: "Create directories",
    run: (ctx) => {
      const { flags, rest } = parseFlags(ctx.args);
      if (!rest.length) return ctx.print(err("mkdir: missing operand"));
      for (const target of rest) {
        const e = mkdir(ctx.shell.fs, abs(ctx, target), HOME, flags.has("p"));
        if (e) ctx.print(err(`mkdir: cannot create directory '${target}': ${fsMessage[e]}`));
      }
    },
  },
  touch: {
    group: "Files",
    usage: "touch <file...>",
    summary: "Create empty files",
    run: (ctx) => {
      if (!ctx.args.length) return ctx.print(err("touch: missing file operand"));
      for (const target of ctx.args) {
        const e = touch(ctx.shell.fs, abs(ctx, target), HOME);
        if (e) ctx.print(err(`touch: cannot touch '${target}': ${fsMessage[e]}`));
      }
    },
  },
  rm: {
    group: "Files",
    usage: "rm [-r] [-f] <path...>",
    summary: "Remove files you created",
    run: (ctx) => {
      const { flags, rest } = parseFlags(ctx.args);
      const recursive = flags.has("r") || flags.has("R") || flags.has("recursive");
      if (!rest.length) return ctx.print(err("rm: missing operand"));
      for (const target of rest) {
        const path = abs(ctx, target);
        if (path === "/" || target === "/*") {
          ctx.print(
            err("rm: refusing to delete the root of my portfolio."),
            line("Nice try. This shell has seen that one before, and it is staying right here.", C.warn)
          );
          continue;
        }
        const e = remove(ctx.shell.fs, path, ctx.shell.cwd, HOME, recursive);
        if (e === "ENOENT" && flags.has("f")) continue;
        if (e === "EACCES" && path.startsWith(HOME)) {
          ctx.print(err(`rm: cannot remove '${target}': Permission denied (portfolio files are read-only)`));
        } else if (e) ctx.print(err(`rm: cannot remove '${target}': ${fsMessage[e]}`));
      }
    },
  },
  echo: {
    group: "Files",
    usage: "echo <text> [> file | >> file]",
    summary: "Print text, or write it to a file",
    run: (ctx) => {
      const idx = ctx.args.findIndex((a) => a === ">" || a === ">>");
      if (idx === -1) {
        ctx.print(line(ctx.args.join(" "), C.text));
        return;
      }
      const target = ctx.args[idx + 1];
      if (!target) return ctx.print(err("fish: Expected a string, but found end of the input"));
      const text = ctx.args.slice(0, idx).join(" ") + "\n";
      const e = writeFile(ctx.shell.fs, abs(ctx, target), HOME, text, ctx.args[idx] === ">>");
      if (e) ctx.print(err(`echo: ${target}: ${fsMessage[e]}`));
    },
  },

  // Portfolio shortcuts
  about: {
    group: "Portfolio",
    usage: "about",
    summary: "Who I am",
    run: (ctx) => {
      ctx.print(...renderDoc(aboutDoc(), true));
    },
  },
  projects: {
    group: "Portfolio",
    usage: "projects",
    summary: "Selected projects",
    run: (ctx) => {
      ctx.print([{ text: `# Projects (${projects.length})`, cls: C.h1 }], blank());
      for (const p of projects) {
        ctx.print([
          { text: p.name, cls: C.h2 },
          { text: `  ${p.tagline}`, cls: C.sub },
        ]);
        ctx.print([{ text: "  Stack: ", cls: C.key }, { text: p.stack.join(", "), cls: C.text }]);
        if (p.url) ctx.print([{ text: "  Live: ", cls: C.key }, ...linkify(p.url, C.text)]);
        ctx.print([{ text: `  cat projects/${p.slug}.md`, cls: C.dim }], blank());
      }
      ctx.print([
        { text: "Run ", cls: C.sub },
        { text: "open projects", cls: C.ok },
        { text: " for the Projects app.", cls: C.sub },
      ]);
    },
  },
  experience: {
    group: "Portfolio",
    usage: "experience",
    summary: "Where I have worked",
    run: (ctx) => {
      ctx.print([{ text: "# Experience", cls: C.h1 }], blank());
      for (const e of experience) {
        ctx.print([
          { text: e.role, cls: C.h2 },
          { text: ` at ${e.company}`, cls: C.text },
        ]);
        ctx.print(line(`  ${e.start} - ${e.end}, ${e.location}`, C.sub));
        for (const h of e.highlights) ctx.print([{ text: "  - ", cls: C.dim }, ...linkify(h, C.text)]);
        ctx.print(blank());
      }
    },
  },
  skills: {
    group: "Portfolio",
    usage: "skills",
    summary: "Languages, frameworks and tools",
    run: (ctx) => {
      const width = Math.max(...skills.map((g) => g.label.length)) + 2;
      ctx.print([{ text: "# Skills", cls: C.h1 }], blank());
      for (const g of skills) {
        ctx.print([
          { text: g.label.padEnd(width), cls: C.key },
          { text: g.items.join(", "), cls: C.text },
        ]);
      }
    },
  },
  education: {
    group: "Portfolio",
    usage: "education",
    summary: "Degrees",
    run: (ctx) => {
      ctx.print([{ text: "# Education", cls: C.h1 }], blank());
      for (const e of education) {
        ctx.print([{ text: `${e.degree} (${e.short})`, cls: C.h2 }]);
        ctx.print(line(`  ${e.school}, ${e.location}`, C.text));
        ctx.print(line(`  ${e.start} - ${e.end}, ${e.grade}`, C.sub), blank());
      }
    },
  },
  contact: {
    group: "Portfolio",
    usage: "contact",
    summary: "How to reach me",
    run: (ctx) => {
      ctx.print([{ text: "# Contact", cls: C.h1 }], blank());
      ctx.print(kv("Email", profile.contact.email), kv("Phone", profile.contact.phone), ...socialLines().slice(0, 3));
    },
  },
  resume: {
    group: "Portfolio",
    usage: "resume",
    summary: "Open my resume",
    run: (ctx) => {
      ctx.effect({ type: "openApp", appId: "resume" });
      ctx.print([
        { text: "Opening resume.pdf. Direct download: ", cls: C.sub },
        { text: profile.resumeUrl, cls: C.text, href: profile.resumeUrl },
      ]);
    },
  },
  social: {
    group: "Portfolio",
    usage: "social",
    summary: "LinkedIn, GitHub, blog and email",
    run: (ctx) => ctx.print(...socialLines()),
  },
  github: {
    group: "Portfolio",
    usage: "github",
    summary: "Open my GitHub in a new tab",
    run: (ctx) => {
      ctx.effect({ type: "url", url: profile.contact.github });
      ctx.print(line(`Opening ${profile.contact.github}`, C.dim));
    },
  },
  linkedin: {
    group: "Portfolio",
    usage: "linkedin",
    summary: "Open my LinkedIn in a new tab",
    run: (ctx) => {
      ctx.effect({ type: "url", url: profile.contact.linkedin });
      ctx.print(line(`Opening ${profile.contact.linkedin}`, C.dim));
    },
  },
  blog: {
    group: "Portfolio",
    usage: "blog",
    summary: "Open my blog in a new tab",
    run: (ctx) => {
      ctx.effect({ type: "url", url: profile.contact.blog });
      ctx.print(line(`Opening ${profile.contact.blog}`, C.dim));
    },
  },
  email: {
    group: "Portfolio",
    usage: "email",
    summary: "Write me an email",
    run: (ctx) => {
      ctx.effect({ type: "mailto", email: profile.contact.email });
      ctx.print(line(`Opening your mail client for ${profile.contact.email}`, C.dim));
    },
  },

  // System
  neofetch: {
    group: "System",
    usage: "neofetch",
    summary: "System info, portfolio style",
    run: neofetch,
  },
  whoami: {
    group: "System",
    usage: "whoami",
    summary: "Print the current user",
    run: (ctx) => ctx.print(line(profile.username, C.text)),
  },
  hostname: {
    group: "System",
    usage: "hostname",
    summary: "Print the host name",
    run: (ctx) => ctx.print(line(profile.hostname, C.text)),
  },
  date: {
    group: "System",
    usage: "date",
    summary: "Print the current date and time",
    run: (ctx) => ctx.print(line(ctx.env.now.toString(), C.text)),
  },
  uname: {
    group: "System",
    usage: "uname [-a]",
    summary: "Print system information",
    run: (ctx) => {
      const { flags } = parseFlags(ctx.args);
      ctx.print(
        line(
          flags.has("a")
            ? `Linux ${profile.hostname} 6.14.0-portfolio #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux`
            : "Linux",
          C.text
        )
      );
    },
  },
  history: {
    group: "System",
    usage: "history",
    summary: "Show commands you have run",
    run: (ctx) => {
      ctx.shell.history.forEach((cmd, i) => {
        ctx.print([{ text: String(i + 1).padStart(4) + "  ", cls: C.dim }, { text: cmd, cls: C.text }]);
      });
    },
  },
  clear: {
    group: "System",
    usage: "clear",
    summary: "Clear the screen (Ctrl+L)",
    run: (ctx) => ctx.clear(),
  },
  man: {
    group: "System",
    usage: "man <command>",
    summary: "Show usage for a command",
    run: (ctx) => {
      const name = ctx.args[0];
      if (!name) return ctx.print(err("What manual page do you want? For example, try man ls"));
      const spec = commands[name];
      if (!spec) return ctx.print(err(`No manual entry for ${name}`));
      ctx.print(
        [{ text: "NAME", cls: C.h1 }],
        [{ text: `    ${name}`, cls: C.ok }, { text: ` - ${spec.summary.toLowerCase()}`, cls: C.text }],
        blank(),
        [{ text: "SYNOPSIS", cls: C.h1 }],
        [{ text: `    ${spec.usage}`, cls: C.text }]
      );
    },
  },
  sudo: {
    group: "System",
    usage: "sudo <command>",
    summary: "Try your luck",
    run: (ctx) => {
      ctx.print(
        line(`[sudo] password for ${profile.username}: `, C.text),
        err(`${profile.username} is not in the sudoers file. This incident will be reported.`)
      );
    },
  },
  cowsay: {
    group: "System",
    usage: "cowsay [text]",
    summary: "A cow says something",
    run: (ctx) => ctx.print(...cowsay(ctx.args.join(" "))),
  },
  exit: {
    group: "System",
    usage: "exit",
    summary: "Close this terminal window",
    run: (ctx) => ctx.effect({ type: "close" }),
  },
};

export const commandNames = (): string[] => Object.keys(commands);

/** Closest command name for "did you mean", or null when nothing is close. */
export function suggest(name: string): string | null {
  let best: string | null = null;
  let bestScore = Infinity;
  for (const candidate of Object.keys(commands)) {
    const d = editDistance(name.toLowerCase(), candidate);
    if (d < bestScore) {
      bestScore = d;
      best = candidate;
    }
  }
  const limit = name.length <= 3 ? 1 : 2;
  return best && bestScore <= limit ? best : null;
}

/** Run one input line against a shell. Mutates `shell` (cwd, fs, history). */
export function execute(shell: Shell, input: string, env: Env): Result {
  const result: Result = { out: [], effects: [], clear: false };
  const trimmed = input.trim();
  if (!trimmed) return result;
  if (shell.history[shell.history.length - 1] !== trimmed) shell.history.push(trimmed);

  let tokens = tokenize(trimmed);
  const alias = ALIASES[tokens[0]];
  if (alias) tokens = [...alias, ...tokens.slice(1)];
  const [name, ...args] = tokens;
  const spec = commands[name];

  const ctx: Ctx = {
    shell,
    env,
    args,
    print: (...lines) => result.out.push(...lines),
    effect: (e) => result.effects.push(e),
    clear: () => {
      result.clear = true;
      result.out = [];
    },
  };

  if (!spec) {
    result.out.push(err(`fish: Unknown command: ${name}`));
    const hint = suggest(name);
    if (hint) {
      result.out.push([
        { text: "Did you mean ", cls: C.sub },
        { text: hint, cls: C.ok },
        { text: "?", cls: C.sub },
      ]);
    } else {
      result.out.push([
        { text: "Type ", cls: C.sub },
        { text: "help", cls: C.ok },
        { text: " to see what this shell can do.", cls: C.sub },
      ]);
    }
    return result;
  }
  spec.run(ctx);
  return result;
}
