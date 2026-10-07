"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  PiArrowLeftBold,
  PiArrowSquareOutBold,
  PiBriefcaseBold,
  PiCaretRightBold,
  PiFolderSimpleFill,
  PiGlobeBold,
  PiHouseBold,
  PiSquaresFourBold,
} from "react-icons/pi";
import type { IconType } from "react-icons";
import { experience, projects, type Project } from "@src/data/profile";
import useWindowStore from "@src/store/zustore/useWindowStore";
import type { AppComponentProps } from "../types";
import { Tag, buttonClass } from "../ui";

type Kind = Project["kind"];
type View = { type: "all" } | { type: "kind"; kind: Kind } | { type: "experience" } | { type: "project"; id: string; from: View };

const kinds: Kind[] = ["Commerce", "Platform", "AI", "Dashboard"];

const viewLabel = (view: View): string => {
  if (view.type === "all") return "All projects";
  if (view.type === "kind") return view.kind;
  if (view.type === "experience") return "Experience";
  return projects.find((p) => p.id === view.id)?.name ?? "Project";
};

const SidebarItem = ({
  icon: Icon,
  label,
  count,
  active,
  onPress,
}: {
  icon: IconType;
  label: string;
  count?: number;
  active: boolean;
  onPress: () => void;
}) => (
  <button
    type="button"
    onClick={onPress}
    aria-current={active ? "page" : undefined}
    className={`flex w-full shrink-0 items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm transition focus-visible:outline-2 focus-visible:outline-mocha-mauve ${
      active ? "bg-mocha-surface0 font-medium text-mocha-text" : "text-mocha-subtext1 hover:bg-mocha-surface0/60"
    }`}
  >
    <Icon className={`size-4 shrink-0 ${active ? "text-mocha-mauve" : ""}`} aria-hidden />
    <span className="flex-1 truncate">{label}</span>
    {count !== undefined && <span className="text-xs text-mocha-overlay1 tabular-nums">{count}</span>}
  </button>
);

const ProjectDetail = ({ project, onBack }: { project: Project; onBack: () => void }) => {
  const openApp = useWindowStore((s) => s.openApp);
  return (
    <article className="mx-auto max-w-3xl px-5 py-6 @2xl:px-8">
      <button type="button" onClick={onBack} className={`${buttonClass.ghost} -ml-2.5`}>
        <PiArrowLeftBold className="size-4" aria-hidden />
        Back
      </button>
      <header className="mt-4 flex flex-col gap-4 @xl:flex-row @xl:items-end @xl:justify-between">
        <div>
          <p className="text-sm font-medium text-mocha-mauve">{project.kind}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-mocha-text @2xl:text-3xl">{project.name}</h1>
          <p className="mt-1 text-mocha-subtext1">{project.tagline}</p>
        </div>
        {project.url && (
          <div className="flex shrink-0 gap-2">
            <button type="button" className={buttonClass.primary} onClick={() => openApp("browser", { url: project.url })}>
              <PiGlobeBold className="size-4" aria-hidden />
              Visit site
            </button>
            <a href={project.url} target="_blank" rel="noopener noreferrer" className={buttonClass.secondary} aria-label={`Open ${project.name} in a new tab`}>
              <PiArrowSquareOutBold className="size-4" aria-hidden />
            </a>
          </div>
        )}
      </header>

      <section aria-label="Tech stack" className="mt-6 flex flex-wrap gap-1.5">
        {project.stack.map((s) => (
          <Tag key={s}>{s}</Tag>
        ))}
      </section>

      <section aria-labelledby="project-highlights" className="mt-8">
        <h2 id="project-highlights" className="text-sm font-semibold text-mocha-text">
          What I built
        </h2>
        <ul className="mt-3 flex flex-col gap-3">
          {project.highlights.map((h) => (
            <li key={h} className="flex gap-3 text-[15px] leading-relaxed text-mocha-subtext1">
              <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-mocha-mauve/70" />
              <span className="max-w-[65ch]">{h}</span>
            </li>
          ))}
        </ul>
      </section>
      {!project.url && (
        <p className="mt-8 rounded-xl bg-mocha-mantle px-4 py-3 text-sm text-mocha-subtext0">
          This one is a private client build, so there is no public link.
        </p>
      )}
    </article>
  );
};

const ExperienceView = () => (
  <div className="mx-auto max-w-3xl px-5 py-6 @2xl:px-8">
    <h1 className="text-2xl font-semibold tracking-tight text-mocha-text">Experience</h1>
    <ol className="mt-6 flex flex-col gap-8">
      {experience.map((job) => (
        <li key={job.id} className="grid gap-2 @xl:grid-cols-[10rem_1fr] @xl:gap-6">
          <p className="text-sm text-mocha-overlay1 tabular-nums @xl:pt-0.5">
            {job.start} - {job.end}
          </p>
          <div>
            <h2 className="font-semibold text-mocha-text">{job.role}</h2>
            <p className="text-sm text-mocha-subtext0">
              {job.company}, {job.location}
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {job.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-sm leading-relaxed text-mocha-subtext1">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-mocha-mauve/70" />
                  <span className="max-w-[65ch]">{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  </div>
);

const Folder = ({ project, onOpen, index }: { project: Project; onOpen: () => void; index: number }) => {
  const reduce = useReducedMotion();
  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduce ? 0 : index * 0.03, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <button
        type="button"
        onClick={onOpen}
        className="group flex h-full w-full flex-col items-center gap-2 rounded-xl p-3 text-center transition hover:bg-mocha-surface0/70 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-mocha-mauve"
      >
        <PiFolderSimpleFill className="size-16 text-mocha-blue drop-shadow-[0_6px_10px_rgb(17_17_27/0.4)] transition-transform group-hover:-translate-y-0.5" aria-hidden />
        <span className="text-sm font-medium text-mocha-text">{project.name}</span>
        <span className="line-clamp-2 text-xs text-mocha-subtext0">{project.tagline}</span>
      </button>
    </motion.li>
  );
};

export default function Projects({ projectId, view: initialView }: AppComponentProps) {
  const [view, setView] = useState<View>(() => {
    if (typeof projectId === "string" && projects.some((p) => p.id === projectId)) {
      return { type: "project", id: projectId, from: { type: "all" } };
    }
    return initialView === "experience" ? { type: "experience" } : { type: "all" };
  });
  const reduce = useReducedMotion();

  // Launching again with new props (e.g. from the terminal) navigates this window.
  useEffect(() => {
    if (typeof projectId === "string" && projects.some((p) => p.id === projectId)) {
      setView({ type: "project", id: projectId, from: { type: "all" } });
    }
  }, [projectId]);
  useEffect(() => {
    if (initialView === "experience") setView({ type: "experience" });
  }, [initialView]);

  const listed = useMemo(
    () => (view.type === "kind" ? projects.filter((p) => p.kind === view.kind) : projects),
    [view]
  );

  const crumbs: { label: string; view?: View }[] = [{ label: "Home" }, { label: "Projects", view: { type: "all" } }];
  if (view.type === "kind" || view.type === "experience") crumbs.push({ label: viewLabel(view) });
  if (view.type === "project") {
    if (view.from.type !== "all") crumbs.push({ label: viewLabel(view.from), view: view.from });
    crumbs.push({ label: viewLabel(view) });
  }

  const sectionKey = view.type === "project" ? `p-${view.id}` : view.type === "kind" ? `k-${view.kind}` : view.type;
  const activeSection = view.type === "project" ? view.from : view;
  const isActive = (v: View) =>
    v.type === activeSection.type && (v.type !== "kind" || (activeSection.type === "kind" && activeSection.kind === v.kind));

  return (
    <div className="@container flex h-full flex-col">
      {/* Path bar */}
      <nav aria-label="Location" className="flex h-11 shrink-0 items-center gap-1 border-b border-mocha-surface0 bg-mocha-mantle px-3 text-sm">
        <button
          type="button"
          className={buttonClass.icon}
          aria-label="Back"
          disabled={view.type !== "project"}
          onClick={() => view.type === "project" && setView(view.from)}
        >
          <PiArrowLeftBold className="size-4" aria-hidden />
        </button>
        <ol className="flex min-w-0 items-center gap-1 overflow-hidden rounded-lg bg-mocha-crust/60 px-2.5 py-1">
          {crumbs.map((c, i) => (
            <li key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-1">
              {i > 0 && <PiCaretRightBold className="size-3 shrink-0 text-mocha-overlay0" aria-hidden />}
              {i === 0 && <PiHouseBold className="size-3.5 shrink-0 text-mocha-subtext0" aria-hidden />}
              {c.view && i < crumbs.length - 1 ? (
                <button type="button" onClick={() => setView(c.view!)} className="truncate text-mocha-subtext1 hover:text-mocha-text">
                  {c.label}
                </button>
              ) : (
                <span className={`truncate ${i === crumbs.length - 1 ? "font-medium text-mocha-text" : "text-mocha-subtext0"}`}>
                  {c.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex min-h-0 flex-1 flex-col @2xl:flex-row">
        {/* Sidebar: vertical on wide windows, a scrollable strip on narrow ones */}
        <aside className="flex shrink-0 gap-1 overflow-x-auto border-b border-mocha-surface0 bg-mocha-mantle/60 p-2 @2xl:w-52 @2xl:flex-col @2xl:overflow-x-visible @2xl:border-r @2xl:border-b-0">
          <p className="hidden px-2.5 pt-1 pb-1.5 text-xs font-medium text-mocha-overlay1 @2xl:block">Projects</p>
          <div className="contents @2xl:flex @2xl:flex-col @2xl:gap-0.5">
            <SidebarItem icon={PiSquaresFourBold} label="All" count={projects.length} active={isActive({ type: "all" })} onPress={() => setView({ type: "all" })} />
            {kinds.map((kind) => (
              <SidebarItem
                key={kind}
                icon={PiFolderSimpleFill}
                label={kind}
                count={projects.filter((p) => p.kind === kind).length}
                active={isActive({ type: "kind", kind })}
                onPress={() => setView({ type: "kind", kind })}
              />
            ))}
          </div>
          <p className="hidden px-2.5 pt-4 pb-1.5 text-xs font-medium text-mocha-overlay1 @2xl:block">Career</p>
          <SidebarItem icon={PiBriefcaseBold} label="Experience" active={isActive({ type: "experience" })} onPress={() => setView({ type: "experience" })} />
        </aside>

        <main className="min-h-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-mocha-surface2 scrollbar-track-mocha-surface0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={sectionKey}
              initial={reduce ? false : { opacity: 0, x: view.type === "project" ? 16 : 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {view.type === "project" ? (
                <ProjectDetail project={projects.find((p) => p.id === view.id)!} onBack={() => setView(view.from)} />
              ) : view.type === "experience" ? (
                <ExperienceView />
              ) : (
                <div className="p-4">
                  <p className="px-1 pb-3 text-sm text-mocha-subtext0">
                    {listed.length} {listed.length === 1 ? "project" : "projects"}. Open a folder to read what I built.
                  </p>
                  <ul className="grid grid-cols-2 gap-1 @md:grid-cols-3 @3xl:grid-cols-4 @5xl:grid-cols-5">
                    {listed.map((p, i) => (
                      <Folder key={p.id} project={p} index={i} onOpen={() => setView({ type: "project", id: p.id, from: view })} />
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
