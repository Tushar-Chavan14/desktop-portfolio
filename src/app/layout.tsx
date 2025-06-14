import GlobalContextMenu from "@src/components/contextMenu/ContxtMenu";
import TopPanel from "@src/components/panelTop";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
      <body className={`${inter.className}`}>
        <GlobalContextMenu>
          <div className="h-screen bg-planet bg-fixed bg-cover">
            <TopPanel />
            {children}
          </div>
        </GlobalContextMenu>
      </body>
    </html>
  );
}
