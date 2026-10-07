import { experience, profile, projects, skills } from "@src/data/profile";

/**
 * Server-rendered plain summary of the portfolio. The desktop itself renders
 * client-side, so this gives search engines and screen-reader users the same
 * content without needing to drive the windowed UI.
 */
export default function PortfolioSummary() {
  return (
    <article className="sr-only">
      <h1>
        {profile.name}, {profile.role}
      </h1>
      <p>{profile.summary}</p>
      <h2>Experience</h2>
      <ul>
        {experience.map((job) => (
          <li key={job.id}>
            {job.role} at {job.company}, {job.start} to {job.end}
          </li>
        ))}
      </ul>
      <h2>Projects</h2>
      <ul>
        {projects.map((p) => (
          <li key={p.id}>
            {p.url ? <a href={p.url}>{p.name}</a> : p.name}: {p.tagline}. Built with {p.stack.join(", ")}.
          </li>
        ))}
      </ul>
      <h2>Skills</h2>
      <p>{skills.flatMap((g) => g.items).join(", ")}</p>
      <h2>Contact</h2>
      <ul>
        <li>
          <a href={`mailto:${profile.contact.email}`}>{profile.contact.email}</a>
        </li>
        <li>
          <a href={profile.contact.linkedin}>LinkedIn</a>
        </li>
        <li>
          <a href={profile.contact.github}>GitHub</a>
        </li>
        <li>
          <a href={profile.resumeUrl}>Resume (PDF)</a>
        </li>
      </ul>
    </article>
  );
}
