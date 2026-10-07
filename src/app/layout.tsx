import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { profile } from "@src/data/profile";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

const description = `${profile.role} with ${profile.yearsOfExperience} years building microservices and Next.js apps. Explore my work through a Linux-style desktop.`;

export const metadata: Metadata = {
  title: {
    default: `${profile.name} | ${profile.role}`,
    template: `%s | ${profile.name}`,
  },
  description,
  authors: [{ name: profile.name, url: profile.contact.linkedin }],
  openGraph: {
    type: "website",
    title: `${profile.name} | ${profile.role}`,
    description,
  },
  twitter: {
    card: "summary",
    title: `${profile.name} | ${profile.role}`,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#11111b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${geist.variable} ${geistMono.variable}`} data-theme="dark">
      <body className="bg-mocha-crust font-sans text-mocha-text antialiased">{children}</body>
    </html>
  );
}
