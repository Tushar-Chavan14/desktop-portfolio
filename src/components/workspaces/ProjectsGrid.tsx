"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { Modal } from "@heroui/react";
import { PiArrowSquareOutBold, PiArrowsOutSimpleBold, PiXBold } from "react-icons/pi";
import type { Project } from "@src/data/profile";

const hostOf = (url: string) => new URL(url).hostname.replace(/^www\./, "");

/** "E-Learning Platform" -> "EL", "Sona" -> "So". */
const initials = (name: string) => {
  const words = name.match(/[A-Za-z]+/g) ?? [name];
  return words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : words[0].slice(0, 2);
};

const coverTint: Record<Project["kind"], string> = {
  Commerce: "from-mocha-mauve/35 to-mocha-pink/10 text-mocha-mauve",
  Platform: "from-mocha-blue/35 to-mocha-sapphire/10 text-mocha-blue",
  AI: "from-mocha-peach/35 to-mocha-yellow/10 text-mocha-peach",
  Dashboard: "from-mocha-teal/35 to-mocha-green/10 text-mocha-teal",
};

const statusOf = (project: Project) => (project.url ? (project.note ?? hostOf(project.url)) : "Private client build");

const Tag = ({ children }: { children: ReactNode }) => (
  <span className="rounded-md bg-mocha-surface0 px-2 py-0.5 text-xs font-medium text-mocha-subtext1">{children}</span>
);

/** Screenshot when the live site could be captured, otherwise a cover in the project's category colour. */
const Visual = ({ project, sizes }: { project: Project; sizes: string }) =>
  project.image ? (
    <Image src={project.image} alt={`${project.name} website`} fill sizes={sizes} className="object-cover object-top" />
  ) : (
    <div className={`flex h-full w-full flex-col justify-between bg-linear-to-br p-4 ${coverTint[project.kind]}`}>
      <span className="text-xs font-semibold tracking-wide">{project.kind}</span>
      <span className="text-4xl font-bold tracking-tight text-mocha-text/90">{initials(project.name)}</span>
    </div>
  );

const ProjectCard = ({ project, onOpen }: { project: Project; onOpen: () => void }) => (
  <button
    type="button"
    onClick={onOpen}
    aria-haspopup="dialog"
    className="group flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-mocha-base/90 text-left shadow-[0_20px_50px_-20px_rgb(17_17_27/0.9)] transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-mocha-mauve/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mocha-mauve"
  >
    <span className="flex h-8 w-full shrink-0 items-center gap-2 border-b border-white/5 px-3">
      <span aria-hidden className="flex gap-1">
        <span className="size-2 rounded-full bg-mocha-red/80" />
        <span className="size-2 rounded-full bg-mocha-yellow/80" />
        <span className="size-2 rounded-full bg-mocha-green/80" />
      </span>
      <span className="truncate text-[11px] text-mocha-overlay2">{statusOf(project)}</span>
    </span>
    <span className="relative block aspect-[16/9] w-full shrink-0 overflow-hidden border-b border-white/5 lg:aspect-auto lg:min-h-0 lg:flex-1">
      <span className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]">
        <Visual project={project} sizes="(min-width: 1024px) 18rem, (min-width: 640px) 44vw, 88vw" />
      </span>
    </span>
    <span className="flex w-full min-w-0 shrink-0 flex-col gap-2 p-3.5">
      <span className="block min-w-0">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate font-semibold text-mocha-text">{project.name}</span>
          <PiArrowsOutSimpleBold
            className="size-4 shrink-0 text-mocha-overlay2 transition-colors group-hover:text-mocha-mauve"
            aria-hidden
          />
        </span>
        <span className="block truncate text-sm text-mocha-subtext0">{project.tagline}</span>
      </span>
      {/* One line of tags; any that would wrap are hidden whole, keeping every card the same height. */}
      <span className="flex h-[1.375rem] flex-wrap gap-1 overflow-hidden">
        {project.stack.slice(0, 3).map((s) => (
          <Tag key={s}>{s}</Tag>
        ))}
      </span>
    </span>
  </button>
);

/** Project grid for the overview; each card opens a details modal. */
export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  // Keep the last project mounted while the modal animates out.
  const [selected, setSelected] = useState<Project | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:h-full lg:grid-cols-4 lg:grid-rows-2">
        {projects.map((p) => (
          <li key={p.id} className="flex min-h-0 min-w-0">
            <ProjectCard
              project={p}
              onOpen={() => {
                setSelected(p);
                setOpen(true);
              }}
            />
          </li>
        ))}
      </ul>

      <Modal>
        <Modal.Backdrop
          isOpen={open}
          onOpenChange={setOpen}
          className="bg-mocha-crust/70 backdrop-blur-sm"
        >
          <Modal.Container size="lg" scroll="inside" className="sm:w-full">
            <Modal.Dialog className="max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-mocha-base p-0 text-mocha-text">
              {({ close }) =>
                selected && (
                  <>
                    <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-white/5 px-4">
                      <span className="truncate text-xs text-mocha-overlay2">{statusOf(selected)}</span>
                      <button
                        type="button"
                        onClick={close}
                        aria-label="Close"
                        className="grid size-8 place-items-center rounded-lg text-mocha-subtext1 transition hover:bg-mocha-surface0 hover:text-mocha-text focus-visible:outline-2 focus-visible:outline-mocha-mauve"
                      >
                        <PiXBold className="size-4" aria-hidden />
                      </button>
                    </div>
                    <Modal.Body className="m-0 overflow-y-auto p-0 [scrollbar-width:thin]">
                      {selected.image ? (
                        <div className="relative aspect-[16/7] w-full overflow-hidden border-b border-white/5">
                          <Visual project={selected} sizes="(min-width: 768px) 48rem, 100vw" />
                        </div>
                      ) : (
                        // No screenshot: a short banner so the details stay above the fold.
                        <div
                          aria-hidden
                          className={`flex h-24 w-full items-end bg-linear-to-br px-6 pb-3 ${coverTint[selected.kind]}`}
                        >
                          <span className="text-4xl font-bold tracking-tight text-mocha-text/90">{initials(selected.name)}</span>
                        </div>
                      )}
                      <div className="flex flex-col gap-6 p-6">
                        <div>
                          <p className="text-sm font-medium text-mocha-mauve">{selected.kind}</p>
                          <Modal.Heading className="mt-1 text-2xl font-semibold tracking-tight text-mocha-text">
                            {selected.name}
                          </Modal.Heading>
                          <p className="mt-1 text-mocha-subtext1">{selected.tagline}</p>
                        </div>

                        <section aria-label="What I built">
                          <h3 className="text-sm font-semibold text-mocha-text">What I built</h3>
                          <ul className="mt-3 flex flex-col gap-2.5">
                            {selected.highlights.map((h) => (
                              <li key={h} className="flex gap-2.5 text-[15px] leading-relaxed text-mocha-subtext1">
                                <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-mocha-mauve" />
                                {h}
                              </li>
                            ))}
                          </ul>
                        </section>

                        <section aria-label="Tech stack">
                          <h3 className="text-sm font-semibold text-mocha-text">Stack</h3>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {selected.stack.map((s) => (
                              <Tag key={s}>{s}</Tag>
                            ))}
                          </div>
                        </section>
                      </div>
                    </Modal.Body>
                    <Modal.Footer className="flex items-center justify-between gap-3 border-t border-white/5 px-6 py-4">
                      <p className="text-sm text-mocha-subtext0">
                        {selected.url
                          ? selected.note
                            ? `Live site (${selected.note})`
                            : "Live site"
                          : "Private client build, no public link"}
                      </p>
                      {selected.url && (
                        <a
                          href={selected.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-mocha-mauve px-4 text-sm font-semibold text-mocha-crust transition hover:bg-mocha-mauve/90 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mocha-mauve"
                        >
                          Visit {hostOf(selected.url)}
                          <PiArrowSquareOutBold className="size-4" aria-hidden />
                        </a>
                      )}
                    </Modal.Footer>
                  </>
                )
              }
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
