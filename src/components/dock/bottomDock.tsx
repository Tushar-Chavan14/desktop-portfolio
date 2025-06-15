"use client";
import React from "react";
import { useDockConfig } from "./dockConfig";
import { Button } from "@heroui/react";
import Image from "next/image";

const BottomDock = () => {
  const { dockIcons } = useDockConfig();
  return (
    <div className="fixed bottom-2 left-0 w-full flex justify-center">
      <div className="flex items-center gap-4 bg-mocha-crust/80 h-14 px-2 w-fit backdrop:blur-3xl rounded-xl">
        {dockIcons.map((dock, idx) => (
          <div
            key={idx}
            onClick={dock?.clickHandler}
            className="h-11 flex items-center justify-center hover:-translate-y-3 hover:h-16 transition-all ease-in-out duration-200"
          >
            <Image src={dock.icon} alt={dock.name} className="h-full w-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BottomDock;
