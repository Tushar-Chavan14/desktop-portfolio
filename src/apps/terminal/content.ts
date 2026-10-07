// Generates the virtual file system from portfolio data. Nothing about the
// owner is hardcoded here: every fact comes from @src/data/profile.

import { education, experience, profile, projects, skills, tools } from "@src/data/profile";
import { dir, file, type DirNode } from "./fs";

export const HOME = `/home/${profile.username}`;

export function aboutDoc(): string {
  return [
    `# ${profile.name}`,
    `${profile.role}, ${profile.location}`,
    "",
    profile.summary,
    "",
    "## At a glance",
    `- Role: ${profile.role}`,
    `- Location: ${profile.location}`,
    `- Experience: ${profile.yearsOfExperience} years`,
    `- Currently: ${experience[0] ? `${experience[0].role} at ${experience[0].company}` : "Open to work"}`,
    "",
    "## More",
    "- cat skills.md, cat contact.md, ls projects",
  ].join("\n");
}

export function skillsDoc(): string {
  const out = ["# Skills", ""];
  for (const group of skills) {
    out.push(`## ${group.label}`, group.items.join(", "), "");
  }
  out.push("## Tools", tools.join(", "));
  return out.join("\n");
}

export function contactDoc(): string {
  const c = profile.contact;
  return [
    "# Contact",
    "",
    `Email: ${c.email}`,
    `Phone: ${c.phone}`,
    `LinkedIn: ${c.linkedin}`,
    `GitHub: ${c.github}`,
    `Blog: ${c.blog}`,
    "",
    "Run email to write to me, or open contact for the Contact app.",
  ].join("\n");
}

export function educationDoc(): string {
  const out = ["# Education", ""];
  for (const e of education) {
    out.push(`## ${e.degree} (${e.short})`, `School: ${e.school}, ${e.location}`);
    out.push(`Dates: ${e.start} - ${e.end}`, `Grade: ${e.grade}`, "");
  }
  return out.join("\n").trimEnd();
}

export function projectDoc(slug: string): string {
  const p = projects.find((x) => x.slug === slug);
  if (!p) return "";
  const out = [`# ${p.name}`, p.tagline, "", `Type: ${p.kind}`, `Stack: ${p.stack.join(", ")}`];
  if (p.url) out.push(`Live: ${p.url}`);
  out.push("", "## Highlights", ...p.highlights.map((h) => `- ${h}`));
  return out.join("\n");
}

export function experienceDoc(id: string): string {
  const e = experience.find((x) => x.id === id);
  if (!e) return "";
  return [
    `# ${e.role}`,
    `${e.company}, ${e.location}`,
    `Dates: ${e.start} - ${e.end}`,
    "",
    "## What I did",
    ...e.highlights.map((h) => `- ${h}`),
  ].join("\n");
}

function bashrc(): string {
  return [
    "# ~/.bashrc",
    "# This shell is fish, but old habits die hard.",
    "",
    "export EDITOR=nvim",
    `export PATH="$HOME/.local/bin:$PATH"`,
    "",
    "alias ll='ls -l'",
    "alias la='ls -a'",
    "alias gs='git status'",
    "",
    "# Fetch on login",
    "neofetch",
  ].join("\n");
}

function osRelease(): string {
  return [
    `NAME="Fedora Linux"`,
    `VERSION="42 (Portfolio Edition)"`,
    "ID=fedora",
    "VERSION_ID=42",
    `PRETTY_NAME="Fedora Linux 42 (Portfolio Edition)"`,
    `HOME_URL="${profile.sourceRepo}"`,
    `BUG_REPORT_URL="${profile.sourceRepo}/issues"`,
  ].join("\n");
}

function bootLog(now: Date): string {
  const stamp = now.toISOString().replace("T", " ").slice(0, 19);
  return [
    `${stamp} systemd[1]: Starting portfolio.service...`,
    `${stamp} kernel: Loaded ${projects.length} projects, ${experience.length} roles`,
    `${stamp} kernel: Loaded ${skills.reduce((n, g) => n + g.items.length, 0)} skills in ${skills.length} groups`,
    `${stamp} systemd[1]: Started portfolio.service.`,
    `${stamp} fish[1337]: Welcome, visitor`,
  ].join("\n");
}

/** Build a fresh file system tree. `binaries` populates /usr/bin. */
export function buildFs(now: Date, binaries: string[]): DirNode {
  const lock = { locked: true } as const;
  const root = { locked: true, owner: "root" } as const;

  const projectFiles: DirNode["children"] = {};
  for (const p of projects) {
    projectFiles[`${p.slug}.md`] = file(projectDoc(p.slug), {
      ...lock,
      open: { kind: "app", appId: "projects", props: { projectId: p.id } },
    });
  }
  const experienceFiles: DirNode["children"] = {};
  for (const e of experience) {
    experienceFiles[`${e.id}.md`] = file(experienceDoc(e.id), {
      ...lock,
      open: { kind: "app", appId: "projects" },
    });
  }
  const bin: DirNode["children"] = {};
  for (const name of binaries) bin[name] = file("", { ...root, binary: true });

  return dir(
    {
      home: dir(
        {
          [profile.username]: dir(
            {
              "about.md": file(aboutDoc(), { ...lock, open: { kind: "app", appId: "about" } }),
              "skills.md": file(skillsDoc(), { ...lock, open: { kind: "app", appId: "about" } }),
              "contact.md": file(contactDoc(), { ...lock, open: { kind: "app", appId: "contact" } }),
              "education.md": file(educationDoc(), {
                ...lock,
                open: { kind: "app", appId: "about" },
              }),
              "resume.pdf": file("", { ...lock, binary: true, open: { kind: "app", appId: "resume" } }),
              projects: dir(projectFiles, lock),
              experience: dir(experienceFiles, lock),
              ".bashrc": file(bashrc(), lock),
            },
            lock
          ),
        },
        root
      ),
      etc: dir(
        {
          "os-release": file(osRelease(), root),
          hostname: file(profile.hostname, root),
          shells: file("/bin/bash\n/usr/bin/fish", root),
        },
        root
      ),
      usr: dir({ bin: dir(bin, root), share: dir({}, root) }, root),
      var: dir({ log: dir({ "portfolio.log": file(bootLog(now), root) }, root) }, root),
      tmp: dir({}, root),
    },
    root
  );
}
