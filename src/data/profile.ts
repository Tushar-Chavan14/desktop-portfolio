// Single source of truth for portfolio content. Every app (About, Projects,
// Terminal, Contact, mobile launcher) renders from this file.

export const profile = {
  name: "Tushar Chavan",
  firstName: "Tushar",
  username: "tushar",
  hostname: "fedora",
  role: "Full Stack Web Developer",
  location: "Panchkula, Haryana, India",
  yearsOfExperience: "3+",
  summary:
    "Full stack web developer with 3+ years of experience designing and delivering microservices architectures and production web applications for GCC-region clients. I own projects end to end: system design, REST and GraphQL APIs, AWS infrastructure, CI/CD pipelines and frontend UX.",
  shortBio:
    "I build microservices backends and Next.js frontends for clients across the GCC.",
  contact: {
    email: "tusharchavan166@gmail.com",
    phone: "+91-7975225456",
    phoneHref: "tel:+917975225456",
    linkedin: "https://www.linkedin.com/in/tushar-chavan-4b09a7221/",
    github: "https://github.com/Tushar-Chavan14",
    githubUser: "Tushar-Chavan14",
    blog: "https://medium.com/@tushar_chavan",
  },
  resumeUrl: "/resume/tushar-chavan-resume.pdf",
  sourceRepo: "https://github.com/Tushar-Chavan14/desktop-portfolio",
} as const;

export interface SkillGroup {
  id: string;
  label: string;
  items: string[];
}

export const skills: SkillGroup[] = [
  {
    id: "languages",
    label: "Languages",
    items: ["JavaScript (ES2022+)", "TypeScript", "Python", "Go", "SQL", "HTML / CSS"],
  },
  {
    id: "frontend",
    label: "Frontend",
    items: ["Next.js", "React", "Vue.js", "Tailwind CSS", "Framer Motion", "HeroUI"],
  },
  {
    id: "state",
    label: "State management",
    items: ["Redux Toolkit + Saga", "Zustand", "Pinia", "React Context"],
  },
  {
    id: "backend",
    label: "Backend",
    items: ["Node.js", "Express.js", "Bun", "GraphQL", "REST APIs", "Socket.IO", "Kafka"],
  },
  {
    id: "data",
    label: "Databases & ORM",
    items: ["PostgreSQL", "MySQL", "MongoDB", "TypeORM", "Mongoose", "Strapi CMS"],
  },
  {
    id: "devops",
    label: "Cloud & DevOps",
    items: [
      "AWS (S3, EC2, Lambda)",
      "Amplify",
      "CodeDeploy",
      "Docker",
      "Nginx",
      "PM2",
      "Certbot",
      "Bitbucket CI/CD",
      "Cloudflare",
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    items: ["OpenAI GPT-4", "Firebase (FCM, Admin)", "Puppeteer", "Nodemailer"],
  },
];

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  start: string;
  end: string;
  highlights: string[];
}

export const experience: Experience[] = [
  {
    id: "silverfern",
    company: "Silverfern Digital",
    role: "Full-Stack Web Developer",
    location: "Panchkula, Haryana, India",
    start: "Mar 2023",
    end: "Present",
    highlights: [
      "Architected microservices systems for GCC-region clients with Express.js, TypeORM, PostgreSQL and Kafka for event-driven communication.",
      "Built Next.js production apps with Strapi CMS, multi-language i18n routing and server-side rendering across 25+ dynamic pages.",
      "Ran cloud infrastructure on AWS: S3, EC2, Lambda, Amplify, CodeDeploy, IAM and SSM.",
      "Owned the DevOps lifecycle: Bitbucket CI/CD, Nginx reverse proxy, SSL via Certbot and PM2-supervised deployments.",
      "Implemented GraphQL APIs with custom schemas, mutations and resolvers; containerised environments with Docker.",
      "Built Vue.js frontends with Pinia and contributed to an e-learning platform on Strapi CMS.",
      "Reviewed code and mentored teammates on standards and best practices.",
    ],
  },
  {
    id: "shivila",
    company: "Shivila Technologies",
    role: "React Developer",
    location: "Kolkata, India",
    start: "Dec 2021",
    end: "Apr 2022",
    highlights: [
      "Delivered UI components across three client projects with React.js and Material-UI.",
      "Implemented Redux for global state and React Router for navigation.",
      "Reviewed code and onboarded teammates on Linux CLI fundamentals.",
    ],
  },
];

export interface Project {
  id: string;
  /** File-system friendly slug used by the terminal and Files app. */
  slug: string;
  name: string;
  tagline: string;
  stack: string[];
  highlights: string[];
  url?: string;
  /** Short category used as the Files app grouping. */
  kind: "Commerce" | "Platform" | "AI" | "Dashboard";
}

export const projects: Project[] = [
  {
    id: "winasa",
    slug: "winasa",
    name: "Winasa",
    tagline: "E-commerce and social commerce platform",
    kind: "Commerce",
    url: "https://winasa.com/",
    stack: ["Next.js", "Express.js", "TypeORM", "PostgreSQL", "AWS S3", "Firebase", "Socket.IO"],
    highlights: [
      "Engineered a 7-service microservices platform: auth, products, payments, delivery, notifications, CMS and frontend.",
      "Built the Next.js admin and vendor dashboard with role-based access, real-time Socket.IO updates and Chart.js analytics.",
      "Integrated a GCC payment gateway for multi-currency transactions and Firebase push notifications.",
    ],
  },
  {
    id: "sona",
    slug: "sona",
    name: "Sona",
    tagline: "Multi-vendor marketplace",
    kind: "Commerce",
    url: "https://sonaa.me/en/landing",
    stack: ["Next.js", "React", "Express.js", "TypeORM", "PostgreSQL", "AWS S3", "Socket.IO"],
    highlights: [
      "Architected 5 independent microservices with PostgreSQL, TypeORM migrations and Docker.",
      "Built Seller, Admin and Customer dashboards with JWT + Google OAuth and granular API-level RBAC.",
      "Integrated a UAE payment gateway with webhook handling and S3 presigned-URL media storage.",
    ],
  },
  {
    id: "edc",
    slug: "edc-website",
    name: "Emirates Driving Company",
    tagline: "Multilingual corporate website",
    kind: "Platform",
    stack: ["Next.js", "TypeScript", "Strapi CMS", "MySQL", "Framer Motion"],
    highlights: [
      "Built 25+ server-rendered pages with the Next.js App Router, server components and server actions.",
      "Delivered Arabic and English via Strapi i18n with per-locale Next.js routing.",
      "Hardened the platform with rate limiting, SVG XSS validation middleware and token blacklisting.",
    ],
  },
  {
    id: "al-noor",
    slug: "al-noor-dashboard",
    name: "Al-Noor Admin Dashboard",
    tagline: "Education management SPA",
    kind: "Dashboard",
    stack: ["React", "TypeScript", "Redux Toolkit + Saga", "HeroUI", "Tailwind CSS", "react-intl"],
    highlights: [
      "Built an education SPA managing IEP workflows, TDA/SCIP processes, attendance, student records and goal tracking.",
      "Implemented Redux Toolkit + Redux Saga across 10+ feature slices for async state and API orchestration.",
      "Designed RBAC for HOD and Students-Affairs-Secretary roles with route guards and permission-gated components.",
    ],
  },
  {
    id: "tmkeen",
    slug: "tmkeen",
    name: "Tmkeen",
    tagline: "AI-powered expense management",
    kind: "AI",
    stack: ["Express.js", "Kafka", "React", "MySQL", "OpenAI GPT-4", "Microservices"],
    highlights: [
      "Used GPT-4 for spending analysis, personalised saving tips and automated PDF profit and loss reports.",
      "Led the backend: authentication, financial calculations, budget-vs-actual tracking and Kafka event streaming.",
    ],
  },
  {
    id: "recook",
    slug: "recook",
    name: "Recook",
    tagline: "AI recipe generator",
    kind: "AI",
    stack: ["Express.js", "Kafka", "React", "MySQL", "Puppeteer", "OpenAI GPT-4"],
    highlights: [
      "Built an extraction pipeline that turns YouTube and web URLs into structured recipes with nutritional data, using Puppeteer scraping and GPT-4.",
    ],
  },
  {
    id: "dyp",
    slug: "dubai-young-professionals",
    name: "Dubai Young Professionals",
    tagline: "Professional networking platform",
    kind: "Platform",
    url: "https://www.ypclub.com/",
    stack: ["Express.js", "Kafka", "MySQL", "Microservices"],
    highlights: [
      "Built auth, mutual connections, event management and invoice generation for a UAE networking platform.",
      "Developed Kafka consumer and producer webhooks for transactional email; managed dev and prod deployments.",
    ],
  },
  {
    id: "e-learning",
    slug: "e-learning-platform",
    name: "E-Learning Platform & Draft Portal",
    tagline: "Trade finance education",
    kind: "Platform",
    url: "https://academiastudios.com/",
    stack: ["Vue.js", "Pinia", "Strapi CMS", "MySQL", "Express.js", "MongoDB"],
    highlights: [
      "Led the backend of a trade finance education platform on Strapi CMS for user records and media.",
      "Built a document generator producing SBLC, BG and DLC financial drafts in DOCX and PDF for banking professionals.",
    ],
  },
];

export interface Education {
  id: string;
  degree: string;
  short: string;
  school: string;
  location: string;
  start: string;
  end: string;
  grade: string;
}

export const education: Education[] = [
  {
    id: "mca",
    degree: "Master of Computer Applications",
    short: "MCA",
    school: "University of Mysore",
    location: "Mysore, Karnataka",
    start: "Dec 2021",
    end: "Sep 2023",
    grade: "CGPA 7.1",
  },
  {
    id: "bca",
    degree: "Bachelor of Computer Applications",
    short: "BCA",
    school: "Sharnbasva University",
    location: "Kalaburagi, Karnataka",
    start: "Jul 2018",
    end: "Oct 2021",
    grade: "CGPA 8.0",
  },
];

export const tools = [
  "Git",
  "Kafka",
  "Docker",
  "Nginx",
  "Linux",
  "AWS",
  "Firebase",
  "OpenAI GPT-4",
  "Cloudflare",
  "PM2",
  "Bitbucket CI/CD",
  "Postman",
  "Google Cloud",
];
