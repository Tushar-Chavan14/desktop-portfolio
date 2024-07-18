import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopPanel from "@src/components/panelTop";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portfolio",
  description: "learn about tushar chavan's journey",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={inter.className + "h-screen bg-planet bg-fixed bg-cover"}
      >
        <TopPanel />
        {children}
      </body>
    </html>
  );
}
