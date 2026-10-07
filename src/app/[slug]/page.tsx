import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apps, type AppId } from "@src/apps/meta";
import Desktop from "@src/components/shell/Desktop";
import PortfolioSummary from "@src/components/shell/PortfolioSummary";

// Every app is deep-linkable: /about, /projects, /resume, /terminal, ...
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(apps).map((slug) => ({ slug }));
}

const isAppId = (slug: string): slug is AppId => slug in apps;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!isAppId(slug)) return {};
  return { title: apps[slug].title, description: apps[slug].description };
}

export default async function AppPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isAppId(slug)) notFound();

  return (
    <>
      <PortfolioSummary />
      <Desktop initialApp={slug} />
    </>
  );
}
