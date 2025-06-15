import TopPanel from "@src/components/panelTop";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ModalManager from "@src/components/modals/modalManger";
import WallpaperWrapper from "@src/components/wallpaperWrap";
import GlobalContextMenu from "@src/components/contextMenu/globalContextMenu";
import WindowManager from "@src/components/modals/windows/windowManger";
import BottomDock from "@src/components/dock/bottomDock";

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
          <WallpaperWrapper>
            <TopPanel />
            {children}
            <BottomDock />
          </WallpaperWrapper>
        </GlobalContextMenu>
        <ModalManager />
        <WindowManager />
      </body>
    </html>
  );
}
