"use client";
import {
  ButtonHTMLAttributes,
  MouseEventHandler,
  useRef,
  useState,
} from "react";
import { IconType } from "react-icons";
import { IoMdArrowBack } from "react-icons/io";
import { IoMdArrowForward } from "react-icons/io";
import { IoReload } from "react-icons/io5";

const useBrowserConfig = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [positon, setPosition] = useState<number>(0);

  const navigateTo = (url: string) => {
    iframeRef.current!.src = url;
    const stack = historyStack.slice(0, positon + 1);
    setHistoryStack((prev) => [...prev, url]);
    setPosition(stack?.length);
  };

  const goBack: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    if (positon > 0) {
      const url = historyStack[positon - 1];
      iframeRef.current!.src = url;
      setPosition(positon - 1);
    }
  };

  const goForward: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault;
    if (positon < historyStack.length - 1) {
      const url = historyStack[positon + 1];
      iframeRef.current!.src = url;
      setPosition(positon + 1);
    }
  };

  const handleReload: MouseEventHandler<HTMLButtonElement> = (e) => {
    iframeRef.current!.src = iframeRef.current!.src;
  };

  const buttons: Array<{
    key: string;
    icon: IconType;
    clickHandler: MouseEventHandler<HTMLButtonElement>;
    btnProps: ButtonHTMLAttributes<HTMLButtonElement>;
  }> = [
    {
      key: "back",
      icon: IoMdArrowBack,
      clickHandler: goBack,
      btnProps: {
        disabled: positon === 0,
      },
    },
    {
      key: "forward",
      icon: IoMdArrowForward,
      clickHandler: goForward,
      btnProps: {
        disabled: positon === 0 || positon == historyStack.length - 1,
      },
    },
    {
      key: "reload",
      icon: IoReload,
      clickHandler: handleReload,
      btnProps: {},
    },
  ];

  return {
    iframeRef,
    navigationButtons: buttons,
    historyStack,
    positon,
    navigateTo,
  };
};

export default useBrowserConfig;
