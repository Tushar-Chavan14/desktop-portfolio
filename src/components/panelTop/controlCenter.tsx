"use client";
import React, { Fragment, useEffect, useRef, useState } from "react";
import Battery from "./components/battery";
import Network from "./components/network";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { FaPowerOff } from "react-icons/fa";
import Shutdown from "./components/shutDown";

const ControlCenter = () => {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [isOpen, setisOpen] = useState<boolean>(false);
  const [showModal, setshowModal] = useState<boolean>(false);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      setisOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Fragment>
      <Menu>
        {({ open }) => (
          <>
            <MenuButton
              ref={buttonRef}
              onClick={() => setisOpen(!isOpen)}
              className="inline-flex items-center gap-2 rounded-full bg-black panel-p-default text-sm font-semibold focus:outline-none data-[hover]:bg-gray-800 data-[open]:bg-gray-800 data-[focus]:outline-1 data-[focus]:outline-white"
            >
              <Network varrient={"icon"} />
              <Battery percentage={true} varrient={"icon"} />
            </MenuButton>

            <Transition
              show={isOpen}
              enter="transition ease-out duration-75"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <MenuItems
                ref={menuRef}
                anchor="bottom end"
                className="my-1 w-[16%] p-3 rounded-xl space-y-2 border border-white/5 bg-[#0f0f0f]/80 text-sm/6"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent the menu from closing
                }}
              >
                <MenuItem>
                  <div className="hover:bg-white/10 w-full cursor-default px-2 py-1 rounded-md">
                    <Network varrient={"info"} />
                  </div>
                </MenuItem>
                <MenuItem>
                  <div className="hover:bg-white/10 w-full px-2 py-1 cursor-default rounded-md">
                    <Battery percentage={true} varrient={"info"} />
                  </div>
                </MenuItem>
                <MenuItem>
                  <button
                    onClick={() => {
                      setshowModal((prev) => !prev);
                    }}
                    className=" flex gap-4 items-center hover:bg-white/10 w-full px-2 py-1 rounded-md"
                  >
                    <FaPowerOff /> power off
                  </button>
                </MenuItem>
              </MenuItems>
            </Transition>
          </>
        )}
      </Menu>
      <Shutdown showModal={showModal} setshowModal={setshowModal} />
    </Fragment>
  );
};

export default ControlCenter;
