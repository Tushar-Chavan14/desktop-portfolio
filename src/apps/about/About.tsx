"use client";

import { motion, useReducedMotion } from "motion/react";
import { Chip } from "@heroui/react";
import {
  PiAddressBookBold,
  PiArrowRightBold,
  PiFilePdfBold,
  PiGithubLogoBold,
  PiGraduationCapBold,
  PiLinkedinLogoBold,
  PiMapPinBold,
  PiMediumLogoBold,
} from "react-icons/pi";
import { education, experience, profile, projects, skills } from "@src/data/profile";
import useWindowStore from "@src/store/zustore/useWindowStore";
import type { AppComponentProps } from "../types";
import { Avatar, SectionTitle, buttonClass } from "../ui";

const reveal = (reduce: boolean | null, i: number) =>
  reduce
    ? {}
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.05 + i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
      };

const socials = [
  { label: "LinkedIn", href: profile.contact.linkedin, Icon: PiLinkedinLogoBold },
  { label: "GitHub", href: profile.contact.github, Icon: PiGithubLogoBold },
  { label: "Blog on Medium", href: profile.contact.blog, Icon: PiMediumLogoBold },
];

export default function About(_props: AppComponentProps) {
  const openApp = useWindowStore((s) => s.openApp);
  const reduce = useReducedMotion();

  return (
    <div className="@container h-full overflow-y-auto scrollbar-thin scrollbar-thumb-mocha-surface2 scrollbar-track-mocha-surface0">
      <div className="mx-auto max-w-5xl px-5 py-6 @2xl:px-8 @2xl:py-8">
        {/* Intro */}
        <motion.header {...reveal(reduce, 0)} className="flex flex-col gap-5 @xl:flex-row @xl:items-center">
          <Avatar size={84} />
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-semibold tracking-tight text-mocha-text @2xl:text-4xl">{profile.name}</h1>
            <p className="mt-1 text-base text-mocha-subtext1">
              {profile.role}
              <span className="mx-2 text-mocha-overlay0">/</span>
              <span className="inline-flex items-center gap-1 text-mocha-subtext0">
                <PiMapPinBold className="size-3.5" aria-hidden />
                {profile.location}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={buttonClass.primary} onClick={() => openApp("contact")}>
              <PiAddressBookBold className="size-4" aria-hidden />
              Contact
            </button>
            <button type="button" className={buttonClass.secondary} onClick={() => openApp("resume")}>
              <PiFilePdfBold className="size-4" aria-hidden />
              Resume
            </button>
          </div>
        </motion.header>

        <div className="mt-8 grid gap-8 @3xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] @3xl:gap-10">
          {/* Left column */}
          <div className="flex flex-col gap-8">
            <motion.section {...reveal(reduce, 1)} aria-labelledby="about-summary">
              <SectionTitle id="about-summary">About</SectionTitle>
              <p className="mt-3 max-w-[65ch] text-[15px] leading-relaxed text-pretty text-mocha-subtext1">
                {profile.summary}
              </p>
              <ul className="mt-4 flex flex-wrap gap-1">
                {socials.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener noreferrer" className={buttonClass.ghost}>
                      <Icon className="size-4" aria-hidden />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.section>

            <motion.section {...reveal(reduce, 2)} aria-labelledby="about-experience">
              <div className="flex items-baseline justify-between gap-4">
                <SectionTitle id="about-experience">Experience</SectionTitle>
                <button
                  type="button"
                  onClick={() => openApp("projects", { view: "experience" })}
                  className="inline-flex items-center gap-1 text-sm font-medium text-mocha-mauve hover:underline underline-offset-4"
                >
                  Full history
                  <PiArrowRightBold className="size-3.5" aria-hidden />
                </button>
              </div>
              <ol className="mt-4 flex flex-col gap-5 border-l border-mocha-surface1 pl-5">
                {experience.map((job) => (
                  <li key={job.id} className="relative">
                    <span
                      aria-hidden
                      className="absolute top-1.5 -left-[25px] size-2.5 rounded-full border-2 border-mocha-base bg-mocha-mauve"
                    />
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <h3 className="font-medium text-mocha-text">
                        {job.role}
                        <span className="text-mocha-subtext0"> at {job.company}</span>
                      </h3>
                      <p className="text-sm text-mocha-overlay1 tabular-nums">
                        {job.start} - {job.end}
                      </p>
                    </div>
                    <p className="mt-1.5 max-w-[65ch] text-sm leading-relaxed text-mocha-subtext1">
                      {job.highlights[0]}
                    </p>
                  </li>
                ))}
              </ol>
            </motion.section>

            <motion.section {...reveal(reduce, 3)} aria-labelledby="about-work">
              <div className="flex items-baseline justify-between gap-4">
                <SectionTitle id="about-work">Selected work</SectionTitle>
                <button
                  type="button"
                  onClick={() => openApp("projects")}
                  className="inline-flex items-center gap-1 text-sm font-medium text-mocha-mauve hover:underline underline-offset-4"
                >
                  All {projects.length} projects
                  <PiArrowRightBold className="size-3.5" aria-hidden />
                </button>
              </div>
              <ul className="mt-3 grid gap-2 @lg:grid-cols-2">
                {projects.slice(0, 4).map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => openApp("projects", { projectId: p.id })}
                      className="group flex w-full flex-col items-start rounded-xl bg-mocha-mantle px-4 py-3 text-left transition hover:bg-mocha-surface0 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-mocha-mauve"
                    >
                      <span className="font-medium text-mocha-text">{p.name}</span>
                      <span className="text-sm text-mocha-subtext0">{p.tagline}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.section>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-8">
            <motion.section {...reveal(reduce, 2)} aria-labelledby="about-skills">
              <SectionTitle id="about-skills">Skills</SectionTitle>
              <dl className="mt-4 flex flex-col gap-4">
                {skills.map((group) => (
                  <div key={group.id}>
                    <dt className="text-xs font-medium text-mocha-overlay2">{group.label}</dt>
                    <dd className="mt-1.5 flex flex-wrap gap-1.5">
                      {group.items.map((item) => (
                        <Chip key={item} size="sm" variant="soft" className="bg-mocha-surface0 text-mocha-text">
                          {item}
                        </Chip>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </motion.section>

            <motion.section {...reveal(reduce, 3)} aria-labelledby="about-education">
              <SectionTitle id="about-education">Education</SectionTitle>
              <ul className="mt-4 flex flex-col gap-3">
                {education.map((ed) => (
                  <li key={ed.id} className="flex gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-mocha-surface0 text-mocha-mauve">
                      <PiGraduationCapBold className="size-4.5" aria-hidden />
                    </span>
                    <div>
                      <p className="font-medium text-mocha-text">{ed.degree}</p>
                      <p className="text-sm text-mocha-subtext0">
                        {ed.school}, {ed.location}
                      </p>
                      <p className="text-sm text-mocha-overlay1 tabular-nums">
                        {ed.start} - {ed.end}, {ed.grade}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
}
