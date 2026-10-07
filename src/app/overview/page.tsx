import type { Metadata } from "next";
import Image from "next/image";
import { Fragment, type ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  PiAddressBookBold,
  PiAmazonLogoBold,
  PiArrowsClockwiseBold,
  PiDatabaseBold,
  PiGearSixBold,
  PiLeafBold,
  PiOpenAiLogoBold,
  PiArrowUpRightBold,
  PiBriefcaseBold,
  PiDownloadSimpleBold,
  PiEnvelopeSimpleBold,
  PiFolderOpenBold,
  PiGithubLogoBold,
  PiGraduationCapBold,
  PiLinkedinLogoBold,
  PiMapPinBold,
  PiMediumLogoBold,
  PiMonitorBold,
  PiPhoneBold,
  PiSquaresFourBold,
  PiUserBold,
} from "react-icons/pi";
import { education, experience, profile, projects, type Project } from "@src/data/profile";
import { Monogram } from "@src/apps/ui";
import { CopyButton, DesktopLink } from "@src/components/overview/client";
import ContactForm from "@src/components/contact/ContactForm";
import Workspaces, { type Workspace } from "@src/components/workspaces/Workspaces";
import ProjectsGrid from "@src/components/workspaces/ProjectsGrid";
import IconCloud from "@src/components/workspaces/IconCloud";
import StoryView from "@src/components/workspaces/StoryView";

export const metadata: Metadata = {
  title: "Overview",
  description: `${profile.role}. Experience, projects and skills at a glance.`,
};

const primaryButton =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-mocha-mauve px-4 text-sm font-semibold text-mocha-crust transition hover:bg-mocha-mauve/90 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mocha-mauve";
const secondaryButton =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-mocha-surface0 px-4 text-sm font-medium text-mocha-text transition hover:bg-mocha-surface1 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mocha-mauve";
const iconButton =
  "grid size-10 place-items-center rounded-lg bg-mocha-surface0 text-mocha-text transition hover:bg-mocha-surface1 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mocha-mauve";

/** A window as it appears in the overview: traffic lights, a title, content. */
const Win = ({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) => (
  <div
    className={`flex flex-col overflow-clip rounded-2xl border border-white/10 bg-mocha-base/90 shadow-[0_20px_50px_-20px_rgb(17_17_27/0.9)] backdrop-blur-xl ${className}`}
  >
    <div className="flex h-9 shrink-0 items-center gap-3 border-b border-white/5 px-3.5">
      <span aria-hidden className="flex gap-1.5">
        <span className="size-2.5 rounded-full bg-mocha-red/80" />
        <span className="size-2.5 rounded-full bg-mocha-yellow/80" />
        <span className="size-2.5 rounded-full bg-mocha-green/80" />
      </span>
      <span className="truncate text-xs font-medium text-mocha-overlay2">{title}</span>
    </div>
    <div className="flex flex-1 flex-col p-5">{children}</div>
  </div>
);

const Tag = ({ children }: { children: ReactNode }) => (
  <span className="rounded-md bg-mocha-surface0 px-2 py-0.5 text-xs font-medium text-mocha-subtext1">{children}</span>
);



/* ---------- Workspace 1: Me ---------- */

const Me = () => (
  <div className="grid gap-5 lg:h-full lg:grid-cols-[1.5fr_1fr]">
    <Win title="About Me">
      <div className="flex flex-1 flex-col justify-between gap-8 md:px-4">
        <div className="flex flex-col gap-5">
          <Monogram size={84} />
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-mocha-text md:text-6xl">{profile.name}</h1>
            <p className="mt-2 text-xl text-mocha-mauve">{profile.role}</p>
          </div>
          <p className="max-w-[58ch] text-base leading-relaxed text-mocha-subtext1 md:text-lg">{profile.summary}</p>
        </div>
        <div className="flex flex-col gap-4">
          <p className="inline-flex items-center gap-1.5 text-sm text-mocha-subtext0">
            <PiMapPinBold className="size-4" aria-hidden />
            {profile.location}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <a href={profile.resumeUrl} download="Tushar-Chavan-Resume.pdf" className={primaryButton}>
              <PiDownloadSimpleBold className="size-4" aria-hidden />
              Resume
            </a>
            <a href={`mailto:${profile.contact.email}`} className={secondaryButton}>
              <PiEnvelopeSimpleBold className="size-4" aria-hidden />
              Email me
            </a>
            <a href={profile.contact.linkedin} target="_blank" rel="noopener noreferrer" className={iconButton} aria-label="LinkedIn">
              <PiLinkedinLogoBold className="size-4.5" aria-hidden />
            </a>
            <a href={profile.contact.github} target="_blank" rel="noopener noreferrer" className={iconButton} aria-label="GitHub">
              <PiGithubLogoBold className="size-4.5" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </Win>

    <div className="flex flex-col gap-5">
      <Win title="Desktop">
        <DesktopLink className="group flex flex-col gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-mocha-mauve">
          <span className="relative block aspect-[16/10] overflow-hidden rounded-lg border border-white/10">
            <Image
              src="/images/desktop-preview.png"
              alt="The desktop version of this portfolio"
              fill
              sizes="(min-width: 1024px) 26rem, 88vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-mocha-text">
            Also runs as a Linux desktop
            <PiArrowUpRightBold className="size-3.5 text-mocha-mauve" aria-hidden />
          </span>
        </DesktopLink>
      </Win>
      <Win title="Now" className="lg:flex-1">
        <div className="flex flex-1 flex-col justify-between gap-6">
          <div>
            <p className="text-sm text-mocha-subtext0">Currently</p>
            <p className="mt-1 text-xl font-semibold tracking-tight text-mocha-text">{experience[0].role}</p>
            <p className="text-mocha-mauve">{experience[0].company}</p>
            <p className="mt-1 text-sm text-mocha-overlay2 tabular-nums">Since {experience[0].start}</p>
          </div>
          <dl className="grid grid-cols-3 gap-3 border-t border-white/5 pt-5">
            {[
              { value: profile.yearsOfExperience, label: "years" },
              { value: String(projects.length), label: "projects" },
              { value: String(experience.length), label: "companies" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block text-3xl font-semibold tracking-tight text-mocha-text tabular-nums">{stat.value}</span>
                  <span className="text-sm text-mocha-subtext0">{stat.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Win>
    </div>
  </div>
);

/* ---------- Workspace 2: Work ---------- */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const NOW = new Date();
/** "Mar 2023" -> 2023.17; "Present" -> now. */
const toYear = (label: string) => {
  if (label === "Present") return NOW.getFullYear() + NOW.getMonth() / 12;
  const [mon, year] = label.split(" ");
  return Number(year) + Math.max(0, MONTHS.indexOf(mon)) / 12;
};

const TIMELINE_START = 2018;
const TIMELINE_END = NOW.getFullYear() + 1;
const pct = (year: number) => ((year - TIMELINE_START) / (TIMELINE_END - TIMELINE_START)) * 100;

const lanes = [
  {
    label: "Work",
    bar: "bg-mocha-mauve text-mocha-crust",
    items: experience.map((j) => ({ id: j.id, label: j.company, sub: j.role, start: j.start, end: j.end })),
  },
  {
    label: "Study",
    bar: "bg-mocha-blue text-mocha-crust",
    items: education.map((e) => ({ id: e.id, label: e.short, sub: e.school, start: e.start, end: e.end })),
  },
].map((lane) => ({ ...lane, items: [...lane.items].sort((a, b) => toYear(a.start) - toYear(b.start)) }));

/** Career drawn to scale on a year axis. Short bars put their label on whichever side has room. */
const Timeline = () => {
  const years = Array.from({ length: TIMELINE_END - TIMELINE_START + 1 }, (_, i) => TIMELINE_START + i);
  return (
    <div className="flex flex-col gap-3" role="img" aria-label="Career timeline from 2018 to today">
      {lanes.map((lane) => (
        <div key={lane.label} className="grid grid-cols-[3.5rem_1fr] items-center gap-3">
          <span className="text-xs font-medium text-mocha-overlay2">{lane.label}</span>
          <div className="relative h-9 rounded-lg bg-mocha-crust/60">
            {lane.items.map((item, i) => {
              const left = pct(toYear(item.start));
              const right = pct(toYear(item.end));
              const width = Math.max(1.2, right - left);
              const narrow = width < 14;
              const next = lane.items[i + 1];
              const roomRight = (next ? pct(toYear(next.start)) : 100) - right;
              const labelRight = roomRight > 20;
              return (
                <Fragment key={item.id}>
                  <span
                    className={`absolute inset-y-1 flex items-center overflow-hidden rounded-md px-2 text-xs font-semibold ${lane.bar}`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    title={`${item.label}, ${item.sub}: ${item.start} - ${item.end}`}
                  >
                    {!narrow && <span className="truncate">{item.label}</span>}
                  </span>
                  {narrow && (
                    <span
                      className="absolute top-1/2 -translate-y-1/2 text-xs font-medium whitespace-nowrap text-mocha-text"
                      style={labelRight ? { left: `calc(${right}% + 0.5rem)` } : { right: `calc(${100 - left}% + 0.5rem)` }}
                    >
                      {item.label}
                    </span>
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>
      ))}
      <div className="grid grid-cols-[3.5rem_1fr] gap-3">
        <span />
        <div className="relative h-4 text-[11px] text-mocha-overlay1 tabular-nums">
          {years.map((y) => (
            <span key={y} className="absolute -translate-x-1/2" style={{ left: `${pct(y)}%` }}>
              {y}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const Work = () => {
  const [current, ...earlier] = experience;
  return (
    <div className="grid gap-5 lg:h-full lg:grid-cols-[1.45fr_1fr] lg:grid-rows-[1fr_auto]">
      <Win title={current.company}>
        <div className="flex flex-1 flex-col gap-6 md:px-2">
          <div>
            <p className="text-sm text-mocha-overlay2 tabular-nums">
              {current.start} - {current.end}, {current.location}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-mocha-text">{current.company}</h2>
            <p className="mt-1 text-lg text-mocha-mauve">{current.role}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {current.keywords.map((k) => (
                <Tag key={k}>{k}</Tag>
              ))}
            </div>
          </div>
          <ul className="flex flex-1 flex-col justify-evenly gap-3 border-t border-white/5 pt-5">
            {current.highlights.slice(0, 4).map((h) => (
              <li key={h} className="flex gap-2.5 text-sm leading-relaxed text-mocha-subtext1">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-mocha-mauve" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      </Win>

      <div className="flex flex-col gap-5">
        {earlier.map((job) => (
          <Win key={job.id} title={job.company}>
            <p className="text-sm text-mocha-overlay2 tabular-nums">
              {job.start} - {job.end}, {job.location}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-mocha-text">{job.company}</h2>
            <p className="text-mocha-mauve">{job.role}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {job.keywords.map((k) => (
                <Tag key={k}>{k}</Tag>
              ))}
            </div>
          </Win>
        ))}
        <Win title="Education" className="lg:flex-1">
          <ul className="flex flex-1 flex-col justify-evenly gap-5">
            {education.map((ed) => (
              <li key={ed.id} className="flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-mocha-blue/15 text-mocha-blue">
                  <PiGraduationCapBold className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-semibold text-mocha-text">{ed.degree}</p>
                  <p className="text-sm text-mocha-subtext1">
                    {ed.school}, {ed.end.slice(-4)}, {ed.grade}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Win>
      </div>

      <Win title="Timeline" className="lg:col-span-2">
        <Timeline />
      </Win>
    </div>
  );
};

/* ---------- Workspace 3: Projects ---------- */

const Projects = () => <ProjectsGrid projects={projects} />;

/* ---------- Workspace 4: Skills ---------- */

type SkillItem = { name: string; logo?: string; Icon?: IconType };

const skillGroups: { title: string; items: SkillItem[] }[] = [
  {
    title: "Frontend",
    items: [
      { name: "Next.js", logo: "nextdotjs" },
      { name: "React", logo: "react" },
      { name: "TypeScript", logo: "typescript" },
      { name: "JavaScript", logo: "javascript" },
      { name: "Vue.js", logo: "vuedotjs" },
      { name: "Tailwind", logo: "tailwindcss" },
      { name: "Redux", logo: "redux" },
    ],
  },
  {
    title: "Backend",
    items: [
      { name: "Node.js", logo: "nodedotjs" },
      { name: "Express", logo: "express" },
      { name: "Bun", logo: "bun" },
      { name: "GraphQL", logo: "graphql" },
      { name: "Socket.IO", logo: "socketdotio" },
      { name: "Kafka", logo: "apachekafka" },
      { name: "Python", logo: "python" },
      { name: "Go", logo: "go" },
    ],
  },
  {
    title: "Databases & CMS",
    items: [
      { name: "PostgreSQL", logo: "postgresql" },
      { name: "MySQL", logo: "mysql" },
      { name: "MongoDB", logo: "mongodb" },
      { name: "Strapi", logo: "strapi" },
      { name: "TypeORM", Icon: PiDatabaseBold },
      { name: "Mongoose", Icon: PiLeafBold },
    ],
  },
  {
    title: "Cloud, DevOps & AI",
    items: [
      { name: "AWS", Icon: PiAmazonLogoBold },
      { name: "Docker", logo: "docker" },
      { name: "Nginx", logo: "nginx" },
      { name: "Cloudflare", logo: "cloudflare" },
      { name: "Firebase", logo: "firebase" },
      { name: "PM2", Icon: PiGearSixBold },
      { name: "CI/CD", Icon: PiArrowsClockwiseBold },
      { name: "OpenAI", Icon: PiOpenAiLogoBold },
    ],
  },
  {
    title: "Tools",
    items: [
      { name: "Git", logo: "git" },
      { name: "Linux", logo: "linux" },
      { name: "Postman", logo: "postman" },
      { name: "Bitbucket", logo: "bitbucket" },
      { name: "Google Cloud", logo: "googlecloud" },
      { name: "Puppeteer", logo: "puppeteer" },
    ],
  },
];

/** Every logo-backed skill, in brand colour, for the globe. */
const cloudIcons = skillGroups.flatMap((g) => g.items.filter((i) => i.logo).map((i) => ({ name: i.name, src: `/stack/color/${i.logo}.svg` })));

/** One tool as a compact pill: logo + name. Pills wrap to fit any card width, so nothing overflows. */
const SkillPill = ({ name, logo, Icon }: SkillItem) => (
  <li className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-mocha-crust/60 py-1.5 pr-3 pl-2 text-sm font-medium text-mocha-text transition-colors hover:border-mocha-mauve/30 hover:bg-mocha-crust">
    {logo ? (
      <img src={`/stack/color/${logo}.svg`} alt="" width={18} height={18} className="size-4.5" />
    ) : Icon ? (
      <Icon className="size-4.5 text-mocha-text" aria-hidden />
    ) : null}
    {name}
  </li>
);

const skillBlurb: Record<string, string> = {
  Frontend: "Interfaces, state and styling",
  Backend: "APIs, services and messaging",
  "Databases & CMS": "Data models and content",
  "Cloud, DevOps & AI": "Infrastructure, delivery and AI features",
  Tools: "Everyday workflow",
};

/** Plain panel (no window chrome): title and blurb at the top, pills anchored to the bottom. */
const SkillPanel = ({ title, items, className = "" }: { title: string; items: SkillItem[]; className?: string }) => (
  <section
    aria-label={title}
    className={`flex flex-col gap-3 rounded-2xl border border-white/10 bg-mocha-base/90 p-4 shadow-[0_20px_50px_-20px_rgb(17_17_27/0.9)] ${className}`}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-mocha-text">{title}</h3>
        <p className="text-sm text-mocha-subtext0">{skillBlurb[title]}</p>
      </div>
      <span className="rounded-md bg-mocha-surface0 px-2 py-0.5 text-xs font-semibold text-mocha-subtext1 tabular-nums">
        {items.length}
      </span>
    </div>
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <SkillPill key={item.name} {...item} />
      ))}
    </ul>
  </section>
);

const group = (title: string) => skillGroups.find((g) => g.title === title)!;

/**
 * Compact bento on a 3x3 grid: the globe is one small tile, and each category
 * spans the width its pill count needs, so every card is about equally full.
 */
const Skills = () => (
  <div className="grid gap-5 md:grid-cols-2 lg:h-full lg:grid-cols-3 lg:grid-rows-[repeat(3,auto)] lg:content-stretch">
    <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-white/10 bg-mocha-base/60 p-4 text-center">
      <div className="size-36">
        <IconCloud icons={cloudIcons} size={20} />
      </div>
      <p className="text-sm font-semibold text-mocha-text">
        {skillGroups.reduce((n, g) => n + g.items.length, 0)} tools across the stack
      </p>
      <p className="text-xs text-mocha-overlay2">Drag the globe to spin it.</p>
    </div>
    <SkillPanel {...group("Frontend")} className="lg:col-span-2" />
    <SkillPanel {...group("Backend")} className="lg:col-span-2" />
    <SkillPanel {...group("Databases & CMS")} />
    <SkillPanel {...group("Cloud, DevOps & AI")} className="lg:col-span-2" />
    <SkillPanel {...group("Tools")} />
  </div>
);

/* ---------- Workspace 5: Contact ---------- */

const channels = [
  { icon: PiEnvelopeSimpleBold, label: "Email", value: profile.contact.email, href: `mailto:${profile.contact.email}`, copy: true },
  { icon: PiPhoneBold, label: "Phone", value: profile.contact.phone, href: profile.contact.phoneHref, copy: true },
  { icon: PiLinkedinLogoBold, label: "LinkedIn", value: "tushar-chavan", href: profile.contact.linkedin },
  { icon: PiGithubLogoBold, label: "GitHub", value: profile.contact.githubUser, href: profile.contact.github },
  { icon: PiMediumLogoBold, label: "Blog", value: "medium.com/@tushar_chavan", href: profile.contact.blog },
];

const Contact = () => (
  <div className="grid gap-5 lg:h-full lg:grid-cols-[1fr_1.25fr]">
    <Win title="Contact">
      <div className="flex flex-1 flex-col gap-5">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-mocha-text">Let&apos;s talk</h2>
          <p className="mt-2 text-mocha-subtext1">Email is the fastest way to reach me.</p>
        </div>
        <ul className="flex flex-col gap-2">
          {channels.map(({ icon: Icon, label, value, href, copy }) => {
            const external = href.startsWith("http");
            return (
              <li key={label} className="flex items-center gap-3 rounded-xl bg-mocha-crust/50 py-1.5 pr-1.5 pl-3">
                <Icon className="size-5 shrink-0 text-mocha-mauve" aria-hidden />
                <a
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="min-w-0 flex-1 rounded focus-visible:outline-2 focus-visible:outline-mocha-mauve"
                >
                  <span className="block text-xs text-mocha-overlay2">{label}</span>
                  <span className="block truncate text-sm font-medium text-mocha-text hover:underline underline-offset-4">{value}</span>
                </a>
                {copy && <CopyButton value={value} label={label.toLowerCase()} />}
              </li>
            );
          })}
        </ul>
        <a href={profile.resumeUrl} download="Tushar-Chavan-Resume.pdf" className={`${secondaryButton} mt-auto self-start`}>
          <PiDownloadSimpleBold className="size-4" aria-hidden />
          Download resume
        </a>
      </div>
    </Win>
    <Win title="New message">
      <h2 className="text-xl font-semibold tracking-tight text-mocha-text">Write a message</h2>
      <p className="mt-1 text-sm text-mocha-subtext0">It reaches me instantly. I reply by email.</p>
      <ContactForm messageRows={6} className="mt-5 flex-1" source="Simple view" />
    </Win>
  </div>
);

const workspaces: Workspace[] = [
  { id: "me", label: "Me", icon: <PiUserBold />, tint: "rgb(203 166 247 / 0.20)", content: <Me /> },
  { id: "work", label: "Work", icon: <PiBriefcaseBold />, tint: "rgb(137 180 250 / 0.18)", content: <Work /> },
  { id: "projects", label: "Projects", icon: <PiFolderOpenBold />, tint: "rgb(148 226 213 / 0.15)", content: <Projects /> },
  { id: "skills", label: "Skills", icon: <PiSquaresFourBold />, tint: "rgb(250 179 135 / 0.15)", content: <Skills /> },
  { id: "contact", label: "Contact", icon: <PiAddressBookBold />, tint: "rgb(245 194 231 / 0.16)", content: <Contact /> },
];

/**
 * The overview keeps one layout from laptop to large desktop and scales it
 * instead: from tablet width up, the root font size follows the viewport (13px
 * to 16px) and every rem-based size scales with it. Phones keep 16px.
 * Scoped to this route only.
 */
const fluidRootSize = `@media (min-width: 768px){html{font-size:clamp(13px, min(calc(8px + 0.42vw), calc(4px + 1.25vh)), 16px)}}`;

export default function OverviewPage() {
  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-mocha-crust">
      <style>{fluidRootSize}</style>
      {/* Own background (not the desktop wallpaper): soft Catppuccin glows over a faint dot texture */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 45% at 12% 0%, rgb(203 166 247 / 0.16), transparent 70%), radial-gradient(45% 45% at 92% 100%, rgb(116 199 236 / 0.12), transparent 70%), radial-gradient(35% 30% at 70% 10%, rgb(245 194 231 / 0.07), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)]"
        style={{ backgroundImage: "radial-gradient(rgb(205 214 244 / 0.07) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      />

      <header className="relative flex h-16 shrink-0 items-center justify-between gap-4 px-4 sm:px-6">
        <p className="flex items-center gap-2.5 text-sm">
          <Monogram size={24} />
          <span className="font-semibold text-mocha-text">{profile.name}</span>
          <span className="hidden text-mocha-overlay2 sm:inline">{profile.role}</span>
        </p>
        <div className="flex items-center gap-1.5">
          <DesktopLink className="hidden h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-mocha-subtext1 transition hover:bg-white/10 hover:text-mocha-text focus-visible:outline-2 focus-visible:outline-mocha-mauve sm:inline-flex">
            <PiMonitorBold className="size-4" aria-hidden />
            Desktop
          </DesktopLink>
          <a
            href={profile.resumeUrl}
            download="Tushar-Chavan-Resume.pdf"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-mocha-mauve px-3.5 text-sm font-semibold text-mocha-crust transition hover:bg-mocha-mauve/90 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mocha-mauve"
          >
            <PiDownloadSimpleBold className="size-4" aria-hidden />
            Resume
          </a>
        </div>
      </header>

      <main className="relative flex min-h-0 flex-1 flex-col">
        {/* Tablet and up: the workspace overview. Phones: full-screen stories. */}
        <div className="hidden min-h-0 flex-1 flex-col md:flex">
          <Workspaces workspaces={workspaces} />
        </div>
        <div className="flex min-h-0 flex-1 flex-col md:hidden">
          <StoryView workspaces={workspaces} />
        </div>
      </main>
    </div>
  );
}
