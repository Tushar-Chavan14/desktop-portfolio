// In-memory virtual file system helpers. All functions are pure except the
// explicit mutators (mkdir, touch, writeFile, remove), which mutate the tree
// passed in. Each terminal instance owns its own tree.

import type { AppId } from "@src/apps/meta";

export type OpenAction =
  | { kind: "app"; appId: AppId; props?: Record<string, unknown> }
  | { kind: "url"; url: string };

export interface FileNode {
  type: "file";
  content: string;
  /** Generated portfolio or system file: cannot be removed. */
  locked?: boolean;
  binary?: boolean;
  owner?: string;
  open?: OpenAction;
}

export interface DirNode {
  type: "dir";
  children: Record<string, FsNode>;
  locked?: boolean;
  owner?: string;
}

export type FsNode = FileNode | DirNode;

export type FsError = "ENOENT" | "EEXIST" | "ENOTDIR" | "EISDIR" | "EACCES" | "EBUSY" | "EROOT";

export const file = (content: string, extra: Partial<Omit<FileNode, "type">> = {}): FileNode => ({
  type: "file",
  content,
  ...extra,
});

export const dir = (
  children: Record<string, FsNode> = {},
  extra: Partial<Omit<DirNode, "type" | "children">> = {}
): DirNode => ({ type: "dir", children, ...extra });

/**
 * Resolve `input` against `cwd` into a normalized absolute path.
 * Handles `~`, absolute paths, `.`, `..` and repeated slashes.
 */
export function resolvePath(cwd: string, input: string, home: string): string {
  let raw = input.trim();
  if (raw === "" || raw === "~") return raw === "~" ? home : cwd;
  if (raw.startsWith("~/")) raw = home + raw.slice(1);
  const base = raw.startsWith("/") ? raw : `${cwd}/${raw}`;
  const stack: string[] = [];
  for (const part of base.split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "..") stack.pop();
    else stack.push(part);
  }
  return `/${stack.join("/")}`;
}

/** Show a path relative to home as `~`. */
export function displayPath(path: string, home: string): string {
  if (path === home) return "~";
  if (path.startsWith(`${home}/`)) return `~${path.slice(home.length)}`;
  return path;
}

export function getNode(root: DirNode, path: string): FsNode | null {
  let node: FsNode = root;
  for (const part of path.split("/").filter(Boolean)) {
    if (node.type !== "dir") return null;
    const next: FsNode | undefined = node.children[part];
    if (!next) return null;
    node = next;
  }
  return node;
}

export function splitPath(path: string): { parent: string; name: string } {
  const idx = path.lastIndexOf("/");
  return { parent: idx <= 0 ? "/" : path.slice(0, idx), name: path.slice(idx + 1) };
}

/** Writes are allowed only inside home and /tmp. */
export function isWritable(path: string, home: string): boolean {
  return (
    path === home || path.startsWith(`${home}/`) || path === "/tmp" || path.startsWith("/tmp/")
  );
}

/** Sorted directory entries; dotfiles only when `all` is set. */
export function listDir(node: DirNode, all = false): [string, FsNode][] {
  return Object.entries(node.children)
    .filter(([name]) => all || !name.startsWith("."))
    .sort(([a], [b]) => a.replace(/^\./, "").localeCompare(b.replace(/^\./, "")));
}

export function mkdir(root: DirNode, path: string, home: string, parents = false): FsError | null {
  if (!isWritable(path, home)) return "EACCES";
  const parts = path.split("/").filter(Boolean);
  let node: DirNode = root;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const last = i === parts.length - 1;
    const next: FsNode | undefined = node.children[part];
    if (next) {
      if (next.type !== "dir") return "ENOTDIR";
      if (last && !parents) return "EEXIST";
      node = next;
      continue;
    }
    if (!last && !parents) return "ENOENT";
    const created = dir();
    node.children[part] = created;
    node = created;
  }
  return null;
}

export function writeFile(
  root: DirNode,
  path: string,
  home: string,
  content: string,
  append = false
): FsError | null {
  const { parent, name } = splitPath(path);
  const parentNode = getNode(root, parent);
  if (!parentNode) return "ENOENT";
  if (parentNode.type !== "dir") return "ENOTDIR";
  const existing = parentNode.children[name];
  if (existing?.type === "dir") return "EISDIR";
  if (!isWritable(path, home) || existing?.locked) return "EACCES";
  if (existing && existing.type === "file") {
    existing.content = append ? existing.content + content : content;
  } else {
    parentNode.children[name] = file(content);
  }
  return null;
}

export function touch(root: DirNode, path: string, home: string): FsError | null {
  const existing = getNode(root, path);
  if (existing) return null;
  return writeFile(root, path, home, "");
}

function containsLocked(node: FsNode): boolean {
  if (node.locked) return true;
  if (node.type === "dir") return Object.values(node.children).some(containsLocked);
  return false;
}

export function remove(
  root: DirNode,
  path: string,
  cwd: string,
  home: string,
  recursive = false
): FsError | null {
  if (path === "/") return "EROOT";
  const node = getNode(root, path);
  if (!node) return "ENOENT";
  if (node.type === "dir" && !recursive) return "EISDIR";
  if (!isWritable(path, home) || containsLocked(node)) return "EACCES";
  if (cwd === path || cwd.startsWith(`${path}/`)) return "EBUSY";
  const { parent, name } = splitPath(path);
  const parentNode = getNode(root, parent);
  if (!parentNode || parentNode.type !== "dir") return "ENOENT";
  delete parentNode.children[name];
  return null;
}

/** Longest common prefix of a list of strings. */
export function commonPrefix(items: string[]): string {
  if (!items.length) return "";
  let prefix = items[0];
  for (const item of items.slice(1)) {
    while (!item.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

/** Levenshtein distance, used for "did you mean" suggestions. */
export function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

export interface Completion {
  /** The new full input value. */
  input: string;
  /** Candidates to print when the completion is ambiguous. */
  candidates: string[];
}

/**
 * Tab completion. The first token completes command names; later tokens
 * complete paths (directories only when `dirsOnly`), plus `extraWords`.
 */
export function complete(
  input: string,
  opts: {
    root: DirNode;
    cwd: string;
    home: string;
    commands: string[];
    dirsOnly?: (command: string) => boolean;
    extraWords?: (command: string) => string[];
  }
): Completion {
  const lastSpace = input.lastIndexOf(" ");
  const head = input.slice(0, lastSpace + 1);
  const token = input.slice(lastSpace + 1);
  const isFirst = input.trimStart() === token;

  if (isFirst) {
    const matches = opts.commands.filter((c) => c.startsWith(token)).sort();
    return finish(head, token, matches.map((m) => ({ value: m, display: m, suffix: " " })));
  }

  const command = input.trimStart().split(/\s+/)[0];
  const slash = token.lastIndexOf("/");
  const dirPart = slash >= 0 ? token.slice(0, slash + 1) : "";
  const namePart = token.slice(slash + 1);
  const dirPath = resolvePath(opts.cwd, dirPart === "" ? "." : dirPart, opts.home);
  const dirNode = getNode(opts.root, dirPath);
  const options: { value: string; display: string; suffix: string }[] = [];

  if (dirNode?.type === "dir") {
    const onlyDirs = opts.dirsOnly?.(command) ?? false;
    for (const [name, node] of listDir(dirNode, namePart.startsWith("."))) {
      if (!name.startsWith(namePart)) continue;
      if (onlyDirs && node.type !== "dir") continue;
      const isDir = node.type === "dir";
      options.push({
        value: dirPart + name,
        display: isDir ? `${name}/` : name,
        suffix: isDir ? "/" : " ",
      });
    }
  }
  if (dirPart === "") {
    for (const word of opts.extraWords?.(command) ?? []) {
      if (word.startsWith(token) && !options.some((o) => o.value === word)) {
        options.push({ value: word, display: word, suffix: " " });
      }
    }
  }
  return finish(head, token, options);
}

function finish(
  head: string,
  token: string,
  options: { value: string; display: string; suffix: string }[]
): Completion {
  if (options.length === 0) return { input: head + token, candidates: [] };
  if (options.length === 1) {
    const [only] = options;
    return { input: head + only.value + only.suffix, candidates: [] };
  }
  const prefix = commonPrefix(options.map((o) => o.value));
  if (prefix.length > token.length) return { input: head + prefix, candidates: [] };
  return { input: head + token, candidates: options.map((o) => o.display) };
}
