import type { Metadata } from "next";
import {
  PiArrowRightBold,
  PiArrowUpRightBold,
  PiDownloadSimpleBold,
  PiEnvelopeSimpleBold,
  PiGithubLogoBold,
  PiGraduationCapBold,
  PiLinkedinLogoBold,
  PiMediumLogoBold,
  PiPhoneBold,
} from "react-icons/pi";
import { education, experience, profile, projects, skills, type Project } from "@src/data/profile";
import { Monogram, Tag } from "@src/apps/ui";
import { CopyButton, DesktopLink, Reveal } from "@src/components/overview/client";
import { Aurora, HeroCollage, NameReveal, RotatingPhrase } from "@src/components/overview/hero";
import {
  CountUp,
  GlowPanel,
  ReadingProgress,
  ScrollLine,
  SpotlightCard,
  StackMarquee,
  type StackItem,
} from "@src/components/overview/motion";

export const metadata: Metadata = {
  title: "Overview",
  description: `${profile.role}. Experience, projects, skills and contact details on one page.`,
};

const nav = [
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

/** What I build, each phrase taken from real resume work. */
const buildPhrases = [
  "microservices backends",
  "Next.js production apps",
  "real-time dashboards",
  "payment integrations",
  "AI-powered tools",
];

const stack: StackItem[] = [
  ["Next.js", "nextdotjs"],
  ["React", "react"],
  ["TypeScript", "typescript"],
  ["Node.js", "nodedotjs"],
  ["Express", "express"],
  ["GraphQL", "graphql"],
  ["Socket.IO", "socketdotio"],
  ["Kafka", "apachekafka"],
  ["PostgreSQL", "postgresql"],
  ["MySQL", "mysql"],
  ["MongoDB", "mongodb"],
  ["Docker", "docker"],
  ["Nginx", "nginx"],
  ["Cloudflare", "cloudflare"],
  ["Firebase", "firebase"],
  ["Strapi", "strapi"],
  ["Vue.js", "vuedotjs"],
  ["Tailwind CSS", "tailwindcss"],
  ["Redux", "redux"],
  ["Bun", "bun"],
].map(([name, slug]) => ({ name, logo: `/stack/${slug}.svg` }));

// Real figures from the resume: Winasa (7 services) + Sona (5), and EDC's 25+ SSR pages.
const facts = [
  { value: 3, suffix: "+", label: "years shipping production software" },
  { value: projects.length, suffix: "", label: "projects across commerce, AI and platforms" },
  { value: 12, suffix: "", label: "microservices built for Winasa and Sona" },
  { value: 25, suffix: "+", label: "server-rendered pages on a bilingual Next.js site" },
];

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-mocha-mauve px-4 py-2.5 text-sm font-semibold text-mocha-crust shadow-[0_8px_24px_-8px_rgb(203_166_247/0.6)] transition hover:bg-mocha-mauve/90 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mocha-mauve";
const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-mocha-surface0 px-4 py-2.5 text-sm font-medium text-mocha-text transition hover:bg-mocha-surface1 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mocha-mauve";

const featured = projects.filter((p) => p.url);
const others = projects.filter((p) => !p.url);
const hostOf = (url: string) => new URL(url).hostname.replace(/^www\./, "");

const SectionHeading = ({ id, children }: { id: string; children: string }) => (
  <h2 id={id} className="text-3xl font-semibold tracking-tight text-mocha-text md:text-4xl">
    {children}
  </h2>
);

const FeaturedProject = ({ project }: { project: Project }) => (
  <SpotlightCard className="h-full">
    <article className="flex h-full flex-col p-6 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-mocha-text">{project.name}</h3>
          <p className="mt-0.5 text-sm text-mocha-subtext0">{project.tagline}</p>
        </div>
        <span className="shrink-0 rounded-md bg-mocha-mauve/10 px-2 py-0.5 text-xs font-medium text-mocha-mauve">
          {project.kind}
        </span>
      </div>
      <ul className="mt-5 flex flex-col gap-2.5">
        {project.highlights.slice(0, 2).map((h) => (
          <li key={h} className="flex gap-2.5 text-sm leading-relaxed text-mocha-subtext1">
            <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-mocha-mauve/70" />
            {h}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-1.5">
        {project.stack.slice(0, 5).map((s) => (
          <Tag key={s}>{s}</Tag>
        ))}
      </div>
      {project.url && (
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-1.5 self-start pt-6 text-sm font-medium text-mocha-text underline-offset-4 hover:text-mocha-mauve hover:underline"
        >
          {hostOf(project.url)}
          <PiArrowUpRightBold className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </a>
      )}
    </article>
  </SpotlightCard>
);

export default function OverviewPage() {
  return (
    <div className="min-h-dvh overflow-x-clip bg-mocha-crust">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-mocha-mauve focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-mocha-crust"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-white/5 bg-mocha-crust/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#main" className="flex items-center gap-2.5 font-semibold text-mocha-text">
            <Monogram size={28} />
            <span className="hidden sm:inline">{profile.name}</span>
          </a>
          <nav aria-label="Sections" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="rounded-lg px-3 py-1.5 text-sm text-mocha-subtext1 transition hover:bg-mocha-surface0 hover:text-mocha-text"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <DesktopLink className="hidden items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-mocha-subtext1 transition hover:bg-mocha-surface0 hover:text-mocha-text sm:inline-flex" />
            <a href={profile.resumeUrl} download="Tushar-Chavan-Resume.pdf" className={`${primaryButton} py-1.5 shadow-none`}>
              <PiDownloadSimpleBold className="size-4" aria-hidden />
              Resume
            </a>
          </div>
        </div>
        <ReadingProgress />
      </header>

      <main id="main">
        {/* Hero */}
        <section aria-labelledby="hero-title" className="relative isolate">
          <Aurora />
          <div className="mx-auto grid min-h-[calc(100dvh-3.5rem)] max-w-6xl items-center gap-12 px-4 pt-14 pb-16 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:gap-10 lg:pt-10">
            <div>
              <Reveal>
                <p className="inline-flex items-center gap-2 rounded-full border border-mocha-green/20 bg-mocha-green/10 py-1 pr-3 pl-2 text-sm font-medium text-mocha-green">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-mocha-green opacity-60 motion-reduce:animate-none" />
                    <span className="relative inline-flex size-2 rounded-full bg-mocha-green" />
                  </span>
                  Open to new opportunities
                </p>
              </Reveal>
              <div id="hero-title" className="mt-6">
                <NameReveal text={profile.name} />
              </div>
              <Reveal delay={0.5}>
                <p className="mt-6 text-xl leading-snug text-mocha-subtext1 md:text-2xl">
                  {profile.role} building
                  <span className="mt-1 block text-2xl font-medium tracking-tight md:text-3xl">
                    <RotatingPhrase phrases={buildPhrases} />
                  </span>
                  <span className="mt-1 block">for clients across the GCC.</span>
                </p>
              </Reveal>
              <Reveal delay={0.65}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href={`mailto:${profile.contact.email}`} className={primaryButton}>
                    <PiEnvelopeSimpleBold className="size-4" aria-hidden />
                    Email me
                  </a>
                  <a href="#projects" className={secondaryButton}>
                    See projects
                    <PiArrowRightBold className="size-3.5" aria-hidden />
                  </a>
                </div>
              </Reveal>
            </div>

            <HeroCollage />
          </div>
        </section>

        {/* Stack */}
        <section aria-label="Tools I work with" className="border-y border-white/5 bg-mocha-mantle/40 py-6">
          <StackMarquee items={stack} />
        </section>

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Numbers */}
          <section aria-label="At a glance" className="py-20">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
              {facts.map((fact, i) => (
                <Reveal key={fact.label} delay={i * 0.08}>
                  <dt className="sr-only">{fact.label}</dt>
                  <dd>
                    <span className="block text-5xl font-semibold tracking-tighter text-mocha-text md:text-6xl">
                      <CountUp to={fact.value} suffix={fact.suffix} />
                    </span>
                    <span aria-hidden className="mt-2 block max-w-[22ch] text-sm leading-snug text-mocha-subtext0">
                      {fact.label}
                    </span>
                  </dd>
                </Reveal>
              ))}
            </dl>
          </section>

          {/* Experience */}
          <section aria-labelledby="experience" className="scroll-mt-20 pb-24">
            <Reveal>
              <SectionHeading id="experience">Experience</SectionHeading>
            </Reveal>
            <div className="mt-12">
              <ScrollLine>
                <ol className="flex flex-col gap-14">
                  {experience.map((job) => (
                    <li key={job.id} className="relative">
                      <span
                        aria-hidden
                        className="absolute top-1.5 -left-8 size-3 rounded-full border-2 border-mocha-crust bg-mocha-mauve ring-4 ring-mocha-mauve/15 md:-left-10 md:size-4"
                      />
                      <Reveal className="grid gap-3 md:grid-cols-[12rem_1fr] md:gap-10">
                        <div>
                          <p className="text-sm font-medium text-mocha-text tabular-nums">
                            {job.start} - {job.end}
                          </p>
                          <p className="mt-1 text-sm text-mocha-overlay1">{job.location}</p>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold tracking-tight text-mocha-text">
                            {job.role}, <span className="text-mocha-mauve">{job.company}</span>
                          </h3>
                          <ul className="mt-4 flex flex-col gap-2.5">
                            {job.highlights.map((h) => (
                              <li key={h} className="flex max-w-[70ch] gap-3 text-[15px] leading-relaxed text-mocha-subtext1">
                                <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-mocha-overlay0" />
                                {h}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </Reveal>
                    </li>
                  ))}
                </ol>
              </ScrollLine>
            </div>
          </section>

          {/* Projects */}
          <section aria-labelledby="projects" className="scroll-mt-20 border-t border-white/5 py-24">
            <Reveal>
              <SectionHeading id="projects">Projects</SectionHeading>
              <p className="mt-3 max-w-[60ch] text-mocha-subtext1">
                Live products first, followed by client work that isn&apos;t publicly accessible.
              </p>
            </Reveal>

            <ul className="mt-12 grid gap-4 md:grid-cols-2">
              {featured.map((p, i) => (
                <li key={p.id}>
                  <Reveal delay={(i % 2) * 0.08} className="h-full">
                    <FeaturedProject project={p} />
                  </Reveal>
                </li>
              ))}
            </ul>

            <ul className="mt-14 divide-y divide-white/5 border-t border-white/5">
              {others.map((p) => (
                <li key={p.id}>
                  <Reveal className="group grid gap-2 py-7 transition-colors md:grid-cols-[16rem_1fr] md:gap-10">
                    <div>
                      <h3 className="font-semibold text-mocha-text transition-colors group-hover:text-mocha-mauve">{p.name}</h3>
                      <p className="text-sm text-mocha-subtext0">{p.tagline}</p>
                    </div>
                    <div>
                      <p className="max-w-[70ch] text-[15px] leading-relaxed text-mocha-subtext1">{p.highlights[0]}</p>
                      <p className="mt-3 text-sm text-mocha-overlay1">{p.stack.join(", ")}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </section>

          {/* Skills + education */}
          <section aria-labelledby="skills" className="scroll-mt-20 border-t border-white/5 py-24">
            <div className="grid gap-16 lg:grid-cols-[1.5fr_1fr]">
              <div>
                <Reveal>
                  <SectionHeading id="skills">Skills</SectionHeading>
                </Reveal>
                <dl className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
                  {skills.map((group, i) => (
                    <Reveal key={group.id} delay={(i % 2) * 0.06}>
                      <dt className="text-sm font-medium text-mocha-subtext0">{group.label}</dt>
                      <dd className="mt-2.5 flex flex-wrap gap-1.5">
                        {group.items.map((item) => (
                          <Tag key={item}>{item}</Tag>
                        ))}
                      </dd>
                    </Reveal>
                  ))}
                </dl>
              </div>
              <div>
                <Reveal>
                  <h2 className="text-3xl font-semibold tracking-tight text-mocha-text md:text-4xl">Education</h2>
                </Reveal>
                <ul className="mt-10 flex flex-col gap-6">
                  {education.map((ed, i) => (
                    <li key={ed.id}>
                      <Reveal delay={i * 0.08} className="flex gap-4 rounded-2xl bg-mocha-base/60 p-4">
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-mocha-mauve/10 text-mocha-mauve">
                          <PiGraduationCapBold className="size-5" aria-hidden />
                        </span>
                        <div>
                          <p className="font-semibold text-mocha-text">{ed.degree}</p>
                          <p className="text-sm text-mocha-subtext1">
                            {ed.school}, {ed.location}
                          </p>
                          <p className="mt-1 text-sm text-mocha-overlay1 tabular-nums">
                            {ed.start} - {ed.end}, {ed.grade}
                          </p>
                        </div>
                      </Reveal>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section aria-labelledby="contact" className="scroll-mt-20 pb-24">
            <Reveal>
              <GlowPanel>
                <div className="relative overflow-hidden p-6 md:p-12">
                  <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-mocha-mauve/15 blur-3xl" />
                  <SectionHeading id="contact">Let&apos;s work together</SectionHeading>
                  <p className="mt-3 max-w-[50ch] text-lg text-mocha-subtext1">
                    Email is the fastest way to reach me, or download my resume from the top of the page.
                  </p>

                  <div className="mt-8 grid gap-3 md:grid-cols-2">
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-mocha-mantle py-2 pr-2 pl-4">
                      <a href={`mailto:${profile.contact.email}`} className="flex min-w-0 items-center gap-3 text-mocha-text hover:text-mocha-mauve">
                        <PiEnvelopeSimpleBold className="size-5 shrink-0 text-mocha-mauve" aria-hidden />
                        <span className="truncate font-medium">{profile.contact.email}</span>
                      </a>
                      <CopyButton value={profile.contact.email} label="email address" />
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-mocha-mantle py-2 pr-2 pl-4">
                      <a href={profile.contact.phoneHref} className="flex items-center gap-3 text-mocha-text hover:text-mocha-mauve">
                        <PiPhoneBold className="size-5 shrink-0 text-mocha-mauve" aria-hidden />
                        <span className="font-medium tabular-nums">{profile.contact.phone}</span>
                      </a>
                      <CopyButton value={profile.contact.phone} label="phone number" />
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <a href={`mailto:${profile.contact.email}`} className={primaryButton}>
                      <PiEnvelopeSimpleBold className="size-4" aria-hidden />
                      Email me
                    </a>
                    {[
                      { href: profile.contact.linkedin, label: "LinkedIn", Icon: PiLinkedinLogoBold },
                      { href: profile.contact.github, label: "GitHub", Icon: PiGithubLogoBold },
                      { href: profile.contact.blog, label: "Blog", Icon: PiMediumLogoBold },
                    ].map(({ href, label, Icon }) => (
                      <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={secondaryButton}>
                        <Icon className="size-4" aria-hidden />
                        {label}
                      </a>
                    ))}
                  </div>
                </div>
              </GlowPanel>
            </Reveal>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-8 text-sm text-mocha-subtext0 sm:flex-row sm:items-center sm:px-6">
          <p>{profile.name}</p>
          <DesktopLink className="inline-flex items-center gap-2 font-medium text-mocha-text underline-offset-4 hover:underline">
            Try the desktop version
          </DesktopLink>
        </div>
      </footer>
    </div>
  );
}
