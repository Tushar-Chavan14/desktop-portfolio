import chrome from "@src/assets/icons/chrome.svg";
import code from "@src/assets/icons/code.svg";
import github from "@src/assets/icons/github.svg";
import spotify from "@src/assets/icons/spotify.svg";
import terminal from "@src/assets/icons/terminal.svg";
import text from "@src/assets/icons/text.svg";
import useWindowStore from "@src/store/zustore/useWindowStore";
import { MouseEventHandler } from "react";
import { TextEditorWindow } from "../modals/windows/textEditorWindow";
import BrowserSimulator from "../browserSimulator/browserSimulator";

interface DockIcon {
  name: string;
  icon: string;
  url: string;
  type: "iframe" | "windowContent" | "none";
  clickHandler?: MouseEventHandler<HTMLDivElement>;
}

export const useDockConfig = () => {
  const { openWindow } = useWindowStore();

  const dockIcons: DockIcon[] = [
    {
      name: "Chrome",
      icon: chrome,
      url: "https://www.google.com/chrome/",
      type: "iframe",
      clickHandler: (e) => {
        e.preventDefault();
        openWindow({
          id: "chrome-browser",
          title: "Chrome",
          component: BrowserSimulator,
          props: {
            url: "https://www.google.com/webhp?igu=1",
          },
          initialWidth: 1200,
          initialHeight: 800,
          initialX: 100,
          initialY: 50,
          minWidth: 400,
          minHeight: 300,
          resizable: true,
          draggable: true,
        });
      },
    },
    {
      name: "Code",
      icon: code,
      url: "https://code.visualstudio.com/",
      type: "iframe",
      clickHandler: (e) => {
        e.preventDefault();
        openWindow({
          id: "code",
          title: "vscode",
          component: BrowserSimulator,
          props: {
            url: "https://github1s.com/Tushar-Chavan14/desktop-portfolio",
            showToolBar:false
          },
          initialWidth: 1200,
          initialHeight: 800,
          initialX: 100,
          initialY: 50,
          minWidth: 400,
          minHeight: 300,
          resizable: true,
          draggable: true,
        });
      },
    },
    {
      name: "Spotify",
      icon: spotify,
      url: "https://open.spotify.com/",
      type: "iframe",
      clickHandler: (e) => {
        e.preventDefault();
        openWindow({
          id: "spotify",
          title: "spotify",
          component: BrowserSimulator,
          props: {
            url: "https://open.spotify.com/embed/album/5KF4xCxDD8ip003hoatFT9?utm_source=generator&theme=0",
            showToolBar: false,
          },
          initialWidth: 500,
          initialHeight: 800,
          initialX: 100,
          initialY: 50,
          minWidth: 400,
          minHeight: 300,
          resizable: true,
          draggable: true,
        });
      },
    },
    {
      name: "Github",
      icon: github,
      url: "",
      type: "iframe",
      clickHandler: (e) => {
        e.preventDefault();
       window.open("https://github.com/Tushar-Chavan14", "_blank");
      },
    },
    {
      name: "Text Editor",
      icon: text,
      url: "https://www.sublimetext.com/",
      type: "windowContent",
      clickHandler: (e) => {
        e.preventDefault();
        openWindow({
          id: "text-editor-window",
          title: "Text Editor",
          component: TextEditorWindow,
          initialWidth: 800,
          initialHeight: 600,
          initialX: 100,
          initialY: 100,
          minWidth: 400,
          minHeight: 300,
          resizable: true,
          draggable: true,
        });
      },
    },
    {
      name: "Terminal",
      icon: terminal,
      url: "https://www.iterm2.com/",
      type: "none",
    },
  ];

  return {
    dockIcons,
  };
};
